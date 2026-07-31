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
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent/10">
          <CheckCircle2 className="h-10 w-10 text-accent" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-white">Downloaded Successfully</h2>
          <p className="mt-2 text-sm text-muted">Your high-resolution media is ready for playback.</p>
        </div>
      </div>

      {/* File info card */}
      <Card className="w-full max-w-xl p-5">
        <div className="flex gap-4">
          {/* Thumbnail */}
          <div className="h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-surface2">
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
            <p className="truncate text-sm font-medium text-white">{job.mediaFilename}</p>
            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              <div>
                <p className="text-muted/60 uppercase tracking-widest text-[10px]">Resolution</p>
                <p className="mt-0.5 font-medium text-white">{job.resolution}</p>
              </div>
              <div>
                <p className="text-muted/60 uppercase tracking-widest text-[10px]">Codec</p>
                <p className="mt-0.5 font-medium text-white">{job.codec}</p>
              </div>
              <div>
                <p className="text-muted/60 uppercase tracking-widest text-[10px]">Size</p>
                <p className="mt-0.5 font-medium text-white">{job.fileSize ?? job.totalSize}</p>
              </div>
              <div>
                <p className="text-muted/60 uppercase tracking-widest text-[10px]">Status</p>
                <p className="mt-0.5 flex items-center gap-1 font-medium text-green-400">
                  <CheckCircle2 className="h-3 w-3" />
                  Verified
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Source URL row */}
        {job.url && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-surface2 px-3 py-2">
            <span className="min-w-0 flex-1 truncate text-xs text-muted">{job.url}</span>
            <button
              onClick={() => copyToClipboard(job.url)}
              className="shrink-0 rounded-lg p-1 text-muted transition-colors hover:text-white"
              title="Copy source URL"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        )}
      </Card>

      {/* Action buttons */}
      <div className="flex w-full max-w-xl flex-col items-center gap-4">
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <Button className="w-full gap-2 sm:w-auto" onClick={handleOpenFolder}>
            <FolderOpen className="h-4 w-4" />
            Open History
          </Button>
          <a href={fileUrl} download={job.mediaFilename || undefined} className="w-full sm:w-auto">
            <Button variant="secondary" className="w-full gap-2">
              <Download className="h-4 w-4" />
              Save to Device
            </Button>
          </a>
          <Button variant="secondary" className="w-full gap-2 sm:w-auto" onClick={handleShare}>
            {copied ? <Check className="h-4 w-4 text-green-400" /> : <Share2 className="h-4 w-4" />}
            Share
          </Button>
        </div>
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-white"
        >
          <Plus className="h-4 w-4" />
          Download Another
        </Link>
      </div>
    </div>
  );
}
