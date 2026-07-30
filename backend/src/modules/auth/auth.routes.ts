import type { FastifyPluginAsync } from 'fastify';
import { authController } from './auth.controller';

export const authRoutes: FastifyPluginAsync = async (app) => {
  app.post('/register', authController.register);
  app.post('/login', authController.login);
  app.post('/logout', authController.logout);
  app.get('/me', { preHandler: [app.authenticate] }, authController.me);
};
