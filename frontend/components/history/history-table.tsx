'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Search,
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  MoreHorizontal,
  Download,
  RotateCcw,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { listDownloadJobs } from '@/services/download.service';
import { apiDelete } from '@/services/api';
import type { DownloadJob } from '@/types/download';

const API = process.env.NEXT_PUBLIC_API_URL ?? '';

function JobMenu({ job, onDeleted }: { job: DownloadJob; onDeleted: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleDelete = async () => {
    setOpen(false);
    try {
      await apiDelete(`/downloads/${job.id}`);
      toast.success('Download removed from history.');
      onDeleted(job.id);
    } catch {
      toast.error('Could not delete — you may need to be signed in.');
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-lg p-1.5 text-muted hover:bg-surface2 hover:text-white"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-8 z-50 w-44 overflow-hidden rounded-xl border border-border bg-surface shadow-xl">
          {/* Open source URL */}
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3.5 py-2.5 text-xs text-muted transition-colors hover:bg-surface2 hover:text-white"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open Source
          </a>

          {/* Re-download — go back to options page */}
          <a
            href={`/download/options?url=${encodeURIComponent(job.url)}`}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3.5 py-2.5 text-xs text-muted transition-colors hover:bg-surface2 hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Re-download
          </a>

          {/* Download file — only for completed jobs */}
          {job.status === 'completed' && (
            <a
              href={`${API}/api/downloads/${job.id}/file`}
              download={job.mediaFilename || undefined}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3.5 py-2.5 text-xs text-muted transition-colors hover:bg-surface2 hover:text-white"
            >
              <Download className="h-3.5 w-3.5" />
              Save to Device
            </a>
          )}

          <div className="my-1 h-px bg-border" />

          {/* Delete */}
          <button
            onClick={handleDelete}
            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-xs text-red-400 transition-colors hover:bg-red-500/10"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

const filterTabs = ['All', 'Completed', 'Downloading', 'Failed', 'Queued'];

const ITEMS_PER_PAGE = 10;

const statusConfig: Record<string, { label: string; className: string }> = {
  completed: { label: 'Completed', className: 'bg-green-400/10 text-green-400' },
  downloading: { label: 'Downloading', className: 'bg-accent/10 text-accent' },
  queued: { label: 'Queued', className: 'bg-yellow-400/10 text-yellow-400' },
  failed: { label: 'Failed', className: 'bg-red-400/10 text-red-400' },
  cancelled: { label: 'Cancelled', className: 'bg-muted/10 text-muted' },
  processing: { label: 'Processing', className: 'bg-blue-400/10 text-blue-400' },
  fetching_metadata: { label: 'Fetching', className: 'bg-purple-400/10 text-purple-400' },
};

function platformFromUrl(url: string): { name: string; color: string } {
  if (/youtu/.test(url)) return { name: 'YouTube', color: 'text-red-400' };
  if (/vimeo/.test(url)) return { name: 'Vimeo', color: 'text-blue-400' };
  if (/tiktok/.test(url)) return { name: 'TikTok', color: 'text-pink-400' };
  if (/instagram/.test(url)) return { name: 'Instagram', color: 'text-orange-400' };
  if (/twitter|x\.com/.test(url)) return { name: 'X / Twitter', color: 'text-sky-400' };
  if (/spotify/.test(url)) return { name: 'Spotify', color: 'text-green-400' };
  if (/soundcloud/.test(url)) return { name: 'SoundCloud', color: 'text-orange-400' };
  return { name: 'Direct Link', color: 'text-muted' };
}


export function HistoryTable() {
  const [jobs, setJobs] = useState<DownloadJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const load = () => {
    setLoading(true);
    listDownloadJobs()
      .then(setJobs)
      .catch(() => toast.error('Could not load download history.'))
      .finally(() => setLoading(false));
  };

  const handleDeleted = (id: string) => setJobs((prev) => prev.filter((j) => j.id !== id));

  useEffect(() => { load(); }, []);

  const filtered = jobs.filter((job) => {
    if (activeFilter !== 'All' && job.status !== activeFilter.toLowerCase()) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!job.mediaFilename.toLowerCase().includes(q) && !job.url.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <Card className="overflow-hidden p-0">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveFilter(tab); setPage(1); }}
              className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${
                activeFilter === tab
                  ? 'bg-accent/10 text-accent'
                  : 'text-muted hover:bg-surface2 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2">
            <Search className="h-3.5 w-3.5 text-muted" />
            <input
              type="text"
              placeholder="Search downloads..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-transparent text-xs text-white placeholder:text-muted/60 focus:outline-none sm:w-36"
            />
          </div>
          <button
            onClick={load}
            className="rounded-xl border border-border bg-surface p-2 text-muted hover:text-white"
            title="Refresh"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="space-y-3 p-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-xl bg-surface2" />
            ))}
          </div>
        ) : paginated.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <p className="text-sm font-medium text-white">No downloads found</p>
            <p className="text-xs text-muted">
              {jobs.length === 0
                ? 'Your download history will appear here after you start a download.'
                : 'No results match your current filter.'}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {[
                  { label: 'FILE', cls: '' },
                  { label: 'SOURCE', cls: 'hidden sm:table-cell' },
                  { label: 'PLATFORM', cls: 'hidden sm:table-cell' },
                  { label: 'DATE', cls: 'hidden sm:table-cell' },
                  { label: 'QUALITY', cls: '' },
                  { label: 'SIZE', cls: 'hidden sm:table-cell' },
                  { label: 'STATUS', cls: '' },
                  { label: '', cls: '' },
                ].map(({ label, cls }, i) => (
                  <th
                    key={i}
                    className={`whitespace-nowrap px-2 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted/60 sm:px-4 ${cls}`}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginated.map((job) => {
                const { name: platformName, color: platformColor } = platformFromUrl(job.url);
                const cfg = statusConfig[job.status] ?? { label: job.status, className: 'bg-muted/10 text-muted' };
                const date = new Date(job.startedAt).toLocaleDateString('en-GB');
                return (
                  <tr key={job.id} className="transition-colors hover:bg-surface2/40">
                    <td className="px-2 py-3 sm:px-4">
                      <span className="block max-w-[140px] truncate text-xs font-medium text-white sm:max-w-[180px]">
                        {job.mediaFilename || job.id}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block max-w-[140px] truncate text-xs text-muted hover:text-accent"
                      >
                        {job.url}
                      </a>
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <span className={`text-xs font-semibold ${platformColor}`}>{platformName}</span>
                    </td>
                    <td className="hidden px-4 py-3 text-xs text-muted sm:table-cell">{date}</td>
                    <td className="px-2 py-3 sm:px-4">
                      <span className="rounded-md bg-surface2 px-2 py-0.5 text-xs font-medium text-white">
                        {job.resolution || '—'}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 text-xs text-muted sm:table-cell">
                      {job.fileSize ?? job.totalSize ?? '—'}
                    </td>
                    <td className="px-2 py-3 sm:px-4">
                      {job.status === 'downloading' && job.progress > 0 ? (
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-accent">{job.progress}%</span>
                            {job.speed && <span className="text-muted">{job.speed}</span>}
                          </div>
                          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-surface2">
                            <div
                              className="h-full rounded-full bg-accent"
                              style={{ width: `${job.progress}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${cfg.className}`}>
                          {cfg.label}
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-3 sm:px-4">
                      <JobMenu job={job} onDeleted={handleDeleted} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && filtered.length > 0 && (
        <div className="flex flex-col gap-3 border-t border-border px-5 py-4 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <span>{filtered.length} download{filtered.length !== 1 ? 's' : ''}</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="rounded-lg p-1.5 hover:bg-surface2 hover:text-white disabled:opacity-30"
            >
              <ChevronFirst className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg p-1.5 hover:bg-surface2 hover:text-white disabled:opacity-30"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="px-2">{page} / {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-lg p-1.5 hover:bg-surface2 hover:text-white disabled:opacity-30"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className="rounded-lg p-1.5 hover:bg-surface2 hover:text-white disabled:opacity-30"
            >
              <ChevronLast className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}
