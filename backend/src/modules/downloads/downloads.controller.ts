import type { FastifyReply, FastifyRequest } from 'fastify';
import * as path from 'path';
import { downloadsService } from './downloads.service';
import { prisma } from '../../lib/prisma';
import { subscribeToJob } from '../../lib/event-bus';
import { getStorage } from '../../lib/storage';
import { isAllowedUrl } from '../../lib/security';

export const downloadsController = {
  fetchMetadata: async (request: FastifyRequest, reply: FastifyReply) => {
    const { url } = request.body as { url?: string };
    if (!url) return reply.status(400).send({ message: 'url is required' });
    if (!isAllowedUrl(url)) {
      return reply.status(400).send({ message: 'Invalid or forbidden URL. Only public HTTP/HTTPS URLs are allowed.' });
    }
    try {
      const info = await downloadsService.fetchMetadata(url);
      const isPlaylist = Boolean(info.is_playlist || (info.entries && info.entries.length > 0));

      // Preset quality & audio options for playlist/album downloads
      const defaultPlaylistQuality = [
        { id: '1080p', label: '1080p Full HD', resolution: '1920×1080', codec: 'H.264', container: 'mp4', features: ['Full HD'], recommended: true },
        { id: '720p', label: '720p HD', resolution: '1280×720', codec: 'H.264', container: 'mp4', features: ['HD'], recommended: false },
        { id: '480p', label: '480p SD', resolution: '854×480', codec: 'H.264', container: 'mp4', features: ['SD'], recommended: false },
      ];

      const defaultPlaylistAudio = [
        { id: 'mp3_320', format: 'MP3', label: '320 kbps (High Quality)', bitrate: '320 kbps' },
        { id: 'mp3_192', format: 'MP3', label: '192 kbps (Standard)', bitrate: '192 kbps' },
        { id: 'm4a', format: 'M4A', label: 'AAC Audio', bitrate: '256 kbps' },
        { id: 'flac', format: 'FLAC', label: 'Lossless Audio', bitrate: 'Lossless' },
      ];

      const { quality, audio } = isPlaylist
        ? { quality: defaultPlaylistQuality, audio: defaultPlaylistAudio }
        : downloadsService.buildQualityOptions(info);

      // Format upload_date (e.g., 20050424 -> 24 Apr 2005)
      let formattedDate: string | null = null;
      if (info.upload_date && /^\d{8}$/.test(info.upload_date)) {
        const y = info.upload_date.slice(0, 4);
        const m = info.upload_date.slice(4, 6);
        const d = info.upload_date.slice(6, 8);
        const dateObj = new Date(`${y}-${m}-${d}`);
        if (!isNaN(dateObj.getTime())) {
          formattedDate = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        }
      }

      return reply.send({
        id: info.id ?? info.extractor ?? 'unknown',
        title: info.title ?? 'Untitled',
        channel: info.channel ?? info.uploader ?? 'Unknown',
        platform: info.extractor ?? 'unknown',
        views: info.view_count ?? 0,
        uploadedAt: formattedDate ?? info.upload_date ?? null,
        thumbnail: info.thumbnail ?? null,
        duration: info.duration ?? 0,
        isPlaylist,
        entries: info.entries?.map((e, index) => ({
          id: e.id,
          index: index + 1,
          title: e.title,
          duration: e.duration ?? 0,
          url: e.url,
          channel: e.channel,
        })) ?? [],
        quality,
        audio,
      });
    } catch (err: unknown) {
      const e = err as { message: string; statusCode?: number };
      return reply.status(e.statusCode ?? 502).send({ message: e.message });
    }
  },

  createJob: async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.body as {
      url?: string;
      qualityId?: string;
      audioOnly?: boolean;
    };
    if (!payload.url) return reply.status(400).send({ message: 'url is required' });
    if (!isAllowedUrl(payload.url)) {
      return reply.status(400).send({ message: 'Invalid or forbidden URL. Only public HTTP/HTTPS URLs are allowed.' });
    }
    if (!payload.qualityId) return reply.status(400).send({ message: 'qualityId is required' });

    // Optionally extract the authenticated user so the job is attributed to them
    try { await request.jwtVerify(); } catch { /* anonymous download — no user attached */ }
    const user = request.user as { id: string } | undefined;
    const visitorId = (request as unknown as Record<string, unknown>).visitorId as string | undefined;
    const ownerId = user?.id || visitorId;

    try {
      const job = await downloadsService.enqueueDownload({
        sourceUrl: payload.url,
        qualityId: payload.qualityId,
        audioOnly: payload.audioOnly,
        userId: ownerId,
      });
      return reply.status(201).send({ jobId: job.id, status: job.status });
    } catch (err: unknown) {
      const e = err as { message: string; statusCode?: number };
      return reply.status(e.statusCode ?? 500).send({ message: e.message });
    }
  },

  getJob: async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    try { await request.jwtVerify(); } catch { /* anonymous */ }
    const user = request.user as { id: string } | undefined;
    const visitorId = (request as unknown as Record<string, unknown>).visitorId as string | undefined;
    const ownerId = user?.id || visitorId;

    try {
      const job = await downloadsService.getJob(id, ownerId);
      return reply.send(job);
    } catch (err: unknown) {
      const e = err as { message: string; statusCode?: number };
      return reply.status(e.statusCode ?? 500).send({ message: e.message });
    }
  },

  listJobs: async (request: FastifyRequest, reply: FastifyReply) => {
    try { await request.jwtVerify(); } catch { /* anonymous */ }
    const user = request.user as { id: string } | undefined;
    const visitorId = (request as unknown as Record<string, unknown>).visitorId as string | undefined;
    const ownerId = user?.id || visitorId;

    const jobs = await downloadsService.listJobs(ownerId);
    return reply.send(jobs);
  },

  streamEvents: async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };

    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
      'Access-Control-Allow-Origin': '*',
    });

    const send = (data: object) => {
      if (!reply.raw.writableEnded) {
        reply.raw.write(`data: ${JSON.stringify(data)}\n\n`);
      }
    };

    // Send current job state immediately so client doesn't wait
    const current = await prisma.downloadJob.findUnique({ where: { id }, include: { result: true } });
    if (current) send(downloadsService.sanitizeJob(current));

    const unsubscribe = subscribeToJob(id, send);

    // Heartbeat every 15 s to keep connection alive through proxies
    const heartbeat = setInterval(() => {
      if (!reply.raw.writableEnded) reply.raw.write(': heartbeat\n\n');
    }, 15_000);

    request.raw.on('close', () => {
      unsubscribe();
      clearInterval(heartbeat);
      if (!reply.raw.writableEnded) reply.raw.end();
    });

    // Keep Fastify from closing the response automatically
    return reply;
  },

  serveFile: async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    try { await request.jwtVerify(); } catch { /* anonymous */ }
    const user = request.user as { id: string } | undefined;
    const visitorId = (request as unknown as Record<string, unknown>).visitorId as string | undefined;
    const ownerId = user?.id || visitorId;

    // Verify job exists and belongs to the caller (Return 404 to prevent ID probing)
    const job = await prisma.downloadJob.findUnique({ where: { id } });
    if (!job) return reply.status(404).send({ message: 'File not found' });
    if (ownerId && job.userId && job.userId !== ownerId) {
      return reply.status(404).send({ message: 'File not found' });
    }

    const result = await prisma.downloadResult.findUnique({ where: { jobId: id } });
    if (!result) return reply.status(404).send({ message: 'File not found' });

    const storage = getStorage();

    // Defense-in-depth: path traversal prevention for local storage
    if (storage.name === 'local') {
      const downloadDir = path.resolve(process.env.DOWNLOAD_DIR ?? path.join(process.cwd(), 'downloads'));
      const targetPath = path.resolve(downloadDir, result.storagePath);
      if (!targetPath.startsWith(downloadDir)) {
        return reply.status(403).send({ message: 'Access denied: Path traversal detected' });
      }
    }

    const sizeBytes = await storage.sizeBytes(result.storagePath);
    if (sizeBytes === null && storage.name === 'local') {
      return reply.status(410).send({ message: 'File has expired or been removed' });
    }

    // Sanitize output filename to prevent HTTP response splitting / header injection
    const cleanFileName = path.basename(result.fileName).replace(/["\r\n]/g, '');

    const ext = path.extname(cleanFileName).toLowerCase();
    const contentTypeMap: Record<string, string> = {
      '.mp4': 'video/mp4',
      '.mkv': 'video/x-matroska',
      '.webm': 'video/webm',
      '.mp3': 'audio/mpeg',
      '.m4a': 'audio/mp4',
      '.flac': 'audio/flac',
      '.zip': 'application/zip',
    };
    const contentType = contentTypeMap[ext] || 'application/octet-stream';

    reply.header('Content-Disposition', `attachment; filename="${cleanFileName}"`);
    reply.header('Content-Type', contentType);
    if (sizeBytes !== null) reply.header('Content-Length', sizeBytes);
    return reply.send(storage.createReadStream(result.storagePath));
  },

  deleteJob: async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    try { await request.jwtVerify(); } catch { /* anonymous */ }
    const user = request.user as { id: string } | undefined;
    const visitorId = (request as unknown as Record<string, unknown>).visitorId as string | undefined;
    const ownerId = user?.id || visitorId;

    try {
      await downloadsService.deleteJob(id, ownerId);
      return reply.status(204).send();
    } catch (err: unknown) {
      const e = err as { message: string; statusCode?: number };
      return reply.status(e.statusCode ?? 500).send({ message: e.message });
    }
  },
};
