'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/navigation/footer';
import { OptionsTable } from '@/features/download/components/options-table';
import { fetchAllMediaData, createDownloadJob } from '@/services/download.service';
import type { MediaInfo, QualityOption, AudioOption } from '@/types/download';
import { Settings2, Eye, Calendar, Info, Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function DownloadOptionsPage() {
  const params = useSearchParams();
  const router = useRouter();
  const sourceUrl = params.get('url') ?? '';

  const [media, setMedia] = useState<MediaInfo | null>(null);
  const [qualities, setQualities] = useState<QualityOption[]>([]);
  const [audioOptions, setAudioOptions] = useState<AudioOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!sourceUrl) return;
    setLoading(true);
    setFetchError(null);
    fetchAllMediaData(sourceUrl)
      .then(({ media, qualities, audioOptions }) => {
        setMedia(media);
        setQualities(qualities);
        setAudioOptions(audioOptions);
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err);
        setFetchError(msg);
      })
      .finally(() => setLoading(false));
  }, [sourceUrl]);

  const handleDownload = async (qualityId: string, type: 'video' | 'audio' = 'video') => {
    setSubmitting(true);
    try {
      const { jobId } = await createDownloadJob(sourceUrl, qualityId, type === 'audio');
      const thumb = media?.thumbnail ? `&thumb=${encodeURIComponent(media.thumbnail)}` : '';
      router.push(`/download/progress/${jobId}?url=${encodeURIComponent(sourceUrl)}${thumb}`);
    } catch {
      toast.error('Failed to start download. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto py-12">
        {/* Page header */}
        <div className="mb-10">
          <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-widest text-accent">
            <Settings2 className="h-3.5 w-3.5" />
            Configuration
          </div>
          <h1 className="text-4xl font-bold text-white">Download Options</h1>
          <p className="mt-3 max-w-lg text-sm leading-7 text-muted">
            Select your preferred quality and format. We offer optimised profiles for every device
            and professional standard.
          </p>
        </div>

        {fetchError ? (
          <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-8 text-center">
            <p className="text-lg font-semibold text-red-400">Could not fetch video info</p>
            <p className="mt-2 text-sm text-muted">
              {fetchError.includes('429') || fetchError.includes('bot')
                ? 'YouTube is blocking requests from this server. Try a different video or wait a few minutes.'
                : fetchError.includes('Sign in')
                ? 'This video requires sign-in to access. Try a public video.'
                : 'Something went wrong fetching the video. Make sure the URL is correct and the video is public.'}
            </p>
            <button
              onClick={() => window.history.back()}
              className="mt-6 rounded-full border border-border px-5 py-2 text-sm text-muted transition-colors hover:border-accent hover:text-white"
            >
              ← Go back
            </button>
          </div>
        ) : loading ? (
          <div className="space-y-6">
            {/* Media skeleton */}
            <div className="animate-pulse rounded-3xl border border-border bg-surface p-6">
              <div className="flex gap-4">
                <div className="h-24 w-36 rounded-xl bg-surface2" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 w-3/4 rounded bg-surface2" />
                  <div className="h-3 w-1/2 rounded bg-surface2" />
                  <div className="h-3 w-1/3 rounded bg-surface2" />
                </div>
              </div>
            </div>
            <div className="animate-pulse rounded-3xl border border-border bg-surface p-6">
              <div className="h-64 rounded-xl bg-surface2" />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Media info + processing card */}
            <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
              {/* Media info */}
              <div className="rounded-3xl border border-border bg-surface p-6 shadow-card">
                <div className="flex gap-5">
                  {/* Thumbnail */}
                  <div className="h-24 w-36 shrink-0 overflow-hidden rounded-xl bg-surface2">
                    {media?.thumbnail && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={media.thumbnail}
                        alt={media.title ?? 'thumbnail'}
                        className="h-full w-full object-cover"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-3 flex flex-wrap gap-2">
                      <span className="rounded-md bg-surface2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted">
                        Source: {media?.platform}
                      </span>
                      <span className="rounded-md bg-surface2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted">
                        ID: {media?.id}
                      </span>
                    </div>
                    <h2 className="text-lg font-semibold leading-snug text-white">{media?.title}</h2>
                    <p className="mt-1 text-sm text-muted">
                      Uploaded by {media?.channel} • {media?.views?.toLocaleString()} Views
                    </p>
                    <div className="mt-3 flex items-center gap-4 text-xs text-muted">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {media?.views?.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {media?.uploadedAt}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fastest processing card */}
              <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-border bg-surface p-6 shadow-card text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10">
                  <span className="text-2xl">⚡</span>
                </div>
                <p className="font-semibold text-white">Fastest Processing</p>
                <p className="text-xs leading-5 text-muted">
                  Multi-threaded download enabled. Expect completion in under 15 seconds for most
                  formats.
                </p>
              </div>
            </div>

            {/* Quality table */}
            <div className="rounded-3xl border border-border bg-surface p-6 shadow-card">
              <OptionsTable
                qualities={qualities}
                audioOptions={audioOptions}
                onDownload={handleDownload}
                loading={submitting}
              />
            </div>

            {/* Info cards */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-start gap-4 rounded-3xl border border-border bg-surface p-6">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/10">
                  <Info className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-white">Which format should I choose?</p>
                  <p className="mt-2 text-xs leading-5 text-muted">
                    Choose MP4 for universal compatibility with phones and TVs. Pick MKV if you
                    need multiple audio tracks or advanced subtitle support. For audio, FLAC is best
                    for archiving, while MP3 is best for older car players.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-3xl border border-border bg-surface p-6">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-400/10">
                  <Shield className="h-4 w-4 text-green-400" />
                </div>
                <div>
                  <p className="font-semibold text-white">Safe and Secure</p>
                  <p className="mt-2 text-xs leading-5 text-muted">
                    All downloads are scanned for malware and processed on our secure sandboxed
                    servers. We never track your personal download history or store permanent media
                    files beyond the processing window.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
