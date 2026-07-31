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
  const [inputError, setInputError] = useState('');
  const router = useRouter();

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
      setInputError('');
    } catch {
      setInputError('Clipboard access was denied. Please paste manually with Ctrl+V / ⌘V.');
    }
  };

  const handleDownload = () => {
    const trimmed = url.trim();
    if (!trimmed) {
      setInputError('Please enter a URL to download.');
      return;
    }
    if (!/^https?:\/\/.+/i.test(trimmed)) {
      setInputError('Please enter a valid URL starting with http:// or https://');
      return;
    }
    setInputError('');
    router.push(`/download/options?url=${encodeURIComponent(trimmed)}`);
  };

  return (
    <section className="flex flex-col items-center px-4 pb-4 pt-10 text-center sm:pt-12">
      {/* Release badge */}
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-xs text-muted sm:mb-8">
        <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
        v4.0 Release: Now with 8K Support
      </div>

      {/* Headline */}
      <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-7xl">
        Download Video & Audio
        <br />
        <span className="text-accent">From Anywhere</span>
      </h1>

      <p className="mt-5 max-w-xl text-sm leading-7 text-muted sm:mt-6 sm:text-base">
        A professional-grade engine built for speed. Securely archive and download media from
        1,800+ supported platforms in seconds with full metadata retention.
      </p>

      {/* URL input bar */}
      <form
        onSubmit={(e) => { e.preventDefault(); handleDownload(); }}
        className="mt-8 w-full max-w-2xl sm:mt-10"
      >
        <div className={`flex items-center gap-1.5 rounded-2xl border bg-surface px-2 py-2 transition-colors sm:gap-2 sm:px-3 ${inputError ? 'border-red-500/60' : 'border-border'}`}>
          <Link2 className="h-4 w-4 shrink-0 text-muted" />
          <input
            type="text"
            value={url}
            onChange={(e) => { setUrl(e.target.value); if (inputError) setInputError(''); }}
            placeholder="Paste a URL to download..."
            className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-muted/60 focus:outline-none"
          />
          {/* Paste — icon only on small screens, icon+label on sm+ */}
          <button
            type="button"
            onClick={handlePaste}
            className="flex shrink-0 items-center gap-1.5 rounded-xl px-2 py-2 text-xs text-muted transition-colors hover:text-white sm:px-3"
          >
            <Clipboard className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Paste</span>
          </button>
          <Button type="submit" className="shrink-0 gap-1.5 rounded-xl px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm">
            <span className="hidden sm:inline">Download</span>
            <span className="sm:hidden">Go</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
        {inputError && (
          <p className="mt-2 text-left text-xs text-red-400">{inputError}</p>
        )}
      </form>

      {/* Supported platforms */}
      <div className="mt-10 sm:mt-12">
        <p className="mb-4 text-xs uppercase tracking-[0.3em] text-muted/60 sm:mb-5">Supported Platforms</p>
        <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-8">
          {platforms.map(({ name, Icon }) => (
            <span
              key={name}
              className="flex items-center gap-2 text-sm text-muted/60 transition-colors hover:text-muted"
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{name}</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
