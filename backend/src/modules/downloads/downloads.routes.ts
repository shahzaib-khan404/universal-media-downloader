import type { FastifyPluginAsync } from 'fastify';
import { downloadsController } from './downloads.controller';

export const downloadsRoutes: FastifyPluginAsync = async (app) => {
  // Public: fetch media metadata + quality options (stricter limit to prevent yt-dlp scraping abuse)
  app.post('/metadata', {
    config: {
      rateLimit: {
        max: 30,
        timeWindow: '1 minute',
      },
    },
  }, downloadsController.fetchMetadata);

  // Optional auth: create a job (works for anonymous users too, throttled to 20/min to mitigate resource exhaustion)
  app.post('/', {
    config: {
      rateLimit: {
        max: 20,
        timeWindow: '1 minute',
      },
    },
  }, downloadsController.createJob);

  // Get single job status (public — needed for progress polling)
  app.get('/:id', downloadsController.getJob);

  // List all jobs (scoped to user if authenticated, or recent jobs for guest session)
  app.get('/', downloadsController.listJobs);

  // Protected: delete a job
  app.delete('/:id', { preHandler: [app.authenticate] }, downloadsController.deleteJob);

  // Public: Server-Sent Events stream for real-time job progress
  app.get('/:id/events', downloadsController.streamEvents);

  // Public: download the completed file
  app.get('/:id/file', downloadsController.serveFile);
};
