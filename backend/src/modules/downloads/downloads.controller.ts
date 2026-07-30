import type { FastifyReply, FastifyRequest } from 'fastify';
import { downloadsService } from './downloads.service';
import { prisma } from '../../lib/prisma';
import { subscribeToJob } from '../../lib/event-bus';
import { getStorage } from '../../lib/storage';

export const downloadsController = {
  fetchMetadata: async (request: FastifyRequest, reply: FastifyReply) => {
    const { url } = request.body as { url?: string };
    if (!url) return reply.status(400).send({ message: 'url is required' });
    try {
      const info = await downloadsService.fetchMetadata(url);
      const { quality, audio } = downloadsService.buildQualityOptions(info);
      return reply.send({
        id: info.extractor ?? 'unknown',
        title: info.title ?? 'Untitled',
        channel: info.channel ?? info.uploader ?? 'Unknown',
        platform: info.extractor ?? 'unknown',
        views: info.view_count ?? 0,
        uploadedAt: info.upload_date ?? null,
        thumbnail: info.thumbnail ?? null,
        duration: info.duration ?? 0,
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
    if (!payload.qualityId) return reply.status(400).send({ message: 'qualityId is required' });

    // Optionally extract the authenticated user so the job is attributed to them
    try { await request.jwtVerify(); } catch { /* anonymous download — no user attached */ }

    try {
      const user = request.user as { id: string } | undefined;
      const job = await downloadsService.enqueueDownload({
        sourceUrl: payload.url,
        qualityId: payload.qualityId,
        audioOnly: payload.audioOnly,
        userId: user?.id,
      });
      return reply.status(201).send({ jobId: job.id, status: job.status });
    } catch (err: unknown) {
      const e = err as { message: string; statusCode?: number };
      return reply.status(e.statusCode ?? 500).send({ message: e.message });
    }
  },

  getJob: async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    try {
      const job = await downloadsService.getJob(id);
      return reply.send(job);
    } catch (err: unknown) {
      const e = err as { message: string; statusCode?: number };
      return reply.status(e.statusCode ?? 500).send({ message: e.message });
    }
  },

  listJobs: async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { id: string } | undefined;
    const jobs = await downloadsService.listJobs(user?.id);
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
    if (current) send(current);

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
    const result = await prisma.downloadResult.findUnique({ where: { jobId: id } });
    if (!result) return reply.status(404).send({ message: 'File not found' });

    const storage = getStorage();
    const sizeBytes = await storage.sizeBytes(result.storagePath);
    if (sizeBytes === null && storage.name === 'local') {
      return reply.status(410).send({ message: 'File has expired or been removed' });
    }

    reply.header('Content-Disposition', `attachment; filename="${result.fileName}"`);
    reply.header('Content-Type', 'application/octet-stream');
    if (sizeBytes !== null) reply.header('Content-Length', sizeBytes);
    return reply.send(storage.createReadStream(result.storagePath));
  },

  deleteJob: async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const user = request.user as { id: string } | undefined;
    try {
      await downloadsService.deleteJob(id, user?.id);
      return reply.status(204).send();
    } catch (err: unknown) {
      const e = err as { message: string; statusCode?: number };
      return reply.status(e.statusCode ?? 500).send({ message: e.message });
    }
  },
};
