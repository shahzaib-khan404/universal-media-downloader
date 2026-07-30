import { describe, it, expect, beforeEach } from 'vitest';
import { buildApp } from '../app';

describe('Downloads API', () => {
  let app: Awaited<ReturnType<typeof buildApp>>;
  let authToken: string;

  beforeEach(async () => {
    app = await buildApp();
    const reg = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: { name: 'Tester', email: `dl+${Date.now()}@test.com`, password: 'pass1234' },
    });
    authToken = reg.json<{ token: string }>().token;
  });

  describe('POST /api/downloads', () => {
    it('creates a queued job and returns jobId', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/downloads',
        payload: { url: 'https://example.com/video', qualityId: 'best' },
      });
      expect(res.statusCode).toBe(201);
      const body = res.json<{ jobId: string; status: string }>();
      expect(body.jobId).toBeTruthy();
      expect(body.status).toBe('queued');
    });

    it('returns 400 when url is missing', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/downloads',
        payload: { qualityId: 'best' },
      });
      expect(res.statusCode).toBe(400);
    });

    it('returns 400 when qualityId is missing', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/downloads',
        payload: { url: 'https://example.com/video' },
      });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/downloads/:id', () => {
    it('returns job status for an existing job', async () => {
      const create = await app.inject({
        method: 'POST',
        url: '/api/downloads',
        payload: { url: 'https://example.com/video', qualityId: 'best' },
      });
      const { jobId } = create.json<{ jobId: string }>();

      const res = await app.inject({ method: 'GET', url: `/api/downloads/${jobId}` });
      expect(res.statusCode).toBe(200);
      const body = res.json<{ id: string; status: string; progress: number }>();
      expect(body.id).toBe(jobId);
      expect(body.status).toBe('queued');
      expect(body.progress).toBe(0);
    });

    it('returns 404 for unknown job', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/downloads/nonexistent-id' });
      expect(res.statusCode).toBe(404);
    });
  });

  describe('GET /api/downloads (history)', () => {
    it('returns 401 without auth', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/downloads' });
      expect(res.statusCode).toBe(401);
    });

    it('returns job list for authenticated user', async () => {
      // Create a job first
      await app.inject({
        method: 'POST',
        url: '/api/downloads',
        payload: { url: 'https://example.com/v', qualityId: 'best' },
        headers: { authorization: `Bearer ${authToken}` },
      });
      const res = await app.inject({
        method: 'GET',
        url: '/api/downloads',
        headers: { authorization: `Bearer ${authToken}` },
      });
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.json())).toBe(true);
    });
  });

  describe('DELETE /api/downloads/:id', () => {
    it('returns 401 without auth', async () => {
      const res = await app.inject({ method: 'DELETE', url: '/api/downloads/some-id' });
      expect(res.statusCode).toBe(401);
    });

    it('deletes an owned job', async () => {
      const create = await app.inject({
        method: 'POST',
        url: '/api/downloads',
        payload: { url: 'https://example.com/del', qualityId: 'best' },
        headers: { authorization: `Bearer ${authToken}` },
      });
      const { jobId } = create.json<{ jobId: string }>();

      const del = await app.inject({
        method: 'DELETE',
        url: `/api/downloads/${jobId}`,
        headers: { authorization: `Bearer ${authToken}` },
      });
      expect(del.statusCode).toBe(204);

      const check = await app.inject({ method: 'GET', url: `/api/downloads/${jobId}` });
      expect(check.statusCode).toBe(404);
    });
  });

  describe('GET /api/health', () => {
    it('returns ok', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/health' });
      expect(res.statusCode).toBe(200);
      expect(res.json<{ status: string }>().status).toBe('ok');
    });
  });
});
