import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { prisma } from '../../lib/prisma';
import { downloadQueue } from '../queue/queue.service';

export interface PlaylistEntry {
  id: string;
  title: string;
  duration?: number;
  url?: string;
  channel?: string;
  thumbnail?: string;
}

export interface YtDlpInfo {
  id?: string;
  _type?: string;
  title?: string;
  channel?: string;
  uploader?: string;
  view_count?: number;
  upload_date?: string;
  duration?: number;
  thumbnail?: string;
  webpage_url?: string;
  extractor?: string;
  is_playlist?: boolean;
  entries?: PlaylistEntry[];
  formats?: Array<{
    format_id: string;
    ext: string;
    height?: number;
    width?: number;
    vcodec?: string;
    acodec?: string;
    fps?: number;
    filesize?: number;
    filesize_approx?: number;
    tbr?: number;
    abr?: number;
    format_note?: string;
  }>;
}

import { resolveYtDlpBinary } from '../../lib/binary';

function isPlaylistUrl(url: string): boolean {
  return /[?&]list=|(?:playlist|album|sets)\//i.test(url);
}

function runYtDlp(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    let stdout = '';
    let stderr = '';
    const binary = resolveYtDlpBinary();
    const proc = spawn(binary, args, { env: { ...process.env, PYTHONUNBUFFERED: '1' } });
    proc.stdout.on('data', (d: Buffer) => { stdout += d.toString(); });
    proc.stderr.on('data', (d: Buffer) => { stderr += d.toString(); });
    proc.on('close', (code) => {
      if (code === 0) resolve(stdout);
      else reject(new Error(stderr || `yt-dlp exited with code ${code}`));
    });
    proc.on('error', (err) => reject(err));
  });
}

export const downloadsService = {
  async fetchMetadata(url: string): Promise<YtDlpInfo> {
    const isPlaylist = isPlaylistUrl(url);
    // Industry standard client rotation (Smart TV & Android InnerTube)
    // TVHTML5_SIMPLY_EMBEDDED_PLAYER and Android VR are immune to YouTube's "Sign in to confirm you're not a bot" challenge
    const antiBlockFlags = [
      '--remote-components', 'ejs:github',
      '--extractor-args', 'youtube:player_client=default,-tv;formats=missing_pot',
      '--no-check-certificates',
      '--geo-bypass',
    ];

    const downloadDir = process.env.DOWNLOAD_DIR || '/downloads';
    const writableCookiesPath = path.join(downloadDir, 'cookies.txt');
    const renderSecretCookies = '/etc/secrets/cookies.txt';

    if (process.env.COOKIES_B64) {
      try {
        if (!fs.existsSync(downloadDir)) fs.mkdirSync(downloadDir, { recursive: true });
        fs.writeFileSync(writableCookiesPath, Buffer.from(process.env.COOKIES_B64, 'base64').toString('utf-8'));
        antiBlockFlags.push('--cookies', writableCookiesPath);
      } catch { /* ignore */ }
    } else if (fs.existsSync(renderSecretCookies)) {
      try {
        if (!fs.existsSync(downloadDir)) fs.mkdirSync(downloadDir, { recursive: true });
        fs.copyFileSync(renderSecretCookies, writableCookiesPath);
        antiBlockFlags.push('--cookies', writableCookiesPath);
      } catch {
        antiBlockFlags.push('--cookies', renderSecretCookies);
      }
    } else if (fs.existsSync(writableCookiesPath)) {
      antiBlockFlags.push('--cookies', writableCookiesPath);
    }

    try {
      if (isPlaylist) {
        const json = await runYtDlp([
          ...antiBlockFlags,
          '--flat-playlist',
          '--dump-single-json',
          '--js-runtimes', 'node',
          '--', url,
        ]);
        const data = JSON.parse(json) as YtDlpInfo;
        data.is_playlist = true;
        return data;
      }

      const json = await runYtDlp([
        ...antiBlockFlags,
        '--dump-json',
        '--no-playlist',
        '--js-runtimes', 'node',
        '--', url,
      ]);
      return JSON.parse(json) as YtDlpInfo;
    } catch (err: unknown) {
      const errStr = err instanceof Error ? err.message : String(err);
      console.warn('[yt-dlp blocked or failed, attempting Invidious/Piped mirror fallback]:', errStr);

      // Extract YouTube Video ID
      const videoIdMatch = url.match(/(?:youtu\.be\/|v=|\/embed\/|\/live\/|\/shorts\/)([a-zA-Z0-9_-]{11})/);
      if (videoIdMatch && videoIdMatch[1]) {
        const id = videoIdMatch[1];
        const instances = [
          `https://api.invidious.io/api/v1/videos/${id}`,
          `https://pipedapi.kavin.rocks/streams/${id}`,
          `https://invidious.nerdvpn.de/api/v1/videos/${id}`,
          `https://inv.nadeko.net/api/v1/videos/${id}`,
        ];

        for (const endpoint of instances) {
          try {
            const resp = await fetch(endpoint, {
              headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
              signal: AbortSignal.timeout(6000),
            });
            if (resp.ok) {
              const inv = (await resp.json()) as any;
              const title = inv.title ?? 'YouTube Video';
              const formats: Array<{
                format_id: string;
                ext: string;
                height?: number;
                width?: number;
                vcodec?: string;
                acodec?: string;
                fps?: number;
              }> = [];

              // Map formatStreams or videoStreams
              const streamList = inv.formatStreams || inv.videoStreams || [];
              for (const s of streamList) {
                const h = parseInt(s.quality || s.resolution || '720', 10);
                if (h > 0) {
                  formats.push({
                    format_id: s.itag ? String(s.itag) : `${h}p`,
                    ext: s.container || s.mimeType?.includes('webm') ? 'webm' : 'mp4',
                    height: h,
                    width: Math.round((h * 16) / 9),
                    vcodec: s.codec || 'h264',
                    acodec: 'aac',
                    fps: s.fps || 30,
                  });
                }
              }

              // Ensure at least standard standard fallback resolutions exist
              if (formats.length === 0) {
                formats.push(
                  { format_id: '1080p', ext: 'mp4', height: 1080, width: 1920, vcodec: 'h264', acodec: 'aac', fps: 30 },
                  { format_id: '720p', ext: 'mp4', height: 720, width: 1280, vcodec: 'h264', acodec: 'aac', fps: 30 },
                  { format_id: '480p', ext: 'mp4', height: 480, width: 854, vcodec: 'h264', acodec: 'aac', fps: 30 },
                  { format_id: '360p', ext: 'mp4', height: 360, width: 640, vcodec: 'h264', acodec: 'aac', fps: 30 }
                );
              }

              return {
                title,
                channel: inv.author ?? inv.uploader ?? 'Artist',
                uploader: inv.author ?? inv.uploader ?? 'Artist',
                duration: inv.lengthSeconds ?? 0,
                thumbnail: inv.videoThumbnails?.[0]?.url ?? `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
                webpage_url: url,
                extractor: 'youtube',
                formats,
              };
            }
          } catch {
            // try next mirror
          }
        }
      }

      // If all mirrors fail, rethrow original error
      throw err;
    }
  },

  buildQualityOptions(info: YtDlpInfo) {
    const formats = info.formats ?? [];
    const videoFormats = formats
      .filter((f) => f.height && f.vcodec && f.vcodec !== 'none')
      .sort((a, b) => (b.height ?? 0) - (a.height ?? 0));

    const seen = new Set<number>();
    const quality = videoFormats
      .filter((f) => {
        if (!f.height || seen.has(f.height)) return false;
        seen.add(f.height);
        return true;
      })
      .slice(0, 6)
      .map((f) => {
        const h = f.height ?? 0;
        // Honest resolution tier based on actual pixel height.
        // format_note from yt-dlp is platform-specific (e.g. "2K", "Premium",
        // "DASH") and frequently does not match the downloaded output — omitted.
        const tier =
          h >= 4320 ? '8K' :
          h >= 2160 ? '4K UHD' :
          h >= 1440 ? 'QHD' :
          h >= 1080 ? 'Full HD' :
          h >= 720  ? 'HD' : 'SD';
        return {
          id: `${f.format_id}:${h}:${f.acodec && f.acodec !== 'none' ? '1' : '0'}`,
          label: `${h}p`,
          resolution: `${f.width ?? '?'}×${h}`,
          codec: f.vcodec ?? 'unknown',
          fps: f.fps ? `${f.fps} fps` : undefined,
          container: f.ext,
          // estimatedSize is intentionally omitted: the value yt-dlp provides
          // is for the video-only DASH stream before audio is merged. With our
          // multi-format fallback chain the actual merged file can differ by
          // 5–10× — showing it would mislead users.
          estimatedSize: null,
          features: [tier],
          recommended: h === 1080,
        };
      });

    const audioFormats = formats
      .filter((f) => f.acodec && f.acodec !== 'none' && (!f.vcodec || f.vcodec === 'none'))
      .slice(0, 4)
      .map((f) => ({
        id: f.format_id,
        format: f.ext.toUpperCase(),
        label: f.format_note ?? 'Standard',
        bitrate: f.abr ? `${Math.round(f.abr)} kbps` : 'unknown',
        estimatedSize: f.filesize
          ? `${(f.filesize / 1024 / 1024).toFixed(1)} MB`
          : 'unknown',
      }));

    return { quality, audio: audioFormats };
  },

  async enqueueDownload(data: {
    sourceUrl: string;
    qualityId: string;
    audioOnly?: boolean;
    userId?: string;
    visitorId?: string;
  }) {
    const job = await prisma.downloadJob.create({
      data: {
        sourceUrl: data.sourceUrl,
        qualityId: data.qualityId,
        audioOnly: data.audioOnly ?? false,
        userId: data.userId ?? null,
        visitorId: data.visitorId ?? null,
        status: 'queued',
      },
    });

    // Only add to BullMQ Redis queue if NOT using the direct worker
    if (process.env.DIRECT_WORKER === 'false') {
      await downloadQueue.add('download', { jobId: job.id, ...data }, {
        removeOnComplete: { count: 100 },
        removeOnFail: false,
      });
    }

    return job;
  },

  sanitizeJob(job: {
    id: string;
    userId: string | null;
    visitorId?: string | null;
    sourceUrl: string;
    qualityId: string;
    audioOnly: boolean;
    status: string;
    progress: number;
    speed: string | null;
    eta: string | null;
    error: string | null;
    createdAt: Date;
    updatedAt: Date;
    result?: {
      fileName: string;
      fileSizeBytes: number | null;
      resolution: string | null;
      codec: string | null;
      completedAt: Date;
    } | null;
  }) {
    return {
      id: job.id,
      sourceUrl: job.sourceUrl,
      qualityId: job.qualityId,
      audioOnly: job.audioOnly,
      status: job.status,
      progress: job.progress,
      speed: job.speed,
      eta: job.eta,
      error: job.error,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      result: job.result ? {
        fileName: job.result.fileName,
        fileSizeBytes: job.result.fileSizeBytes,
        resolution: job.result.resolution,
        codec: job.result.codec,
        completedAt: job.result.completedAt,
      } : null,
    };
  },

  async getJob(id: string, caller: { userId?: string; visitorId?: string }) {
    const job = await prisma.downloadJob.findUnique({
      where: { id },
      include: { result: true },
    });
    // Return 404 (not 403) so IDs can't be probed
    if (!job) throw Object.assign(new Error('Job not found'), { statusCode: 404 });

    const isOwner =
      (!job.userId && !job.visitorId) ||
      (caller.userId && job.userId === caller.userId) ||
      (caller.visitorId && job.visitorId === caller.visitorId);

    if (!isOwner) {
      throw Object.assign(new Error('Job not found'), { statusCode: 404 });
    }
    return this.sanitizeJob(job);
  },

  async listJobs(caller: { userId?: string; visitorId?: string }) {
    const conditions: Array<{ userId?: string; visitorId?: string }> = [];
    if (caller.userId) conditions.push({ userId: caller.userId });
    if (caller.visitorId) conditions.push({ visitorId: caller.visitorId });
    if (conditions.length === 0) return [];

    const jobs = await prisma.downloadJob.findMany({
      where: { OR: conditions },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { result: true },
    });
    return jobs.map((j) => this.sanitizeJob(j));
  },

  async deleteJob(id: string, caller: { userId?: string; visitorId?: string }) {
    const job = await prisma.downloadJob.findUnique({ where: { id } });
    if (!job) throw Object.assign(new Error('Job not found'), { statusCode: 404 });

    const isOwner =
      (!job.userId && !job.visitorId) ||
      (caller.userId && job.userId === caller.userId) ||
      (caller.visitorId && job.visitorId === caller.visitorId);

    if (!isOwner) {
      throw Object.assign(new Error('Job not found'), { statusCode: 404 });
    }
    await prisma.downloadResult.deleteMany({ where: { jobId: id } });
    await prisma.downloadJob.delete({ where: { id } });
  },
};
