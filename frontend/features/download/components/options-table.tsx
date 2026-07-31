'use client';

import { useState } from 'react';
import { Download, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { QualityOption, AudioOption } from '@/types/download';

interface OptionsTableProps {
  qualities: QualityOption[];
  audioOptions: AudioOption[];
  onDownload: (qualityId: string, type: 'video' | 'audio') => void;
  loading?: boolean;
}

export function OptionsTable({ qualities, audioOptions, onDownload, loading }: OptionsTableProps) {
  const [tab, setTab] = useState<'video' | 'audio'>('video');

  return (
    <div>
      {/* Tabs */}
      <div className="mb-5 flex gap-1 border-b border-border">
        <button
          onClick={() => setTab('video')}
          className={`flex items-center gap-2 px-3 py-3 text-sm font-medium transition-colors sm:px-4 ${
            tab === 'video'
              ? 'border-b-2 border-accent text-white'
              : 'text-muted hover:text-white'
          }`}
        >
          🎬 Video Quality
        </button>
        <button
          onClick={() => setTab('audio')}
          className={`flex items-center gap-2 px-3 py-3 text-sm font-medium transition-colors sm:px-4 ${
            tab === 'audio'
              ? 'border-b-2 border-accent text-white'
              : 'text-muted hover:text-white'
          }`}
        >
          🎵 Audio Only
        </button>
      </div>

      {/* Video — card list on mobile, table on sm+ */}
      {tab === 'video' && (
        <>
          {/* Mobile cards */}
          <div className="flex flex-col gap-3 sm:hidden">
            {qualities.map((q) => (
              <div
                key={q.id}
                className="flex items-center gap-3 rounded-2xl border border-border bg-surface2/40 p-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{q.label}</span>
                    {q.recommended && (
                      <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-bold text-accent">
                        BEST
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted">
                    <span>{q.codec}</span>
                    {q.fps && <span>{q.fps}</span>}
                    <span>{q.container}</span>
                  </div>
                </div>
                <Button
                  className="shrink-0 gap-1.5 px-3 py-1.5 text-xs"
                  onClick={() => onDownload(q.id, 'video')}
                  disabled={loading}
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </Button>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-2xl border border-border sm:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface2">
                  {['RESOLUTION', 'CODEC / FPS', 'FEATURES', 'CONTAINER', 'ACTION'].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted/60"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {qualities.map((q) => (
                  <tr key={q.id} className="group transition-colors hover:bg-surface2/40">
                    <td className="px-5 py-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{q.label}</span>
                          {q.recommended && (
                            <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-bold text-accent">
                              RECOMMENDED
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-muted">{q.resolution}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="block text-sm text-white">{q.codec}</span>
                      {q.fps && <span className="text-xs text-muted">{q.fps}</span>}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {q.features.map((f) => (
                          <span key={f} className="rounded-md bg-surface2 px-2 py-0.5 text-xs text-muted">
                            {f}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted">{q.container}</td>
                    <td className="px-5 py-4">
                      <Button
                        className="gap-1.5 text-xs"
                        onClick={() => onDownload(q.id, 'video')}
                        disabled={loading}
                      >
                        <Download className="h-3.5 w-3.5" />
                        Download
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Audio — card list on mobile, table on sm+ */}
      {tab === 'audio' && (
        <>
          {/* Mobile cards */}
          <div className="flex flex-col gap-3 sm:hidden">
            {audioOptions.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-3 rounded-2xl border border-border bg-surface2/40 p-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-surface2 px-2 py-0.5 text-xs font-semibold text-white">
                      {a.format}
                    </span>
                    <span className="text-sm font-medium text-white">{a.label}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-muted">
                    <span>{a.bitrate}</span>
                  </div>
                </div>
                <Button
                  className="shrink-0 gap-1.5 px-3 py-1.5 text-xs"
                  onClick={() => onDownload(a.id, 'audio')}
                  disabled={loading}
                >
                  <Download className="h-3.5 w-3.5" />
                  Extract
                </Button>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-2xl border border-border sm:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface2">
                  {['FORMAT', 'QUALITY', 'BITRATE', 'ACTION'].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted/60"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {audioOptions.map((a) => (
                  <tr key={a.id} className="transition-colors hover:bg-surface2/40">
                    <td className="px-5 py-4">
                      <span className="rounded-md bg-surface2 px-2.5 py-1 text-xs font-semibold text-white">
                        {a.format}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-white">{a.label}</td>
                    <td className="px-5 py-4 text-sm text-muted">{a.bitrate}</td>
                    <td className="px-5 py-4">
                      <Button
                        className="gap-1.5 text-xs"
                        onClick={() => onDownload(a.id, 'audio')}
                        disabled={loading}
                      >
                        <Download className="h-3.5 w-3.5" />
                        Download
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Empty state */}
      {tab === 'video' && qualities.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <CheckCircle2 className="h-8 w-8 text-muted/40" />
          <p className="text-sm text-muted">No video formats available for this URL.</p>
        </div>
      )}
      {tab === 'audio' && audioOptions.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <CheckCircle2 className="h-8 w-8 text-muted/40" />
          <p className="text-sm text-muted">No audio formats available for this URL.</p>
        </div>
      )}
    </div>
  );
}
