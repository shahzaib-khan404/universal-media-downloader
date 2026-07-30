import type { FastifyPluginAsync } from 'fastify';
import { downloadsController } from './downloads.controller';

export const downloadsRoutes: FastifyPluginAsync = async (app) => {
  // Public: fetch media metadata + quality options
  app.post('/metadata', downloadsController.fetchMetadata);

  // Optional auth: create a job (works for anonymous users too)
  app.post('/', downloadsController.createJob);

  // Get single job status (public — needed for progress polling)
  app.get('/:id', downloadsController.getJob);

  // Protected: list all jobs for current user
  app.get('/', { preHandler: [app.authenticate] }, downloadsController.listJobs);

  // Protected: delete a job
  app.delete('/:id', { preHandler: [app.authenticate] }, downloadsController.deleteJob);

  // Public: Server-Sent Events stream for real-time job progress
  app.get('/:id/events', downloadsController.streamEvents);

  // Public: download the completed file
  app.get('/:id/file', downloadsController.serveFile);
};
