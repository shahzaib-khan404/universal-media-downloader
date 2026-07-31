import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { prisma } from '../../lib/prisma';
import { emitJobUpdate } from '../../lib/event-bus';
import { getStorage } from '../../lib/storage';

const DOWNLOAD_DIR = process.env.DOWNLOAD_DIR ?? path.join(process.cwd(), 'downloads');
if (!fs.existsSync(DOWNLOAD_DIR)) fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });

const MAX_ATTEMPTS = 3;
let running = false;

// Track per-job attempt counts in memory
const attempts = new Map<string, number>();

function parseProgress(line: string): number | null {
  const m = line.match(/\[download\]\s+([\d.]+)%/);
  return m ? parseFloat(m[1]) : null;
}
function parseSpeed(line: string): string | null {
  const m = line.match(/([\d.]+ ?[KMG]iB\/s)/i);
  return m ? m[1] : null;
}
function parseEta(line: string): string | null {
  const m = line.match(/ETA\s+([\d:]+)/);
  return m ? m[1] : null;
}

async function runJob(jobId: string, sourceUrl: string, qualityId: string, audioOnly: boolean) {
  await prisma.downloadJob.update({ where: { id: jobId }, data: { status: 'downloading', progress: 0 } });
  emitJobUpdate({ id: jobId, status: 'downloading', progress: 0, speed: null, eta: null, error: null });

  const outputTemplate = path.join(DOWNLOAD_DIR, `${jobId}.%(ext)s`);
  const args = [sourceUrl, '-o', outputTemplate, '--no-playlist', '--newline', '--js-runtimes', 'node'];
  if (audioOnly) {
    args.push('-x', '--audio-format', 'mp3');
  } else {
    args.push(
      '-f', `${qualityId}+bestaudio[ext=m4a]/${qualityId}+bestaudio/best[ext=mp4]/best`,
      '--merge-output-format', 'mp4',
    );
  }

  await new Promise<void>((resolve, reject) => {
    const proc = spawn('yt-dlp', args, { env: { ...process.env, PYTHONUNBUFFERED: '1' } });

    proc.stdout.on('data', async (chunk: Buffer) => {
      for (const line of chunk.toString().split('\n')) {
        const progress = parseProgress(line);
        if (progress !== null) {
          const speed = parseSpeed(line);
          const eta = parseEta(line);
          try {
            await prisma.downloadJob.update({
              where: { id: jobId },
              data: { progress: Math.round(progress), speed: speed ?? undefined, eta: eta ?? undefined },
            });
            emitJobUpdate({ id: jobId, status: 'downloading', progress: Math.round(progress), speed, eta, error: null });
          } catch { /* ignore */ }
        }
      }
    });

    proc.stderr.on('data', (d: Buffer) => process.stderr.write(`[direct-worker] ${d}`));
    proc.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`yt-dlp exit ${code}`))));
    proc.on('error', reject);
  });

  // Locate output file and persist via storage abstraction
  const files = fs.readdirSync(DOWNLOAD_DIR).filter((f) => f.startsWith(jobId));
  const fileName = files[0] ?? `${jobId}.mp4`;
  const localPath = path.join(DOWNLOAD_DIR, fileName);

  const storage = getStorage();
  const storageKey = await storage.save(localPath, fileName);
  const sizeBytes = await storage.sizeBytes(storageKey);

  await prisma.downloadResult.create({
    data: { jobId, fileName, storagePath: storageKey, fileSizeBytes: sizeBytes },
  });
  await prisma.downloadJob.update({ where: { id: jobId }, data: { status: 'completed', progress: 100 } });

  emitJobUpdate({ id: jobId, status: 'completed', progress: 100, speed: null, eta: null, error: null });
  console.log(`[direct-worker] ✓ Job ${jobId} → ${fileName}`);
}

async function processNext() {
  if (running) return;

  const job = await prisma.downloadJob.findFirst({
    where: { status: 'queued' },
    orderBy: { createdAt: 'asc' },
  });
  if (!job) return;

  running = true;
  const jobAttempts = (attempts.get(job.id) ?? 0) + 1;
  attempts.set(job.id, jobAttempts);

  try {
    await runJob(job.id, job.sourceUrl, job.qualityId, job.audioOnly);
    attempts.delete(job.id);
  } catch (err: unknown) {
    const e = err as Error;
    console.error(`[direct-worker] ✗ Job ${job.id} attempt ${jobAttempts}/${MAX_ATTEMPTS}:`, e.message);

    if (jobAttempts < MAX_ATTEMPTS) {
      // Requeue with exponential backoff delay
      const delay = Math.pow(2, jobAttempts) * 3000;
      console.log(`[direct-worker] Retrying job ${job.id} in ${delay / 1000}s`);
      await prisma.downloadJob.update({ where: { id: job.id }, data: { status: 'queued', progress: 0 } });
      emitJobUpdate({ id: job.id, status: 'queued', progress: 0, speed: null, eta: null, error: null });
      setTimeout(() => { running = false; void processNext(); }, delay);
      return;
    }

    // All attempts exhausted
    await prisma.downloadJob.update({ where: { id: job.id }, data: { status: 'failed', error: e.message } });
    emitJobUpdate({ id: job.id, status: 'failed', progress: 0, speed: null, eta: null, error: e.message });
    attempts.delete(job.id);
  } finally {
    if (running) running = false;
  }
}

export function startDirectWorker(intervalMs = 3000) {
  console.log(`[direct-worker] Started — polling every ${intervalMs}ms, max ${MAX_ATTEMPTS} attempts per job`);
  setInterval(() => { void processNext(); }, intervalMs);
}
