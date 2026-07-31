'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/navigation/footer';
import { ProgressRing } from '@/features/download/components/progress-ring';
import { getDownloadJob } from '@/services/download.service';
import type { DownloadJob } from '@/types/download';
import { Pause, Square, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STEPS = [
  { key: 'queued', label: 'Queued' },
  { key: 'fetching', label: 'Fetching Metadata' },
  { key: 'downloading', label: 'Downloading' },
  { key: 'processing', label: 'Processing' },
  { key: 'completed', label: 'Completed' },
];

function stepIndex(status: string) {
  if (status === 'queued') return 0;
  if (status === 'fetching_metadata') return 1;
  if (status === 'downloading') return 2;
  if (status === 'processing') return 3;
  if (status === 'completed') return 4;
  return 0;
}


export default function DownloadProgressPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const thumb = searchParams.get('thumb') ?? '';

  const [job, setJob] = useState<DownloadJob | null>(null);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [failedReason, setFailedReason] = useState<string | null>(null);
  const [pollErrors, setPollErrors] = useState(0);

  useEffect(() => {
    const isMock = jobId.startsWith('mock-');

    if (isMock) {
      const id = setInterval(() => {
        if (paused) return;
        setProgress((p) => {
          const next = Math.min(p + 1.5, 99);
          if (next >= 99) {
            clearInterval(id);
            const q = thumb ? `?thumb=${encodeURIComponent(thumb)}` : '';
            router.push(`/download/complete/${jobId}${q}`);
          }
          return next;
        });
      }, 300);
      return () => clearInterval(id);
    }

    // Poll the job status every 2 s — simpler and more reliable than
    // proxying SSE through the Next.js route handler (which buffers the stream).
    const pollId = setInterval(async () => {
      if (paused) return;
      try {
        const data = await getDownloadJob(jobId);
        setJob(data);
        setPollErrors(0);
        setProgress(data.progress ?? 0);
        if (data.status === 'completed') {
          clearInterval(pollId);
          const q = thumb ? `?thumb=${encodeURIComponent(thumb)}` : '';
          router.push(`/download/complete/${jobId}${q}`);
        } else if (data.status === 'failed') {
          clearInterval(pollId);
          setFailedReason((data as unknown as Record<string, unknown>).error as string ?? 'The download failed. Please try again.');
        }
      } catch (err) {
        setPollErrors((n) => {
          const next = n + 1;
          if (next >= 5) {
            clearInterval(pollId);
            setFailedReason('Lost connection to the server. Please check your connection and try again.');
          }
          return next;
        });
        void err;
      }
    }, 2000);

    return () => clearInterval(pollId);
  }, [jobId, router, thumb, paused]);

  const currentStep = job ? stepIndex(job.status) : 2;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-8 sm:py-12">
        {/* Page header */}
        <div className="mb-8 sm:mb-10">
          <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-widest text-accent">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-accent" />
            Live Download
          </div>
          <h1 className="text-2xl font-bold text-white sm:text-4xl">Download in Progress</h1>
          <p className="mt-2 text-xs text-muted sm:mt-3 sm:text-sm">
            Job ID: <span className="font-mono text-white">{jobId}</span>
          </p>
        </div>

        {failedReason && (
          <div className="mb-8 rounded-3xl border border-red-500/30 bg-red-500/10 p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10">
              <Square className="h-6 w-6 text-red-400" />
            </div>
            <p className="text-lg font-semibold text-red-400">Download Failed</p>
            <p className="mt-2 text-sm text-muted">{failedReason}</p>
            <button
              onClick={() => window.history.back()}
              className="mt-6 rounded-full border border-border px-5 py-2 text-sm text-muted transition-colors hover:border-accent hover:text-white"
            >
              ← Try again
            </button>
          </div>
        )}

        <div className="space-y-6">
          {/* Step tracker — compact on mobile, full on sm+ */}
          <div className="rounded-3xl border border-border bg-surface p-4 shadow-card sm:p-6">
            {/* Mobile: current step pill */}
            <div className="flex items-center justify-between sm:hidden">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-accent bg-accent/10 text-xs font-bold text-accent">
                  {currentStep + 1}
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">{STEPS[currentStep]?.label ?? 'Processing'}</p>
                  <p className="text-[10px] text-muted">Step {currentStep + 1} of {STEPS.length}</p>
                </div>
              </div>
              <div className="flex gap-1">
                {STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 w-5 rounded-full transition-colors ${i <= currentStep ? 'bg-accent' : 'bg-border'}`}
                  />
                ))}
              </div>
            </div>

            {/* Desktop: full step row */}
            <div className="hidden items-center justify-between sm:flex">
              {STEPS.map((step, i) => (
                <div key={step.key} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                        i < currentStep
                          ? 'bg-accent text-white'
                          : i === currentStep
                          ? 'border-2 border-accent bg-accent/10 text-accent'
                          : 'border border-border bg-surface2 text-muted'
                      }`}
                    >
                      {i < currentStep ? '✓' : i + 1}
                    </div>
                    <span className={`text-xs ${i <= currentStep ? 'text-white' : 'text-muted'}`}>
                      {step.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`mx-2 h-px flex-1 transition-colors ${i < currentStep ? 'bg-accent' : 'bg-border'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Main progress area */}
          <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
            {/* Progress ring + controls */}
            <div className="flex flex-col items-center justify-center gap-6 rounded-3xl border border-border bg-surface p-6 shadow-card sm:gap-8 sm:p-10">
              <ProgressRing progress={progress} size={220} strokeWidth={16} />

              <div className="flex items-center gap-3">
                <Button variant="secondary" className="gap-2" onClick={() => setPaused((p) => !p)}>
                  <Pause className="h-4 w-4" />
                  {paused ? 'Resume' : 'Pause'}
                </Button>
                <Button
                  variant="secondary"
                  className="gap-2 text-red-400 hover:text-red-300"
                  onClick={() => router.push('/')}
                >
                  <Square className="h-4 w-4" />
                  Cancel
                </Button>
              </div>

              {paused && <p className="text-xs text-muted">Download paused. Click Resume to continue.</p>}
            </div>

            {/* Stats panel */}
            <div className="space-y-4">
              <div className="rounded-3xl border border-border bg-surface p-6 shadow-card">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">
                  Download Stats
                </h3>
                <div className="space-y-4">
                  {[
                    { label: 'Download Speed', value: job?.speed ?? '—' },
                    { label: 'Time Remaining', value: job?.timeRemaining ?? '—' },
                    { label: 'Downloaded', value: `${Math.round(progress)}%` },
                    { label: 'Total Size', value: job?.totalSize ?? '—' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0">
                      <span className="text-xs text-muted">{label}</span>
                      <span className="font-mono text-sm font-medium text-white">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* File info */}
              {job?.mediaFilename && (
                <div className="rounded-3xl border border-border bg-surface p-6 shadow-card">
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
                    File Details
                  </h3>
                  <p className="truncate text-sm text-white">{job.mediaFilename}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {job.resolution && (
                      <span className="rounded-md bg-surface2 px-2 py-0.5 text-xs text-muted">{job.resolution}</span>
                    )}
                    {job.codec && (
                      <span className="rounded-md bg-surface2 px-2 py-0.5 text-xs text-muted">{job.codec}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Next steps */}
              <div className="rounded-3xl border border-border bg-surface p-6 shadow-card">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
                  After Download
                </h3>
                {['Integrity verification', 'Metadata embedding', 'Available for 24 hours'].map((item) => (
                  <div key={item} className="flex items-center gap-2 py-1.5 text-xs text-muted">
                    <ChevronRight className="h-3 w-3 text-accent" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
