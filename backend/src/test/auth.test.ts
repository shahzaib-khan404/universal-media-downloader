import { describe, it, expect, beforeEach } from 'vitest';
import { buildApp } from '../app';

describe('Auth API', () => {
  let app: Awaited<ReturnType<typeof buildApp>>;

  beforeEach(async () => {
    app = await buildApp();
  });

  describe('POST /api/auth/register', () => {
    it('creates a new user and returns a token', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: { name: 'Alice', email: `alice+${Date.now()}@test.com`, password: 'password123' },
      });
      expect(res.statusCode).toBe(201);
      const body = res.json<{ user: { email: string }; token: string }>();
      expect(body.token).toBeTruthy();
      expect(body.user.email).toContain('@test.com');
    });

    it('returns 409 when email already registered', async () => {
      const email = `dup+${Date.now()}@test.com`;
      await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: { name: 'Bob', email, password: 'password123' },
      });
      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: { name: 'Bob2', email, password: 'password123' },
      });
      expect(res.statusCode).toBe(409);
    });

    it('returns 400 when fields are missing', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: { email: 'nopw@test.com' },
      });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('returns a token for valid credentials', async () => {
      const email = `login+${Date.now()}@test.com`;
      await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: { name: 'Carol', email, password: 'secret123' },
      });
      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: { email, password: 'secret123' },
      });
      expect(res.statusCode).toBe(200);
      expect(res.json<{ token: string }>().token).toBeTruthy();
    });

    it('returns 401 for wrong password', async () => {
      const email = `wrong+${Date.now()}@test.com`;
      await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: { name: 'Dave', email, password: 'correct' },
      });
      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: { email, password: 'wrong' },
      });
      expect(res.statusCode).toBe(401);
    });

    it('returns 401 for unknown email', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: { email: 'nobody@test.com', password: 'anything' },
      });
      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('returns user when token is valid', async () => {
      const email = `me+${Date.now()}@test.com`;
      const reg = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: { name: 'Eve', email, password: 'pass1234' },
      });
      const { token } = reg.json<{ token: string }>();
      const res = await app.inject({
        method: 'GET',
        url: '/api/auth/me',
        headers: { authorization: `Bearer ${token}` },
      });
      expect(res.statusCode).toBe(200);
      expect(res.json<{ email: string }>().email).toBe(email);
    });

    it('returns 401 without a token', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/auth/me' });
      expect(res.statusCode).toBe(401);
    });
  });
});
