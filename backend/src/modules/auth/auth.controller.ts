import type { FastifyReply, FastifyRequest } from 'fastify';
import { authService } from './auth.service';

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 30, // 30 days
};

export const authController = {
  register: async (request: FastifyRequest, reply: FastifyReply) => {
    const { name, email, password } = request.body as {
      name?: string;
      email?: string;
      password?: string;
    };
    if (!name || !email || !password) {
      return reply.status(400).send({ message: 'name, email, and password are required' });
    }
    try {
      const user = await authService.register(name, email, password);
      const token = await reply.jwtSign({ id: user.id, email: user.email });
      reply.setCookie('auth_token', token, COOKIE_OPTS);
      return reply.status(201).send({ user, token });
    } catch (err: unknown) {
      const e = err as { message: string; statusCode?: number };
      return reply.status(e.statusCode ?? 500).send({ message: e.message });
    }
  },

  login: async (request: FastifyRequest, reply: FastifyReply) => {
    const { email, password } = request.body as { email?: string; password?: string };
    if (!email || !password) {
      return reply.status(400).send({ message: 'email and password are required' });
    }
    try {
      const user = await authService.login(email, password);
      const token = await reply.jwtSign({ id: user.id, email: user.email });
      reply.setCookie('auth_token', token, COOKIE_OPTS);
      return reply.send({ user, token });
    } catch (err: unknown) {
      const e = err as { message: string; statusCode?: number };
      return reply.status(e.statusCode ?? 500).send({ message: e.message });
    }
  },

  logout: async (_request: FastifyRequest, reply: FastifyReply) => {
    reply.clearCookie('auth_token', { path: '/' });
    return reply.send({ message: 'Logged out' });
  },

  me: async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.user as { id: string };
    try {
      const user = await authService.getById(payload.id);
      return reply.send(user);
    } catch (err: unknown) {
      const e = err as { message: string; statusCode?: number };
      return reply.status(e.statusCode ?? 500).send({ message: e.message });
    }
  },
};
