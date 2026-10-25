'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/navigation/footer';
import { CompleteCard } from '@/features/download/components/complete-card';
import { getCompletedJob } from '@/services/download.service';
import type { DownloadJob } from '@/types/download';

function CompleteContent() {
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
    <main className="container mx-auto px-4 py-12">
        {/* Page header */}
        <div className="mb-10 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-100/70 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-700 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Complete
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Download <span className="text-[#FF6B00]">Ready</span>
          </h1>
          <p className="mt-3 text-xs text-slate-600 font-mono">
            Job ID: <span className="text-slate-900 bg-orange-100/80 px-2 py-0.5 rounded-lg border border-orange-200/80 font-bold">{jobId}</span>
          </p>
        </div>

        <div className="mx-auto max-w-3xl">
          {loading ? (
            <div className="animate-pulse rounded-3xl border border-orange-200/70 bg-gradient-to-b from-[#FFF5ED] via-[#FFEADB] to-[#FEDBC0] p-10 shadow-sm">
              <div className="flex flex-col items-center gap-8">
                <div className="h-20 w-20 rounded-full bg-orange-200/60" />
                <div className="h-6 w-64 rounded bg-orange-200/60" />
                <div className="h-32 w-full rounded-2xl bg-orange-200/60" />
                <div className="flex gap-3">
                  <div className="h-10 w-32 rounded-xl bg-orange-200/60" />
                  <div className="h-10 w-36 rounded-xl bg-orange-200/60" />
                  <div className="h-10 w-24 rounded-xl bg-orange-200/60" />
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-red-500/30 bg-red-50/80 p-10 text-center shadow-md">
              <p className="text-lg font-bold text-red-600">Something went wrong</p>
              <p className="mt-2 text-sm text-slate-700">{error}</p>
              <button
                onClick={() => window.history.back()}
                className="mt-6 rounded-2xl border border-slate-300 bg-white px-6 py-2.5 text-sm font-bold text-slate-800 transition-all hover:border-[#FF6B00] hover:text-[#FF6B00]"
              >
                ← Go back
              </button>
            </div>
          ) : job ? (
            <div className="rounded-3xl border border-orange-200/70 bg-gradient-to-b from-[#FFF5ED] via-[#FFEADB] to-[#FEDBC0] p-6 sm:p-8 shadow-md shadow-orange-500/5">
              <CompleteCard job={job} thumbnail={thumbnail} />
            </div>
          ) : null}
        </div>
      </main>
  );
}

export default function DownloadCompletePage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Suspense fallback={
        <main className="container mx-auto px-4 py-12">
          <div className="h-64 animate-pulse rounded-3xl glass-panel" />
        </main>
      }>
        <CompleteContent />
      </Suspense>
      <Footer />
    </div>
  );
}
