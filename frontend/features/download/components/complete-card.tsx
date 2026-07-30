import Link from 'next/link';
import { CheckCircle2, FolderOpen, Download, Share2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { DownloadJob } from '@/types/download';

const API = process.env.NEXT_PUBLIC_API_URL ?? '';

interface CompleteCardProps {
  job: DownloadJob;
  thumbnail?: string | null;
}

export function CompleteCard({ job, thumbnail }: CompleteCardProps) {
  const fileUrl = `${API}/api/downloads/${job.id}/file`;
  return (
    <div className="flex flex-col items-center gap-10 py-8">
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
      </Card>

      {/* Action buttons */}
      <div className="flex flex-col items-center gap-4">
        <div className="flex flex-wrap justify-center gap-3">
          <Button className="gap-2">
            <FolderOpen className="h-4 w-4" />
            Open Folder
          </Button>
          <a href={fileUrl} download={job.mediaFilename || undefined}>
            <Button variant="secondary" className="gap-2">
              <Download className="h-4 w-4" />
              Save to Device
            </Button>
          </a>
          <Button variant="secondary" className="gap-2">
            <Share2 className="h-4 w-4" />
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
