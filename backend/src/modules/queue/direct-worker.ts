import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { prisma } from '../../lib/prisma';
import { emitJobUpdate } from '../../lib/event-bus';
import { getStorage } from '../../lib/storage';
import { resolveYtDlpBinary, resolveFfmpegBinary, resolveFfprobeBinary } from '../../lib/binary';

const DOWNLOAD_DIR = process.env.DOWNLOAD_DIR ?? path.join(process.cwd(), 'downloads');
if (!fs.existsSync(DOWNLOAD_DIR)) fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });

interface VideoInfo {
  codec: string | null;
  durationSeconds: number | null;
}

function getVideoInfo(filePath: string): Promise<VideoInfo> {
  return new Promise((resolve) => {
    const ffprobeBin = resolveFfprobeBinary();
    const proc = spawn(ffprobeBin, [
      '-v', 'quiet', '-print_format', 'json', '-show_streams', '-show_format', filePath,
    ]);
    let out = '';
    proc.stdout.on('data', (d: Buffer) => { out += d.toString(); });
    proc.on('close', () => {
      try {
        const data = JSON.parse(out) as { streams: Array<{ codec_type: string; codec_name: string }>; format?: { duration?: string } };
        const video = data.streams.find((s) => s.codec_type === 'video');
        const dur = parseFloat(data.format?.duration ?? '0');
        resolve({ codec: video?.codec_name ?? null, durationSeconds: dur > 0 ? dur : null });
      } catch { resolve({ codec: null, durationSeconds: null }); }
    });
    proc.on('error', () => resolve({ codec: null, durationSeconds: null }));
  });
}

function transcodeToH264(
  inputPath: string,
  outputPath: string,
  jobId: string,
  durationSeconds: number | null,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const ffmpegBin = resolveFfmpegBinary();
    const proc = spawn(ffmpegBin, [
      '-i', inputPath,
      '-c:v', 'libx264', '-crf', '17', '-preset', 'faster',
      '-c:a', 'copy',
      '-movflags', '+faststart',
      '-y', outputPath,
    ]);

    proc.stderr.on('data', async (d: Buffer) => {
      const line = d.toString();
      process.stderr.write(`[ffmpeg] ${line}`);
      // Parse ffmpeg progress: "time=HH:MM:SS.ss"
      if (durationSeconds && durationSeconds > 0) {
        const m = line.match(/time=(\d+):(\d+):(\d+\.\d+)/);
        if (m) {
          const secs = parseInt(m[1]) * 3600 + parseInt(m[2]) * 60 + parseFloat(m[3]);
          const pct = Math.min(99, Math.round((secs / durationSeconds) * 100));
          try {
            await prisma.downloadJob.update({ where: { id: jobId }, data: { progress: pct } });
            emitJobUpdate({ id: jobId, status: 'processing', progress: pct, speed: null, eta: null, error: null });
          } catch { /* ignore */ }
        }
      }
    });

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

import archiver from 'archiver';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createArchive = (archiver as any).default || archiver;

function isPlaylistUrl(url: string): boolean {
  return /[?&]list=|(?:playlist|album|sets)\//i.test(url);
}

function zipDirectory(sourceDir: string, outZipPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outZipPath);
    const archive = createArchive('zip', { zlib: { level: 6 } });
    output.on('close', resolve);
    archive.on('error', reject);
    archive.pipe(output);
    archive.directory(sourceDir, false);
    archive.finalize();
  });
}

async function runJob(jobId: string, sourceUrl: string, qualityId: string, audioOnly: boolean) {
  await prisma.downloadJob.update({ where: { id: jobId }, data: { status: 'downloading', progress: 0 } });
  emitJobUpdate({ id: jobId, status: 'downloading', progress: 0, speed: null, eta: null, error: null });

  const isPlaylist = isPlaylistUrl(sourceUrl);
  const jobFolder = path.join(DOWNLOAD_DIR, jobId);

  const args: string[] = [
    '--newline',
    '--js-runtimes', 'deno,node',
    '--remote-components', 'ejs:github',
    '--extractor-args', 'youtube:player_client=default,-tv;formats=missing_pot',
    '--no-check-certificates',
    '--geo-bypass',
  ];

  // Auto-detect cookies if provided via Render Secret Files or Environment Variable
  // Note: Render mounts /etc/secrets as read-only. yt-dlp tries to write/update session cookies,
  // causing "Errno 30 Read-only file system". We copy to writable DOWNLOAD_DIR first!
  const writableCookiesPath = path.join(DOWNLOAD_DIR, 'cookies.txt');
  const renderSecretCookies = '/etc/secrets/cookies.txt';
  const customCookiesPath = process.env.COOKIES_PATH;

  if (fs.existsSync(renderSecretCookies)) {
    try {
      fs.copyFileSync(renderSecretCookies, writableCookiesPath);
      args.push('--cookies', writableCookiesPath);
    } catch {
      args.push('--cookies', renderSecretCookies);
    }
  } else if (customCookiesPath && fs.existsSync(customCookiesPath)) {
    try {
      fs.copyFileSync(customCookiesPath, writableCookiesPath);
      args.push('--cookies', writableCookiesPath);
    } catch {
      args.push('--cookies', customCookiesPath);
    }
  } else if (process.env.COOKIES_B64) {
    try {
      fs.writeFileSync(writableCookiesPath, Buffer.from(process.env.COOKIES_B64, 'base64').toString('utf-8'));
      args.push('--cookies', writableCookiesPath);
    } catch { /* ignore */ }
  } else if (fs.existsSync(writableCookiesPath)) {
    args.push('--cookies', writableCookiesPath);
  }

  let outputTemplate: string;
  if (isPlaylist) {
    if (!fs.existsSync(jobFolder)) fs.mkdirSync(jobFolder, { recursive: true });
    outputTemplate = path.join(jobFolder, '%(playlist_index)02d - %(title)s.%(ext)s');
    args.push('-o', outputTemplate, '--yes-playlist');
  } else {
    outputTemplate = path.join(DOWNLOAD_DIR, `${jobId}.%(ext)s`);
    args.push('-o', outputTemplate, '--no-playlist');
  }

  // Determine format flags
  if (audioOnly) {
    let audioFormat = 'mp3';
    let audioQuality = '320k';

    if (qualityId.includes('flac')) {
      audioFormat = 'flac';
    } else if (qualityId.includes('m4a')) {
      audioFormat = 'm4a';
    } else if (qualityId.includes('192')) {
      audioQuality = '192k';
    }

    args.push(
      '-x',
      '--audio-format', audioFormat,
      '--audio-quality', audioQuality,
      '--embed-thumbnail',
      '--add-metadata'
    );
  } else {
    let h = 1080;
    if (qualityId.includes(':')) {
      const parts = qualityId.split(':');
      const parsedH = parts.length >= 2 ? parseInt(parts[1], 10) : NaN;
      if (!isNaN(parsedH) && parsedH > 0) h = parsedH;
    } else {
      const parsedH = parseInt(qualityId.replace(/[^0-9]/g, ''), 10);
      if (!isNaN(parsedH) && parsedH > 0) h = parsedH;
    }

    args.push(
      '-f', `bestvideo[height<=${h}]+bestaudio/best[height<=${h}]/best`,
      '--format-sort', 'height,br',
      '--merge-output-format', 'mp4'
    );
  }

  const ffmpegLocation = resolveFfmpegBinary();
  if (ffmpegLocation && ffmpegLocation !== 'ffmpeg') {
    args.push('--ffmpeg-location', path.dirname(ffmpegLocation));
  }

  // Argument injection defense: separate options from the target URL
  args.push('--', sourceUrl);

  console.log(`[direct-worker] yt-dlp args: ${args.join(' ')}`);

  await new Promise<void>((resolve, reject) => {
    const binary = resolveYtDlpBinary();
    const proc = spawn(binary, args, { env: { ...process.env, PYTHONUNBUFFERED: '1' } });

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

    const stderrLines: string[] = [];
    proc.stderr.on('data', (d: Buffer) => {
      const text = d.toString();
      stderrLines.push(text);
      process.stderr.write(`[direct-worker] ${text}`);
    });
    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        const errorDetail = stderrLines.join('').trim().split('\n').filter(Boolean).slice(-3).join(' ') || `Exit code ${code}`;
        reject(new Error(errorDetail));
      }
    });
    proc.on('error', reject);
  });

  let fileName: string;
  let localPath: string;

  if (isPlaylist) {
    // Switch status to packaging zip
    await prisma.downloadJob.update({ where: { id: jobId }, data: { status: 'processing', progress: 95 } });
    emitJobUpdate({ id: jobId, status: 'processing', progress: 95, speed: null, eta: null, error: null });

    fileName = `${jobId}_album.zip`;
    localPath = path.join(DOWNLOAD_DIR, fileName);
    await zipDirectory(jobFolder, localPath);

    // Clean up temporary folder
    try {
      fs.rmSync(jobFolder, { recursive: true, force: true });
    } catch { /* ignore */ }
  } else {
    // Locate single output file
    const files = fs.readdirSync(DOWNLOAD_DIR).filter((f) => f.startsWith(jobId) && !f.endsWith('.tmp'));
    fileName = files[0] ?? `${jobId}.${audioOnly ? 'mp3' : 'mp4'}`;
    localPath = path.join(DOWNLOAD_DIR, fileName);

    if (!audioOnly && localPath.endsWith('.mp4')) {
      const { codec: videoCodec, durationSeconds } = await getVideoInfo(localPath);
      if (videoCodec === 'vp9' || videoCodec === 'av1') {
        console.log(`[direct-worker] ${videoCodec.toUpperCase()} detected — re-encoding to h264 (${durationSeconds?.toFixed(0) ?? '?'}s)`);
        const stillExists = await prisma.downloadJob.findUnique({ where: { id: jobId } });
        if (stillExists) {
          await prisma.downloadJob.update({ where: { id: jobId }, data: { status: 'processing', progress: 0 } });
          emitJobUpdate({ id: jobId, status: 'processing', progress: 0, speed: null, eta: null, error: null });
          const h264Path = path.join(DOWNLOAD_DIR, `${jobId}_h264.mp4`);
          await transcodeToH264(localPath, h264Path, jobId, durationSeconds);
          try { fs.unlinkSync(localPath); } catch { /* ignore */ }
          fs.renameSync(h264Path, localPath);
          console.log(`[direct-worker] Re-encode complete → ${fileName}`);
        }
      }
    }
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
      try {
        await prisma.downloadJob.update({ where: { id: job.id }, data: { status: 'queued', progress: 0 } });
        emitJobUpdate({ id: job.id, status: 'queued', progress: 0, speed: null, eta: null, error: null });
      } catch { /* job was deleted — nothing to requeue */ }
      setTimeout(() => { running = false; void processNext(); }, delay);
      return;
    }

    // All attempts exhausted
    try {
      await prisma.downloadJob.update({ where: { id: job.id }, data: { status: 'failed', error: e.message } });
      emitJobUpdate({ id: job.id, status: 'failed', progress: 0, speed: null, eta: null, error: e.message });
    } catch { /* job was deleted — nothing to mark failed */ }
    attempts.delete(job.id);
  } finally {
    if (running) running = false;
  }
}

export function startDirectWorker(intervalMs = 3000) {
  console.log(`[direct-worker] Started — polling every ${intervalMs}ms, max ${MAX_ATTEMPTS} attempts per job`);
  setInterval(() => { void processNext(); }, intervalMs);
}
