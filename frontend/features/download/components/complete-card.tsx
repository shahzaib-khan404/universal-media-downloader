'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, FolderOpen, Download, Share2, Plus, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { DownloadJob } from '@/types/download';

const API = process.env.NEXT_PUBLIC_API_URL ?? '';

interface CompleteCardProps {
  job: DownloadJob;
  thumbnail?: string | null;
}

export function CompleteCard({ job, thumbnail }: CompleteCardProps) {
  const router = useRouter();
  const fileUrl = `${API}/api/downloads/${job.id}/file`;
  const [copied, setCopied] = useState(false);

  // Ensure file always has proper extension (.mp3 or .mp4)
  const defaultExt = (job.codec?.toLowerCase().includes('mp3') || job.mediaFilename?.toLowerCase().endsWith('.mp3')) ? '.mp3' : '.mp4';
  const downloadFilename = job.mediaFilename && job.mediaFilename.includes('.')
    ? job.mediaFilename
    : `${job.mediaFilename || job.id}${defaultExt}`;

  const handleShare = async () => {
    const shareUrl = job.url || fileUrl;
    const shareData = {
      title: job.mediaFilename || 'Downloaded media',
      text: `Check out this video I downloaded with Universal Media Downloader`,
      url: shareUrl,
    };

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled — don't show an error
        if ((err as Error).name !== 'AbortError') {
          toast.error('Could not share. Link copied to clipboard instead.');
          await copyToClipboard(shareUrl);
        }
      }
    } else {
      // Desktop fallback — copy link to clipboard
      await copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy to clipboard. Please copy the URL manually.');
    }
  };

  const handleOpenFolder = () => {
    router.push('/history');
  };

  return (
    <div className="flex flex-col items-center gap-6 py-6 sm:gap-10 sm:py-8">
      {/* Success icon */}
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-[#FF6B00] to-[#E05300] shadow-[0_10px_30px_rgba(255,107,0,0.5)] border border-white/20">
          <CheckCircle2 className="h-12 w-12 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Downloaded Successfully!</h2>
          <p className="mt-2 text-sm text-slate-600 font-medium">Your high-resolution media has been packaged and is ready.</p>
        </div>
      </div>

      {/* File info card */}
      <div className="w-full max-w-xl glass-panel-elevated rounded-3xl p-6 border border-slate-200 shadow-xl">
        <div className="flex flex-col sm:flex-row gap-5">
          {/* Thumbnail */}
          <div className="h-44 sm:h-24 w-full sm:w-32 shrink-0 overflow-hidden rounded-2xl bg-slate-100 border border-slate-200">
            {thumbnail && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={thumbnail}
                alt="thumbnail"
                className="h-full w-full object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-bold text-slate-900">{job.mediaFilename}</p>
            <div className="mt-3.5 grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
              <div>
                <p className="text-slate-500 uppercase tracking-widest text-[10px] font-bold">Resolution</p>
                <p className="mt-0.5 font-bold text-[#FF6B00]">{job.resolution || 'Original'}</p>
              </div>
              <div>
                <p className="text-slate-500 uppercase tracking-widest text-[10px] font-bold">Codec</p>
                <p className="mt-0.5 font-semibold text-slate-800">{job.codec || 'Auto'}</p>
              </div>
              <div>
                <p className="text-slate-500 uppercase tracking-widest text-[10px] font-bold">Size</p>
                <p className="mt-0.5 font-semibold text-slate-900">{job.fileSize ?? job.totalSize ?? 'Complete'}</p>
              </div>
              <div>
                <p className="text-slate-500 uppercase tracking-widest text-[10px] font-bold">Status</p>
                <p className="mt-0.5 flex items-center gap-1 font-bold text-emerald-600">
                  <CheckCircle2 className="h-3 w-3" />
                  Verified
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Source URL row */}
        {job.url && (
          <div className="mt-5 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5">
            <span className="min-w-0 flex-1 truncate text-xs text-slate-600 font-mono">{job.url}</span>
            <button
              onClick={() => copyToClipboard(job.url)}
              className="shrink-0 rounded-xl p-1.5 text-slate-500 transition-colors hover:text-slate-900 hover:bg-slate-200"
              title="Copy source URL"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex w-full max-w-xl flex-col items-center gap-4">
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <a href={fileUrl} download={downloadFilename} className="w-full sm:w-auto">
            <button className="btn-3d-orange w-full sm:w-auto px-7 py-3.5 rounded-2xl font-bold text-white inline-flex items-center justify-center gap-2 shadow-md">
              <Download className="h-4 w-4" />
              Download
            </button>
          </a>
          <button
            onClick={handleOpenFolder}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl glass-panel border border-slate-200 hover:border-slate-300 text-slate-800 font-bold inline-flex items-center justify-center gap-2 transition-all hover:bg-slate-100 shadow-sm"
          >
            <FolderOpen className="h-4 w-4 text-[#FF6B00]" />
            History
          </button>
          <button
            onClick={handleShare}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl glass-panel border border-slate-200 hover:border-slate-300 text-slate-800 font-bold inline-flex items-center justify-center gap-2 transition-all hover:bg-slate-100 shadow-sm"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Share2 className="h-4 w-4" />}
            Share
          </button>
        </div>
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-bold text-slate-600 transition-colors hover:text-accent mt-2"
        >
          <Plus className="h-4 w-4" />
          Download Another Media
        </Link>
      </div>
    </div>
  );
}
