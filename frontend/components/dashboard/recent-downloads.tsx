import Link from 'next/link';
import { Clock, HardDrive, FolderOpen, X, MoreVertical } from 'lucide-react';
import { Card } from '@/components/ui/card';

type Status = 'COMPLETED' | 'DOWNLOADING';

const downloads: {
  filename: string;
  timeAgo: string | null;
  size: string;
  status: Status;
  speed: string | null;
  progress: number | null;
}[] = [
  {
    filename: 'Silicon_Valley_Architect_Interview_4K.mp4',
    timeAgo: '12 mins ago',
    size: '422 MB',
    status: 'COMPLETED',
    speed: '12.4 MB/s',
    progress: null,
  },
  {
    filename: 'Ambient_Workspace_Vol_4_Lossless.wav',
    timeAgo: null,
    size: '1.2 GB',
    status: 'DOWNLOADING',
    speed: null,
    progress: 78,
  },
  {
    filename: 'Linear_App_Visual_Design_Breakdown.mov',
    timeAgo: '2 hours ago',
    size: '2.8 GB',
    status: 'COMPLETED',
    speed: '15.1 MB/s',
    progress: null,
  },
];

export function RecentDownloads() {
  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Recent Downloads</h2>
        <Link href="/history" className="text-xs text-accent hover:underline">
          View History →
        </Link>
      </div>

      <div className="divide-y divide-border">
        {downloads.map((item) => (
          <div key={item.filename} className="flex items-center gap-4 py-4">
            {/* Thumbnail placeholder */}
            <div className="h-12 w-20 shrink-0 rounded-lg bg-surface2" />

            {/* Info */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{item.filename}</p>
              <div className="mt-1 flex items-center gap-3 text-xs text-muted">
                {item.timeAgo && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {item.timeAgo}
                  </span>
                )}
                {item.status === 'DOWNLOADING' && <span>Downloading...</span>}
                <span className="flex items-center gap-1">
                  <HardDrive className="h-3 w-3" />
                  {item.size}
                </span>
              </div>
            </div>

            {/* Status / Progress */}
            <div className="shrink-0">
              {item.status === 'COMPLETED' && (
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-green-400/10 px-2.5 py-1 text-xs font-medium text-green-400">
                    COMPLETED
                  </span>
                  <span className="text-xs text-muted">{item.speed}</span>
                </div>
              )}
              {item.status === 'DOWNLOADING' && item.progress !== null && (
                <div className="flex w-32 flex-col gap-1.5">
                  <span className="text-right text-xs text-muted">{item.progress}%</span>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface2">
                    <div
                      className="h-full rounded-full bg-accent transition-all"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex shrink-0 items-center">
              {item.status === 'COMPLETED' && (
                <button className="rounded-lg p-2 text-muted hover:bg-surface2 hover:text-white">
                  <FolderOpen className="h-4 w-4" />
                </button>
              )}
              {item.status === 'DOWNLOADING' && (
                <button className="rounded-lg p-2 text-muted hover:bg-red-400/10 hover:text-red-400">
                  <X className="h-4 w-4" />
                </button>
              )}
              <button className="rounded-lg p-2 text-muted hover:bg-surface2 hover:text-white">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
