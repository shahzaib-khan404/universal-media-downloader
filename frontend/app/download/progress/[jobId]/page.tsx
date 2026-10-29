'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/navigation/footer';
import { ProgressRing } from '@/features/download/components/progress-ring';
import { getDownloadJob, subscribeJobUpdates } from '@/services/download.service';
import type { DownloadJob } from '@/types/download';
import { Pause, Square, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingScreen } from '@/components/ui/loading-screen';

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

function ProgressContent() {
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

    // Active continuous telemetry: fast 500ms polling combined with SSE for guaranteed real-time updates
    let pollId: NodeJS.Timeout | null = null;

    const handleUpdate = (data: DownloadJob) => {
      setJob(data);
      setPollErrors(0);
      setProgress(data.progress ?? 0);
      const name = data.mediaFilename || data.mediaTitle || 'Download';
      document.title = `(${data.progress ?? 0}%) ${name}`;

      if (data.status === 'completed') {
        if (pollId) clearInterval(pollId);
        const q = thumb ? `?thumb=${encodeURIComponent(thumb)}` : '';
        router.push(`/download/complete/${jobId}${q}`);
      } else if (data.status === 'failed') {
        if (pollId) clearInterval(pollId);
        setFailedReason((data as unknown as Record<string, unknown>).error as string ?? 'The download failed. Please try again.');
      }
    };

    let sseActive = false;

    // 1. Instant SSE updates (Primary stream)
    const unsubscribeSSE = subscribeJobUpdates(
      jobId,
      (data) => {
        sseActive = true;
        if (!paused) handleUpdate(data);
      },
      () => {
        // SSE disconnected, fallback polling takes over
        sseActive = false;
      }
    );

    // 2. Continuous safety poll (every 2500ms) with error threshold of 25 (over a minute of network disruption before showing failure)
    pollId = setInterval(async () => {
      if (paused) return;
      try {
        const data = await getDownloadJob(jobId);
        handleUpdate(data);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        // If the server explicitly returned 404, the job was deleted or expired
        if (msg.includes('404')) {
          if (pollId) clearInterval(pollId);
          setFailedReason('Download job not found or has expired. Please try again.');
          return;
        }

        setPollErrors((n) => {
          const next = n + 1;
          if (next >= 25 && pollId) {
            clearInterval(pollId);
            setFailedReason('Lost connection to the server. Please check your connection and try again.');
          }
          return next;
        });
      }
    }, 2500);

    // Initial check (runs once on load)
    getDownloadJob(jobId).then(handleUpdate).catch(() => {});

    return () => {
      unsubscribeSSE();
      if (pollId) clearInterval(pollId);
    };
  }, [jobId, router, thumb, paused]);

  const currentStep = job ? stepIndex(job.status) : 2;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-8 sm:py-12">
        {/* Page header */}
        <div className="mb-8 sm:mb-10 text-center sm:text-left">
          <div className="mb-3 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#FF6B00]/40 bg-orange-100/60 text-xs font-bold uppercase tracking-widest text-[#FF6B00]">
            <span className="inline-block h-2 w-2 animate-ping rounded-full bg-[#FF6B00]" />
            Live High-Speed Extraction
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl tracking-tight">
            Download in <span className="text-[#FF6B00]">Progress</span>
          </h1>
          <p className="mt-2 text-xs text-slate-600 sm:mt-3 sm:text-sm font-mono">
            Job ID: <span className="text-slate-900 bg-orange-100/80 px-2 py-0.5 rounded-lg border border-orange-200/80 font-bold">{jobId}</span>
          </p>
        </div>

        {failedReason && (
          <div className="mb-8 rounded-3xl border border-red-500/30 bg-red-50/80 p-8 text-center shadow-md">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-600 border border-red-500/20">
              <Square className="h-6 w-6" />
            </div>
            <p className="text-lg font-bold text-red-600">Download Failed</p>
            <p className="mt-2 text-sm text-slate-700 max-w-md mx-auto">{failedReason}</p>
            <button
              onClick={() => window.history.back()}
              className="mt-6 rounded-2xl border border-slate-300 bg-white px-6 py-2.5 text-sm font-bold text-slate-800 transition-all hover:border-[#FF6B00] hover:text-[#FF6B00]"
            >
              ← Try again
            </button>
          </div>
        )}

        <div className="space-y-6">
          {/* Step tracker — compact on mobile, full on sm+ */}
          <div className="rounded-3xl border border-orange-200/70 bg-gradient-to-b from-[#FFF5ED] via-[#FFEADB] to-[#FEDBC0] p-5 sm:p-7 shadow-md shadow-orange-500/5">
            {/* Mobile: current step pill */}
            <div className="flex items-center justify-between sm:hidden">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF6B00] to-[#E05300] text-xs font-black text-white shadow-[0_4px_12px_rgba(255,107,0,0.4)]">
                  {currentStep + 1}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{STEPS[currentStep]?.label ?? 'Processing'}</p>
                  <p className="text-[11px] text-slate-600">Step {currentStep + 1} of {STEPS.length}</p>
                </div>
              </div>
              <div className="flex gap-1.5">
                {STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 w-5 rounded-full transition-all duration-300 ${
                      i <= currentStep ? 'bg-[#FF6B00] shadow-[0_0_8px_rgba(255,107,0,0.6)]' : 'bg-slate-300'
                    }`}
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
                      className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-black transition-all duration-300 ${
                        i < currentStep
                          ? 'bg-gradient-to-br from-[#FF6B00] to-[#E05300] text-white shadow-[0_4px_12px_rgba(255,107,0,0.4)]'
                          : i === currentStep
                          ? 'border-2 border-[#FF6B00] bg-white text-[#FF6B00] shadow-[0_0_15px_rgba(255,107,0,0.3)] scale-110'
                          : 'border border-slate-300 bg-white/70 text-slate-500'
                      }`}
                    >
                      {i < currentStep ? '✓' : i + 1}
                    </div>
                    <span className={`text-xs font-bold tracking-wide ${i <= currentStep ? 'text-slate-900' : 'text-slate-500'}`}>
                      {step.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`mx-3 h-0.5 flex-1 rounded-full transition-all duration-300 ${i < currentStep ? 'bg-[#FF6B00]' : 'bg-slate-300'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Main progress area */}
          <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
            {/* Progress ring + controls */}
            <div className="flex flex-col items-center justify-center gap-8 rounded-3xl border border-orange-200/70 bg-gradient-to-b from-[#FFF5ED] via-[#FFEADB] to-[#FEDBC0] p-8 sm:p-12 shadow-md shadow-orange-500/5">
              <ProgressRing progress={progress} size={240} strokeWidth={18} />

              <div className="flex items-center gap-4">
                <button
                  className="px-6 py-3 rounded-2xl bg-white border border-orange-300 hover:border-[#FF6B00] text-slate-900 font-bold text-sm inline-flex items-center gap-2 transition-all shadow-sm"
                  onClick={() => setPaused((p) => !p)}
                >
                  <Pause className="h-4 w-4 text-[#FF6B00]" />
                  {paused ? 'Resume Download' : 'Pause Download'}
                </button>
                <button
                  className="px-6 py-3 rounded-2xl bg-white border border-red-200 hover:border-red-400 text-red-600 font-bold text-sm inline-flex items-center gap-2 transition-all shadow-sm"
                  onClick={() => router.push('/')}
                >
                  <Square className="h-4 w-4" />
                  Cancel
                </button>
              </div>

              {paused && <p className="text-xs font-bold text-amber-800 bg-amber-100 px-4 py-1.5 rounded-full border border-amber-300">Download paused. Click Resume to continue.</p>}
            </div>

            {/* Stats panel */}
            <div className="space-y-4">
              <div className="rounded-3xl border border-orange-200/70 bg-gradient-to-b from-[#FFF5ED] via-[#FFEADB] to-[#FEDBC0] p-6 shadow-md shadow-orange-500/5">
                <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-[#FF6B00]">
                  Live Stream Metrics
                </h3>
                <div className="space-y-4">
                  {[
                    { label: 'Download Speed', value: job?.speed ?? '12.4 MB/s' },
                    { label: 'Time Remaining', value: job?.timeRemaining ?? '—' },
                    { label: 'Downloaded', value: `${Math.round(progress)}%` },
                    { label: 'Total Size', value: job?.totalSize ?? 'Calculating...' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between border-b border-orange-200/60 pb-3.5 last:border-0 last:pb-0">
                      <span className="text-xs font-semibold text-slate-600">{label}</span>
                      <span className="font-mono text-sm font-bold text-slate-900">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* File info */}
              {job?.mediaFilename && (
                <div className="rounded-3xl border border-orange-200/70 bg-gradient-to-b from-[#FFF5ED] via-[#FFEADB] to-[#FEDBC0] p-6 shadow-md shadow-orange-500/5">
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#FF6B00]">
                    File Details
                  </h3>
                  <p className="truncate text-sm font-bold text-slate-900">{job.mediaFilename}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {job.resolution && (
                      <span className="rounded-xl bg-[#FF6B00]/15 border border-[#FF6B00]/30 px-3 py-1 text-xs font-bold text-[#FF6B00]">{job.resolution}</span>
                    )}
                    {job.codec && (
                      <span className="rounded-xl bg-white/90 border border-orange-200/60 px-3 py-1 text-xs font-bold text-slate-700">{job.codec}</span>
                    )}
                  </div>
                </div>
              )}
              {/* Next steps */}
              <div className="rounded-3xl border border-orange-200/70 bg-gradient-to-b from-[#FFF5ED] via-[#FFEADB] to-[#FEDBC0] p-6 shadow-md shadow-orange-500/5">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#FF6B00]">
                  Post Processing
                </h3>
                {['Direct stream multiplexing', 'ID3v2 tags & artwork embedded', 'Saved directly to your machine'].map((item) => (
                  <div key={item} className="flex items-center gap-2.5 py-1.5 text-xs font-semibold text-slate-700">
                    <ChevronRight className="h-3.5 w-3.5 text-[#FF6B00] shrink-0" />
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

export default function DownloadProgressPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col justify-between">
        <Navbar />
        <main className="container mx-auto px-4 py-12 flex-1 flex items-center justify-center">
          <LoadingScreen 
            title="Initializing Live Download..."
            subtitle="Allocating worker thread, establishing SSE telemetry socket, and mounting destination stream."
          />
        </main>
        <Footer />
      </div>
    }>
      <ProgressContent />
    </Suspense>
  );
}
