'use client';

import { useState } from 'react';
import { Download, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { QualityOption, AudioOption, PlaylistTrack } from '@/types/download';
import { ListMusic, FolderArchive } from 'lucide-react';

interface OptionsTableProps {
  qualities: QualityOption[];
  audioOptions: AudioOption[];
  onDownload: (qualityId: string, type: 'video' | 'audio') => void;
  loading?: boolean;
  defaultTab?: 'video' | 'audio';
  isPlaylist?: boolean;
  entries?: PlaylistTrack[];
}

export function OptionsTable({
  qualities,
  audioOptions,
  onDownload,
  loading,
  defaultTab = 'video',
  isPlaylist = false,
  entries = [],
}: OptionsTableProps) {
  const [tab, setTab] = useState<'video' | 'audio'>(defaultTab);

  return (
    <div>
      {/* If this is an album / playlist, show album banner */}
      {isPlaylist && (
        <div className="mb-6 rounded-2xl border border-accent/20 bg-accent/5 p-4 sm:p-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-accent mb-1">
            <FolderArchive className="h-4 w-4" />
            Collection Detected: {entries.length} Tracks in Album / Playlist
          </div>
          <p className="text-xs text-muted">
            All tracks in this collection will be downloaded and bundled into a single ZIP file with embedded metadata and cover artwork. Choose below whether to export as a <strong>Music Album</strong> or <strong>Video Playlist</strong>.
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 flex gap-2 p-1.5 rounded-2xl bg-slate-100 border border-slate-200 w-fit shadow-inner">
        <button
          onClick={() => setTab('video')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
            tab === 'video'
              ? 'btn-3d-orange text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
          }`}
        >
          {isPlaylist ? '🎬 Video Playlist' : '🎬 Video Quality'}
        </button>
        <button
          onClick={() => setTab('audio')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
            tab === 'audio'
              ? 'btn-3d-orange text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
          }`}
        >
          {isPlaylist ? '🎵 Music Album (MP3/FLAC)' : '🎵 Audio Only'}
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
                className="flex items-center gap-3 rounded-2xl border border-orange-200/70 bg-gradient-to-b from-[#FFF5ED] via-[#FFEADB] to-[#FEDBC0] p-4 shadow-sm"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{q.label}</span>
                    {q.recommended && (
                      <span className="rounded-full bg-[#FF6B00]/15 px-2 py-0.5 text-[10px] font-bold text-[#FF6B00]">
                        BEST
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-600 font-medium">
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
                <tr className="border-b border-slate-200 bg-slate-50">
                  {['RESOLUTION', 'CODEC / FPS', 'FEATURES', 'CONTAINER', 'ACTION'].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {qualities.map((q) => (
                  <tr key={q.id} className="group transition-colors hover:bg-orange-50/40">
                    <td className="px-5 py-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{q.label}</span>
                          {q.recommended && (
                            <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold text-accent">
                              RECOMMENDED
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-500 font-medium">{q.resolution}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="block text-sm font-semibold text-slate-800">{q.codec}</span>
                      {q.fps && <span className="text-xs text-slate-500">{q.fps}</span>}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {q.features.map((f) => (
                          <span key={f} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                            {f}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-slate-600">{q.container}</td>
                    <td className="px-5 py-4">
                      <button
                        className="btn-3d-orange flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-sm"
                        onClick={() => onDownload(q.id, 'video')}
                        disabled={loading}
                      >
                        <Download className="h-3.5 w-3.5" />
                        Download
                      </button>
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
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-orange-100 px-2 py-0.5 text-xs font-bold text-accent">
                      {a.format}
                    </span>
                    <span className="text-sm font-bold text-slate-900">{a.label}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-slate-500 font-medium">
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
          <div className="hidden overflow-x-auto rounded-2xl border border-slate-200 bg-white sm:block shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  {['FORMAT', 'QUALITY', 'BITRATE', 'ACTION'].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {audioOptions.map((a) => (
                  <tr key={a.id} className="transition-colors hover:bg-orange-50/40">
                    <td className="px-5 py-4">
                      <span className="rounded-md bg-orange-50 border border-orange-200 px-2.5 py-1 text-xs font-bold text-accent">
                        {a.format}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm font-bold text-slate-900">{a.label}</td>
                    <td className="px-5 py-4 text-sm font-medium text-slate-600">{a.bitrate}</td>
                    <td className="px-5 py-4">
                      <button
                        className="btn-3d-orange flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-sm"
                        onClick={() => onDownload(a.id, 'audio')}
                        disabled={loading}
                      >
                        <Download className="h-3.5 w-3.5" />
                        Extract
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Playlist / Album Track List Preview */}
      {isPlaylist && entries.length > 0 && (
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-sm font-bold text-slate-900">
            <ListMusic className="h-4 w-4 text-accent" />
            Track Listing ({entries.length} Items)
          </div>
          <div className="max-h-60 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-100">
            {entries.map((track) => (
              <div key={track.id} className="pt-2 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-slate-400 font-mono w-5 shrink-0 text-right font-medium">
                    {String(track.index).padStart(2, '0')}
                  </span>
                  <span className="text-slate-800 truncate font-semibold">{track.title}</span>
                </div>
                {track.duration > 0 && (
                  <span className="text-slate-500 text-[11px] shrink-0 ml-2 font-medium">
                    {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
