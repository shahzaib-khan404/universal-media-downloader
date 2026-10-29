import crypto from 'crypto';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import formbody from '@fastify/formbody';
import cookie from '@fastify/cookie';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import { authGuardPlugin } from './plugins/auth-guard';
import { authRoutes } from './modules/auth/auth.routes';
import { downloadsRoutes } from './modules/downloads/downloads.routes';
import { env } from './lib/env';

function getAllowedOrigins(): string | string[] | RegExp | boolean {
  if (!env.ALLOWED_ORIGINS) return true; // dev: allow all
  const origins = env.ALLOWED_ORIGINS.split(',').map((o) => o.trim());
  return origins.length === 1 ? origins[0] : origins;
}

export async function buildApp() {
  const app = Fastify({ logger: process.env.NODE_ENV !== 'test' });

  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(cors, {
    origin: (origin, cb) => {
      // In dev or when no origin header (like server-to-server), allow
      if (!origin) return cb(null, true);
      if (!env.ALLOWED_ORIGINS) return cb(null, true);
      const origins = env.ALLOWED_ORIGINS.split(',').map((o) => o.trim());
      if (origins.includes('*') || origins.includes(origin)) {
        return cb(null, true);
      }
      return cb(null, false);
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  });

  // Global rate limit: 200 requests / minute per IP
  await app.register(rateLimit, {
    max: 200,
    timeWindow: '1 minute',
    // Stricter limit for auth endpoints applied at route level
    skipOnError: true,
  });

  await app.register(formbody);

  // Enforce a sensible request body size limit (1 MB)
  app.addContentTypeParser('application/json', { parseAs: 'string', bodyLimit: 1_048_576 }, (_req, body, done) => {
    try {
      done(null, JSON.parse(body as string));
    } catch (err) {
      const error = err as Error;
      error.message = 'Invalid JSON body';
      done(error, undefined);
    }
  });

  await app.register(cookie);

  // Issue anonymous visitor ID cookie on first visit to isolate user history (P0 Security)
  app.addHook('preHandler', async (request, reply) => {
    let visitorId = request.cookies.umd_vid;
    if (!visitorId) {
      visitorId = crypto.randomUUID();
      reply.setCookie('umd_vid', visitorId, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60, // 30 days
      });
    }
    // Attach to request context
    (request as unknown as Record<string, unknown>).visitorId = visitorId;
  });

  await app.register(jwt, {
    secret: env.JWT_SECRET ?? 'fallback-secret-change-me',
    cookie: { cookieName: 'auth_token', signed: false },
  });

  await app.register(authGuardPlugin);

  app.register(authRoutes, { prefix: '/api/auth' });
  app.register(downloadsRoutes, { prefix: '/api/downloads' });

  app.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '0.1.0',
  }));

  app.get('/api/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '0.1.0',
  }));

  return app;
}
