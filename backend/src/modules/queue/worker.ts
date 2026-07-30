import * as dotenv from 'dotenv';
dotenv.config();

import { Worker, Job } from 'bullmq';
import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { connection } from './queue.service';
import { prisma } from '../../lib/prisma';

const DOWNLOAD_DIR = process.env.DOWNLOAD_DIR ?? path.join(process.cwd(), 'downloads');
if (!fs.existsSync(DOWNLOAD_DIR)) fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });

interface JobData {
  jobId: string;
  sourceUrl: string;
  qualityId: string;
  audioOnly?: boolean;
}

function parseProgress(line: string): number | null {
  const match = line.match(/\[download\]\s+([\d.]+)%/);
  return match ? parseFloat(match[1]) : null;
}

function parseSpeed(line: string): string | null {
  const match = line.match(/([\d.]+\s*[KMG]iB\/s)/i);
  return match ? match[1] : null;
}

function parseEta(line: string): string | null {
  const match = line.match(/ETA\s+([\d:]+)/);
  return match ? match[1] : null;
}

async function processDownload(job: Job<JobData>) {
  const { jobId, sourceUrl, qualityId, audioOnly } = job.data;

  await prisma.downloadJob.update({
    where: { id: jobId },
    data: { status: 'downloading', progress: 0 },
  });

  const outputTemplate = path.join(DOWNLOAD_DIR, `${jobId}.%(ext)s`);

  const args = [
    sourceUrl,
    '-o', outputTemplate,
    '--no-playlist',
    '--newline',
  ];

  if (audioOnly) {
    args.push('-x', '--audio-format', 'mp3');
  } else {
    args.push('-f', `${qualityId}+bestaudio/best`);
  }

  await new Promise<void>((resolve, reject) => {
    const proc = spawn('yt-dlp', args, { env: { ...process.env, PYTHONUNBUFFERED: '1' } });

    proc.stdout.on('data', async (chunk: Buffer) => {
      const lines = chunk.toString().split('\n');
      for (const line of lines) {
        const progress = parseProgress(line);
        if (progress !== null) {
          const speed = parseSpeed(line);
          const eta = parseEta(line);
          try {
            await prisma.downloadJob.update({
              where: { id: jobId },
              data: {
                progress: Math.round(progress),
                ...(speed ? { speed } : {}),
                ...(eta ? { eta } : {}),
              },
            });
            await job.updateProgress(progress);
          } catch { /* db may be busy */ }
        }
      }
    });

    proc.stderr.on('data', (d: Buffer) => console.error(`[worker] yt-dlp stderr: ${d}`));
    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`yt-dlp exited with code ${code}`));
    });
    proc.on('error', reject);
  });

  // Find the output file
  const files = fs.readdirSync(DOWNLOAD_DIR).filter((f) => f.startsWith(jobId));
  const fileName = files[0] ?? `${jobId}.mp4`;
  const storagePath = path.join(DOWNLOAD_DIR, fileName);
  const stats = fs.existsSync(storagePath) ? fs.statSync(storagePath) : null;

  await prisma.downloadResult.create({
    data: {
      jobId,
      fileName,
      storagePath,
      fileSizeBytes: stats?.size ?? null,
    },
  });

  await prisma.downloadJob.update({
    where: { id: jobId },
    data: { status: 'completed', progress: 100 },
  });

  console.log(`[worker] Job ${jobId} completed → ${fileName}`);
}

const worker = new Worker<JobData>(
  'download-jobs',
  async (job) => {
    console.log(`[worker] Starting job ${job.data.jobId}`);
    try {
      await processDownload(job);
    } catch (err: unknown) {
      const e = err as Error;
      console.error(`[worker] Job ${job.data.jobId} failed:`, e.message);
      await prisma.downloadJob.update({
        where: { id: job.data.jobId },
        data: { status: 'failed', error: e.message },
      });
      throw err;
    }
  },
  { connection, concurrency: 3 }
);

worker.on('completed', (job) => console.log(`[worker] Job ${job.id} done`));
worker.on('failed', (job, err) => console.error(`[worker] Job ${job?.id} failed:`, err.message));

console.log('[worker] Download worker started — concurrency: 3');
