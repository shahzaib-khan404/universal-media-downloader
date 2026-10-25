'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/navigation/footer';
import { OptionsTable } from '@/features/download/components/options-table';
import { fetchAllMediaData, createDownloadJob } from '@/services/download.service';
import type { MediaInfo, QualityOption, AudioOption } from '@/types/download';
import { Settings2, Eye, Calendar, Info, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { LoadingScreen } from '@/components/ui/loading-screen';

function OptionsContent() {
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
    if (!sourceUrl) {
      setFetchError('No URL provided. Please go back and enter a valid URL.');
      setLoading(false);
      return;
    }
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
      <main className="container mx-auto px-4 py-8 sm:py-12">
        {/* Page header */}
        <div className="mb-10">
          <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#FF6B00]">
            <Settings2 className="h-3.5 w-3.5" />
            Configuration
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl tracking-tight">
            Download <span className="text-[#FF6B00]">Options</span>
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-7 text-slate-600 font-medium">
            Select your preferred quality and format. We offer optimised profiles for every device
            and professional standard.
          </p>
        </div>

        {fetchError ? (
          <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-8 text-center">
            <p className="text-lg font-semibold text-red-600">Could not fetch video info</p>
            <p className="mt-2 text-sm text-slate-600">
              {fetchError.includes('429') || fetchError.includes('bot')
                ? 'YouTube is blocking requests from this server. Try a different video or wait a few minutes.'
                : fetchError.includes('Sign in')
                ? 'This video requires sign-in to access. Try a public video.'
                : 'Something went wrong fetching the video. Make sure the URL is correct and the video is public.'}
            </p>
            <button
              onClick={() => window.history.back()}
              className="mt-6 rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-[#FF6B00] hover:text-[#FF6B00]"
            >
              ← Go back
            </button>
          </div>
        ) : loading ? (
          <div className="rounded-3xl border border-orange-200/70 bg-gradient-to-b from-[#FFF5ED] via-[#FFEADB] to-[#FEDBC0] p-8 shadow-sm">
            <LoadingScreen 
              title="Analyzing Media & Formats..."
              subtitle="Fetching high-definition streams, bitrates, audio codecs, and video resolutions from source."
            />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Media info + processing card */}
            <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
              {/* Media info */}
              <div className="rounded-3xl border border-orange-200/70 bg-gradient-to-b from-[#FFF5ED] via-[#FFEADB] to-[#FEDBC0] p-5 sm:p-6 shadow-md shadow-orange-500/5">
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
                  {/* Thumbnail */}
                  <div className="h-44 sm:h-24 w-full sm:w-36 shrink-0 overflow-hidden rounded-xl bg-slate-200 shadow-sm border border-orange-200/80">
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
                    <div className="mb-2 sm:mb-3 flex flex-wrap gap-2">
                      <span className="rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-700 shadow-xs border border-orange-200/60">
                        Source: {media?.platform}
                      </span>
                      <span className="rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-700 shadow-xs border border-orange-200/60">
                        ID: {media?.id}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold leading-snug text-slate-900">{media?.title}</h2>
                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      Uploaded by {media?.channel} • {media?.views?.toLocaleString()} Views
                    </p>
                    <div className="mt-3 flex items-center gap-4 text-xs font-semibold text-slate-600">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5 text-[#FF6B00]" />
                        {media?.views?.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-[#FF6B00]" />
                        {media?.uploadedAt}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fastest processing card */}
              <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-orange-200/70 bg-gradient-to-b from-[#FFF5ED] via-[#FFEADB] to-[#FEDBC0] p-6 shadow-md shadow-orange-500/5 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FF6B00]/15 text-[#FF6B00] shadow-sm">
                  <span className="text-2xl">⚡</span>
                </div>
                <p className="font-extrabold text-slate-900 text-base">Fastest Processing</p>
                <p className="text-xs leading-5 text-slate-700 font-medium">
                  Multi-threaded download enabled. Expect completion in under 15 seconds for most
                  formats.
                </p>
              </div>
            </div>

            {/* Quality table */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <OptionsTable
                qualities={qualities}
                audioOptions={audioOptions}
                onDownload={handleDownload}
                loading={submitting}
                defaultTab={params.get('mode') === 'audio' ? 'audio' : 'video'}
                isPlaylist={Boolean(media?.isPlaylist)}
                entries={media?.entries ?? []}
              />
            </div>

            {/* Info cards */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-start gap-4 rounded-3xl border border-orange-200/70 bg-gradient-to-b from-[#FFF5ED] via-[#FFEADB] to-[#FEDBC0] p-6 shadow-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FF6B00]/15 text-[#FF6B00]">
                  <Info className="h-5 w-5 text-[#FF6B00]" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Which format should I choose?</p>
                  <p className="mt-2 text-xs leading-5 text-slate-700 font-medium">
                    Choose MP4 for universal compatibility with phones and TVs. Pick MKV if you
                    need multiple audio tracks or advanced subtitle support. For audio, FLAC is best
                    for archiving, while MP3 is best for older car players.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-3xl border border-orange-200/70 bg-gradient-to-b from-[#FFF5ED] via-[#FFEADB] to-[#FEDBC0] p-6 shadow-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600">
                  <Shield className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Safe and Secure</p>
                  <p className="mt-2 text-xs leading-5 text-slate-700 font-medium">
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
    </div>
  );
}

export default function DownloadOptionsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col justify-between">
        <Navbar />
        <main className="container mx-auto px-4 py-12 flex-1 flex items-center justify-center">
          <LoadingScreen 
            title="Loading Options Screen..."
            subtitle="Fetching media metadata, resolution profiles, and audio containers."
          />
        </main>
        <Footer />
      </div>
    }>
      <OptionsContent />
    </Suspense>
  );
}
