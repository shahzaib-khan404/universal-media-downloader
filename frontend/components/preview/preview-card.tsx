'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Share2,
  Eye,
  Calendar,
  Download,
  Copy,
  Bookmark,
  Info,
  PlayCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const resolutions = [
  { label: '4K (2160p)', sub: 'MP4 • 450 MB', value: '4k', badge: 'BEST' },
  { label: '1080p Full HD', sub: 'MP4 • 120 MB', value: '1080p' },
  { label: '720p HD', sub: 'MP4 • 65 MB', value: '720p' },
];

const recommended = [
  { title: 'Blue Planet: The Deep', channel: 'BBC Earth', duration: '8:20' },
  { title: 'Cities of the Future 2077', channel: 'TechInsider', duration: '15:45' },
  { title: 'Everest: The Death Zone', channel: 'Nat Geo', duration: '42:10' },
  { title: 'Inside the Silicon Revolution', channel: 'Verge Tech', duration: '12:05' },
];

export function PreviewCard() {
  const [selectedRes, setSelectedRes] = useState('4k');
  const [activeTab, setActiveTab] = useState('Video');

  return (
    <div className="space-y-10">
      {/* Back */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Return to Search
      </Link>

      {/* Main two-column layout */}
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Left — video + info */}
        <div className="space-y-5">
          {/* Video player placeholder */}
          <div className="relative aspect-video overflow-hidden rounded-3xl bg-surface2">
            <div className="absolute left-3 top-3 rounded-lg bg-accent px-2.5 py-1 text-xs font-bold text-white">
              4K ULTRA HD
            </div>
            {/* Fake progress bar */}
            <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-black/60 p-3 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/20">
                  <div className="h-full w-[28%] rounded-full bg-accent" />
                </div>
                <span className="text-xs text-white">12:45</span>
              </div>
            </div>
          </div>

          {/* Format tabs */}
          <div className="flex gap-2">
            {['Video', 'Audio', 'Playlist'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-accent text-white'
                    : 'bg-surface2 text-muted hover:text-white'
                }`}
              >
                {tab === 'Video' && <PlayCircle className="h-3.5 w-3.5" />}
                {tab}
              </button>
            ))}
          </div>

          {/* Title card */}
          <Card className="p-6">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-lg font-semibold leading-snug text-white">
                Exploring the Frontiers of Space: Beyond the Known Universe
              </h2>
              <button className="shrink-0 rounded-lg p-2 text-muted hover:bg-surface2 hover:text-white">
                <Share2 className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-surface2" />
                <div>
                  <p className="text-sm font-medium text-white">National Geographic</p>
                  <p className="text-xs text-muted">22.4M subscribers</p>
                </div>
              </div>
              <button className="rounded-xl border border-border px-4 py-2 text-xs text-muted transition-colors hover:text-white">
                Visit Channel
              </button>
            </div>

            <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted">
              Join us on an epic journey as we venture past the edges of our solar system and into
              the vast unknown. In this episode, we investigate the latest discoveries from the
              James Webb Space Telescope, uncovering secrets of distant exoplanets, massive black
              holes, and the mysterious forces that shape our cosmos.
            </p>
            <button className="mt-2 text-xs text-accent hover:underline">Show more</button>
          </Card>
        </div>

        {/* Right — file info + download */}
        <div className="space-y-4">
          {/* File info */}
          <Card className="p-5">
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-muted/60">
              File Information
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-1.5 text-muted">
                  <Eye className="h-3 w-3" />
                  <span className="text-[10px]">Estimated Size</span>
                </div>
                <p className="mt-1 text-sm font-medium text-white">450.2 MB</p>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-muted">
                  <PlayCircle className="h-3 w-3 text-red-400" />
                  <span className="text-[10px]">Platform</span>
                </div>
                <p className="mt-1 text-sm font-medium text-white">YouTube</p>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-muted">
                  <Eye className="h-3 w-3" />
                  <span className="text-[10px]">Views</span>
                </div>
                <p className="mt-1 text-sm font-medium text-white">1,240,582</p>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-muted">
                  <Calendar className="h-3 w-3" />
                  <span className="text-[10px]">Uploaded</span>
                </div>
                <p className="mt-1 text-sm font-medium text-white">Oct 12, 2023</p>
              </div>
            </div>
          </Card>

          {/* Resolution selector */}
          <Card className="p-5">
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-muted/60">
              Select Resolution
            </p>
            <div className="space-y-2">
              {resolutions.map((res) => (
                <label
                  key={res.value}
                  className={`flex cursor-pointer items-center justify-between rounded-2xl border p-3.5 transition-colors ${
                    selectedRes === res.value
                      ? 'border-accent bg-accent/5'
                      : 'border-border hover:border-muted/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="resolution"
                      value={res.value}
                      checked={selectedRes === res.value}
                      onChange={() => setSelectedRes(res.value)}
                      className="accent-accent"
                    />
                    <div>
                      <p className="text-sm font-medium text-white">{res.label}</p>
                      <p className="text-xs text-muted">{res.sub}</p>
                    </div>
                  </div>
                  {res.badge && (
                    <span className="rounded-md bg-accent/10 px-2 py-0.5 text-[10px] font-bold text-accent">
                      {res.badge}
                    </span>
                  )}
                </label>
              ))}
            </div>
          </Card>

          {/* Download CTA */}
          <Button className="w-full gap-2 py-4 text-sm">
            <Download className="h-4 w-4" />
            Download Now
          </Button>

          {/* Secondary actions */}
          <div className="grid grid-cols-2 gap-2">
            <button className="flex items-center justify-center gap-2 rounded-2xl border border-border py-2.5 text-xs text-muted transition-colors hover:bg-surface2 hover:text-white">
              <Copy className="h-3.5 w-3.5" /> Copy Link
            </button>
            <button className="flex items-center justify-center gap-2 rounded-2xl border border-border py-2.5 text-xs text-muted transition-colors hover:bg-surface2 hover:text-white">
              <Bookmark className="h-3.5 w-3.5" /> Save
            </button>
          </div>

          {/* Pro tip */}
          <div className="flex items-start gap-3 rounded-2xl border border-border bg-accent/5 p-4">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <div>
              <p className="text-xs font-semibold text-accent">Pro Tip</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted">
                Upgrade to Premium for 10x faster download speeds and batch processing.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended */}
      <section>
        <h2 className="mb-5 text-xl font-semibold text-white">Recommended Media</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {recommended.map(({ title, channel, duration }) => (
            <button key={title} className="group text-left">
              <div className="relative aspect-video overflow-hidden rounded-2xl bg-surface2">
                <span className="absolute bottom-2 right-2 rounded-md bg-black/80 px-1.5 py-0.5 text-xs text-white">
                  {duration}
                </span>
              </div>
              <p className="mt-2 line-clamp-2 text-sm font-medium text-white transition-colors group-hover:text-accent">
                {title}
              </p>
              <p className="mt-0.5 text-xs text-muted">{channel}</p>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
