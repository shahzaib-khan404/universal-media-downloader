import { spawn } from 'child_process';
import { prisma } from '../../lib/prisma';
import { downloadQueue } from '../queue/queue.service';

interface YtDlpInfo {
  title?: string;
  channel?: string;
  uploader?: string;
  view_count?: number;
  upload_date?: string;
  duration?: number;
  thumbnail?: string;
  webpage_url?: string;
  extractor?: string;
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

function runYtDlp(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    let stdout = '';
    let stderr = '';
    const proc = spawn('yt-dlp', args, { env: { ...process.env, PYTHONUNBUFFERED: '1' } });
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
    const json = await runYtDlp(['--dump-json', '--no-playlist', url]);
    return JSON.parse(json) as YtDlpInfo;
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
      .map((f) => ({
        id: f.format_id,
        label: `${f.height}p`,
        resolution: `${f.width ?? '?'}×${f.height}`,
        codec: f.vcodec ?? 'unknown',
        fps: f.fps ? `${f.fps} fps` : undefined,
        container: f.ext,
        estimatedSize: f.filesize
          ? `${(f.filesize / 1024 / 1024).toFixed(0)} MB`
          : f.filesize_approx
          ? `~${(f.filesize_approx / 1024 / 1024).toFixed(0)} MB`
          : 'unknown',
        features: [f.format_note ?? '', (f.height ?? 0) >= 2160 ? '4K' : (f.height ?? 0) >= 1080 ? 'HD' : 'SD'].filter(Boolean),
        recommended: f.height === 1080,
      }));

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
  }) {
    const job = await prisma.downloadJob.create({
      data: {
        sourceUrl: data.sourceUrl,
        qualityId: data.qualityId,
        audioOnly: data.audioOnly ?? false,
        userId: data.userId ?? null,
        status: 'queued',
      },
    });

    await downloadQueue.add('download', { jobId: job.id, ...data }, {
      removeOnComplete: { count: 100 },
      removeOnFail: false,
    });

    return job;
  },

  async getJob(id: string) {
    const job = await prisma.downloadJob.findUnique({
      where: { id },
      include: { result: true },
    });
    if (!job) throw Object.assign(new Error('Job not found'), { statusCode: 404 });
    return job;
  },

  async listJobs(userId?: string) {
    return prisma.downloadJob.findMany({
      where: userId ? { userId } : {},
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { result: true },
    });
  },

  async deleteJob(id: string, userId?: string) {
    const job = await prisma.downloadJob.findUnique({ where: { id } });
    if (!job) throw Object.assign(new Error('Job not found'), { statusCode: 404 });
    if (userId && job.userId !== userId) {
      throw Object.assign(new Error('Forbidden'), { statusCode: 403 });
    }
    await prisma.downloadResult.deleteMany({ where: { jobId: id } });
    await prisma.downloadJob.delete({ where: { id } });
  },
};
