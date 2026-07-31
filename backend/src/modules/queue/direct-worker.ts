import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { prisma } from '../../lib/prisma';
import { emitJobUpdate } from '../../lib/event-bus';
import { getStorage } from '../../lib/storage';

const DOWNLOAD_DIR = process.env.DOWNLOAD_DIR ?? path.join(process.cwd(), 'downloads');
if (!fs.existsSync(DOWNLOAD_DIR)) fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });

function getVideoCodec(filePath: string): Promise<string | null> {
  return new Promise((resolve) => {
    const proc = spawn('ffprobe', [
      '-v', 'quiet', '-print_format', 'json', '-show_streams', filePath,
    ]);
    let out = '';
    proc.stdout.on('data', (d: Buffer) => { out += d.toString(); });
    proc.on('close', () => {
      try {
        const streams = JSON.parse(out).streams as Array<{ codec_type: string; codec_name: string }>;
        const video = streams.find((s) => s.codec_type === 'video');
        resolve(video?.codec_name ?? null);
      } catch { resolve(null); }
    });
    proc.on('error', () => resolve(null));
  });
}

function transcodeToH264(inputPath: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn('ffmpeg', [
      '-i', inputPath,
      // CRF 17 = near-lossless for h264. CRF 23 (ffmpeg default) cuts 60-80%
      // of the bitrate on 4K VP9 content which is clearly visible as loss of
      // detail. Lower CRF = higher quality = larger file, which is expected.
      '-c:v', 'libx264', '-crf', '17', '-preset', 'medium',
      '-c:a', 'copy',
      '-movflags', '+faststart',
      '-y', outputPath,
    ]);
    proc.stderr.on('data', (d: Buffer) => process.stderr.write(`[ffmpeg] ${d}`));
    proc.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exit ${code}`))));
    proc.on('error', reject);
  });
}

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
  // qualityId is encoded as "fmtId:height:hasAudio" (from metadata service).
  // We use height-based format selection for all platforms so yt-dlp can prefer
  // h264 (avc) over VP9 — VP9 in an MP4 container is dropped by most players.
  const parts = qualityId.split(':');
  const height = parts.length >= 2 ? parseInt(parts[1], 10) : NaN;
  const h = !isNaN(height) && height > 0 ? height : 1080;

  const isCombined = parts.length >= 3 && parts[2] === '1';

  const args = [sourceUrl, '-o', outputTemplate, '--no-playlist', '--newline', '--js-runtimes', 'node'];
  if (audioOnly) {
    args.push('-x', '--audio-format', 'mp3');
  } else if (isCombined) {
    // Combined audio+video stream (Instagram, TikTok, Facebook).
    // These platforms do not publish separate video-only DASH tracks, so
    // bestvideo[height<=N]+bestaudio always fails. Use best[height<=N] which
    // matches the combined stream at the correct resolution.
    args.push(
      '-f', [
        `best[height<=${h}][vcodec^=avc][ext=mp4]`,
        `best[height<=${h}][ext=mp4]`,
        `best[height<=${h}]`,
        // Last resort: separate-stream merge in case metadata was wrong
        `bestvideo[height<=${h}]+bestaudio`,
        `best[vcodec!=none]`,
      ].join('/'),
      '--merge-output-format', 'mp4',
    );
  } else {
    // Separate video+audio DASH streams (YouTube, Vimeo, etc.).
    // Prefer h264 to avoid VP9-in-MP4 which most native players reject.
    args.push(
      '-f', [
        `bestvideo[height<=${h}][vcodec^=avc][ext=mp4]+bestaudio[ext=m4a]`,
        `bestvideo[height<=${h}][vcodec^=avc]+bestaudio`,
        `bestvideo[height<=${h}][ext=mp4]+bestaudio[ext=m4a]`,
        `bestvideo[height<=${h}]+bestaudio`,
        // Fallback to combined in case platform doesn't offer separate tracks
        `best[height<=${h}][ext=mp4]`,
        `best[height<=${h}]`,
        `bestvideo+bestaudio`,
        `best[vcodec!=none]`,
      ].join('/'),
      '--merge-output-format', 'mp4',
    );
  }

  console.log(`[direct-worker] yt-dlp args: ${args.join(' ')}`);

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

  // Locate output file
  const files = fs.readdirSync(DOWNLOAD_DIR).filter((f) => f.startsWith(jobId));
  let fileName = files[0] ?? `${jobId}.mp4`;
  let localPath = path.join(DOWNLOAD_DIR, fileName);

  // VP9 in an MP4 container is not playable in QuickTime or most native players.
  // Detect it post-download and re-encode to h264 so the MP4 is universally compatible.
  const videoCodec = await getVideoCodec(localPath);
  if (videoCodec === 'vp9' && localPath.endsWith('.mp4')) {
    console.log(`[direct-worker] VP9 detected — re-encoding to h264 for compatibility`);
    const h264Path = path.join(DOWNLOAD_DIR, `${jobId}_h264.mp4`);
    await transcodeToH264(localPath, h264Path);
    fs.unlinkSync(localPath);
    fs.renameSync(h264Path, localPath);
    console.log(`[direct-worker] Re-encode complete → ${fileName}`);
  }

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
