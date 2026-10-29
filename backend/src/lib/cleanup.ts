import * as fs from 'fs';
import * as path from 'path';
import { prisma } from './prisma';
import { getStorage } from './storage';

const CLEANUP_RETENTION_HOURS = parseInt(process.env.CLEANUP_RETENTION_HOURS ?? '24', 10);
const DOWNLOAD_DIR = process.env.DOWNLOAD_DIR ?? path.join(process.cwd(), 'downloads');

export async function runFileCleanup(): Promise<{ deletedRecords: number; diskFilesCleaned: number }> {
  const cutoffDate = new Date(Date.now() - CLEANUP_RETENTION_HOURS * 60 * 60 * 1000);
  const storage = getStorage();
  let deletedRecords = 0;
  let diskFilesCleaned = 0;

  try {
    // 1. Find completed or failed jobs older than retention window
    const expiredJobs = await prisma.downloadJob.findMany({
      where: {
        createdAt: { lt: cutoffDate },
      },
      include: { result: true },
    });

    for (const job of expiredJobs) {
      if (job.result?.storagePath) {
        try {
          await storage.delete(job.result.storagePath);
          diskFilesCleaned++;
        } catch {
          // ignore if already deleted
        }
      }

      // Delete associated result first then job
      try {
        if (job.result) {
          await prisma.downloadResult.delete({ where: { jobId: job.id } });
        }
        await prisma.downloadJob.delete({ where: { id: job.id } });
        deletedRecords++;
      } catch {
        // ignore concurrency errors
      }
    }

    // 2. Also sweep DOWNLOAD_DIR for leftover orphaned tmp/disk files older than retention window
    if (fs.existsSync(DOWNLOAD_DIR)) {
      const entries = fs.readdirSync(DOWNLOAD_DIR, { withFileTypes: true });
      const now = Date.now();
      const maxAgeMs = CLEANUP_RETENTION_HOURS * 60 * 60 * 1000;

      for (const entry of entries) {
        // Skip persistent cookie file
        if (entry.name === 'cookies.txt') continue;

        const entryPath = path.join(DOWNLOAD_DIR, entry.name);
        try {
          const stats = fs.statSync(entryPath);
          if (now - stats.mtimeMs > maxAgeMs) {
            if (entry.isDirectory()) {
              fs.rmSync(entryPath, { recursive: true, force: true });
            } else {
              fs.unlinkSync(entryPath);
            }
            diskFilesCleaned++;
          }
        } catch {
          // ignore
        }
      }
    }

    if (deletedRecords > 0 || diskFilesCleaned > 0) {
      console.log(`[cleanup] Cleaned ${deletedRecords} expired jobs and ${diskFilesCleaned} disk files (cutoff: ${CLEANUP_RETENTION_HOURS}h)`);
    }
  } catch (err) {
    console.error('[cleanup] Error during file cleanup run:', err);
  }

  return { deletedRecords, diskFilesCleaned };
}

export function startCleanupCron(intervalMs = 60 * 60 * 1000) {
  console.log(`[cleanup] Scheduled file cleanup every ${Math.round(intervalMs / 60000)}m (retention: ${CLEANUP_RETENTION_HOURS}h)`);
  // Run once shortly after startup (after 1 minute)
  setTimeout(() => { void runFileCleanup(); }, 60 * 1000);
  // Recurring interval
  setInterval(() => { void runFileCleanup(); }, intervalMs);
}
