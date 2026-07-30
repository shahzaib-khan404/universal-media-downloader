import * as dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config({ path: '.env' });

// Use an isolated in-memory SQLite DB for tests
process.env.DATABASE_URL = 'file:/Users/shahzaibkhan/universal-media-downloader/backend/src/test/test.db';
process.env.JWT_SECRET = 'test-secret-at-least-32-chars-long';
process.env.NODE_ENV = 'test';
process.env.DIRECT_WORKER = 'false'; // never start worker in tests

// Clean up test DB tables before each test file
const prisma = new PrismaClient();

beforeAll(async () => {
  await prisma.$connect();
  // Wipe all data in reverse dependency order
  await prisma.downloadResult.deleteMany();
  await prisma.downloadJob.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.downloadResult.deleteMany();
  await prisma.downloadJob.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});
