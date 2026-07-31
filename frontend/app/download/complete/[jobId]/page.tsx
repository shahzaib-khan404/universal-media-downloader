'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/navigation/footer';
import { CompleteCard } from '@/features/download/components/complete-card';
import { getCompletedJob } from '@/services/download.service';
import type { DownloadJob } from '@/types/download';

export default function DownloadCompletePage() {
  const { jobId } = useParams<{ jobId: string }>();
  const searchParams = useSearchParams();
  const thumbnail = searchParams.get('thumb');
  const [job, setJob] = useState<DownloadJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCompletedJob(jobId)
      .then(setJob)
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg.includes('not yet completed') ? 'This download is not ready yet.' : 'Could not load download details. The file may have expired.');
      })
      .finally(() => setLoading(false));
  }, [jobId]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto py-12">
        {/* Page header */}
        <div className="mb-10 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-green-400">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
            Complete
          </div>
          <h1 className="text-4xl font-bold text-white">Download Complete</h1>
          <p className="mt-3 text-sm text-muted">
            Job ID: <span className="font-mono text-white">{jobId}</span>
          </p>
        </div>

        <div className="mx-auto max-w-3xl">
          {loading ? (
            <div className="animate-pulse rounded-3xl border border-border bg-surface p-10">
              <div className="flex flex-col items-center gap-8">
                <div className="h-20 w-20 rounded-full bg-surface2" />
                <div className="h-6 w-64 rounded bg-surface2" />
                <div className="h-32 w-full rounded-2xl bg-surface2" />
                <div className="flex gap-3">
                  <div className="h-10 w-32 rounded-xl bg-surface2" />
                  <div className="h-10 w-36 rounded-xl bg-surface2" />
                  <div className="h-10 w-24 rounded-xl bg-surface2" />
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-10 text-center">
              <p className="text-lg font-semibold text-red-400">Something went wrong</p>
              <p className="mt-2 text-sm text-muted">{error}</p>
              <button
                onClick={() => window.history.back()}
                className="mt-6 rounded-full border border-border px-5 py-2 text-sm text-muted transition-colors hover:border-accent hover:text-white"
              >
                ← Go back
              </button>
            </div>
          ) : job ? (
            <div className="rounded-3xl border border-border bg-surface p-8 shadow-card">
              <CompleteCard job={job} thumbnail={thumbnail} />
            </div>
          ) : null}
        </div>
      </main>
      <Footer />
    </div>
  );
}
