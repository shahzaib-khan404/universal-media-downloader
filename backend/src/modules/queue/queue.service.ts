import { Queue } from 'bullmq';

const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379';
const url = new URL(redisUrl);

export const connection = {
  host: url.hostname,
  port: Number(url.port) || 6379,
  password: url.password || undefined,
};

export const downloadQueue = new Queue('download-jobs', { connection });
