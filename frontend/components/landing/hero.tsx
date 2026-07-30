'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Link2, Clipboard, ArrowRight, PlayCircle, Music2, Camera, Users, Video, FileVideo } from 'lucide-react';
import { Button } from '@/components/ui/button';

const platforms = [
  { name: 'YouTube', Icon: PlayCircle },
  { name: 'TikTok', Icon: Music2 },
  { name: 'Instagram', Icon: Camera },
  { name: 'Facebook', Icon: Users },
  { name: 'Vimeo', Icon: Video },
  { name: 'Direct Links', Icon: FileVideo },
];

export function HeroSection() {
  const [url, setUrl] = useState('');
  const router = useRouter();

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
    } catch {
      // clipboard access denied — ignore
    }
  };

  const handleDownload = () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    router.push(`/download/options?url=${encodeURIComponent(trimmed)}`);
  };

  return (
    <section className="flex flex-col items-center pb-4 pt-12 text-center">
      {/* Release badge */}
      <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-xs text-muted">
        <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
        v4.0 Release: Now with 8K Support
      </div>

      {/* Headline */}
      <h1 className="max-w-4xl text-5xl font-bold leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl">
        Download Video & Audio
        <br />
        <span className="text-accent">From Anywhere</span>
      </h1>

      <p className="mt-6 max-w-xl text-sm leading-7 text-muted sm:text-base">
        A professional-grade engine built for speed. Securely archive and download media from
        1,800+ supported platforms in seconds with full metadata retention.
      </p>

      {/* URL input bar */}
      <form
        onSubmit={(e) => { e.preventDefault(); handleDownload(); }}
        className="mt-10 flex w-full max-w-2xl items-center gap-2 rounded-2xl border border-border bg-surface px-3 py-2"
      >
        <Link2 className="h-4 w-4 shrink-0 text-muted" />
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste URL here (e.g., https://youtube.com/...)"
          className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-muted/60 focus:outline-none"
        />
        <button
          type="button"
          onClick={handlePaste}
          className="flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs text-muted transition-colors hover:text-white"
        >
          <Clipboard className="h-3.5 w-3.5" />
          Paste
        </button>
        <Button type="submit" className="shrink-0 gap-1.5 rounded-xl text-sm">
          Download <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </form>

      {/* Supported platforms */}
      <div className="mt-12">
        <p className="mb-5 text-xs uppercase tracking-[0.3em] text-muted/60">Supported Platforms</p>
        <div className="flex flex-wrap items-center justify-center gap-8">
          {platforms.map(({ name, Icon }) => (
            <span
              key={name}
              className="flex items-center gap-2 text-sm text-muted/60 transition-colors hover:text-muted"
            >
              <Icon className="h-4 w-4" />
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
