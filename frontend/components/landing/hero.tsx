'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Link2, Clipboard, ArrowRight, PlayCircle, Music2, Camera, Users, Video, FileVideo, Sparkles, Disc, Radio } from 'lucide-react';

const platforms = [
  { name: 'YouTube', Icon: PlayCircle },
  { name: 'TikTok', Icon: Music2 },
  { name: 'Instagram', Icon: Camera },
  { name: 'Facebook', Icon: Users },
  { name: 'SoundCloud', Icon: Disc },
  { name: 'Vimeo', Icon: Video },
  { name: 'Direct Links', Icon: FileVideo },
];

export function HeroSection() {
  const [url, setUrl] = useState('');
  const [inputError, setInputError] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
      setInputError('');
    } catch {
      setInputError('Clipboard access denied. Please paste manually with Ctrl+V / ⌘V.');
    }
  };

  const handleDownload = () => {
    const trimmed = url.trim();
    if (!trimmed) {
      setInputError('Please paste any video, music, or playlist URL.');
      return;
    }
    if (!/^https?:\/\/.+/i.test(trimmed)) {
      setInputError('Please enter a valid link starting with http:// or https://');
      return;
    }
    setInputError('');
    router.push(`/download/options?url=${encodeURIComponent(trimmed)}`);
  };

  return (
    <section className="relative flex flex-col items-center px-4 pt-10 pb-8 text-center sm:pt-16">

      {/* 3D Floating Glow Orbs (Inspired by Shutterstock 3D glass aesthetic) */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-[#FF6B00]/20 via-[#FFA766]/10 to-transparent blur-[110px] rounded-full -z-10"
      />
      
      {/* Left 3D Floating Sphere */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute -top-4 left-6 sm:left-24 w-16 h-16 sm:w-24 sm:h-24 orb-3d animate-float-slow -z-10 opacity-70" 
      />

      {/* Right 3D Translucent Glass Orb */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute top-12 right-6 sm:right-28 w-20 h-20 sm:w-32 sm:h-32 orb-glass animate-float-medium -z-10 opacity-75" 
      />

      {/* Small floating sphere near CTA */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute bottom-10 left-12 sm:left-40 w-8 h-8 sm:w-12 sm:h-12 orb-3d animate-float-fast -z-10 opacity-60" 
      />

      {/* Release pill badge */}
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-white/80 backdrop-blur-xl px-4 py-1.5 text-xs font-semibold text-slate-800 shadow-sm">
        <span className="flex h-2 w-2 rounded-full bg-accent animate-ping" />
        <span className="text-accent font-bold">New v4.2</span> • 3D High-Speed Media Vault
        <Sparkles className="h-3 w-3 text-accent" />
      </div>

      {/* Headline */}
      <h1 className="max-w-4xl text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
        Download <span className="bg-gradient-to-r from-accent via-accentLight to-[#FF903F] bg-clip-text text-transparent">Anything</span>.
        <br />
        <span className="text-slate-900">Crystal Clear. Instantly.</span>
      </h1>

      <p className="mt-5 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base font-medium">
        A playful, high-performance engine for downloading 4K videos, 320 kbps MP3 tracks, and full music albums across 1,800+ sites with instant conversion.
      </p>

      {/* 3D Glassmorphic URL Bar with Orange Neon Glow */}
      <form
        onSubmit={(e) => { e.preventDefault(); handleDownload(); }}
        className="mt-8 w-full max-w-2xl sm:mt-12"
      >
        <div 
          className={`relative rounded-3xl p-2 transition-all duration-300 ${
            isFocused 
              ? 'glass-panel-elevated ring-2 ring-accent shadow-orangeGlow' 
              : 'glass-panel shadow-sm hover:border-slate-300'
          } ${inputError ? 'ring-2 ring-red-500/80' : ''}`}
        >
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex items-center gap-3 flex-1 px-3 py-1.5 min-w-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/15 text-accent shrink-0">
                <Link2 className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={url}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onChange={(e) => { setUrl(e.target.value); if (inputError) setInputError(''); }}
                placeholder="Paste YouTube, TikTok, SoundCloud, or playlist link..."
                className="min-w-0 flex-1 bg-transparent text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none font-medium"
              />
            </div>

            <div className="flex items-center gap-2 justify-end shrink-0 pt-1 sm:pt-0">
              {/* Paste Quick Button */}
              <button
                type="button"
                onClick={handlePaste}
                className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-100/80 px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-200 hover:text-slate-900"
              >
                <Clipboard className="h-3.5 w-3.5 text-accent" />
                <span>Paste</span>
              </button>

              {/* High-Converting 3D Orange CTA */}
              <button
                type="submit"
                className="btn-3d-orange flex items-center justify-center gap-2 rounded-2xl px-6 py-2.5 text-xs sm:text-sm font-bold text-white uppercase tracking-wider"
              >
                <span>Download Now</span>
                <ArrowRight className="h-4 w-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>

        {inputError && (
          <p className="mt-2.5 text-left text-xs text-red-400 font-medium px-2">{inputError}</p>
        )}
      </form>

      {/* Supported Platforms Glass Chips */}
      <div className="mt-10 sm:mt-14 w-full max-w-3xl">
        <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.25em] text-slate-500">
          Supported Platforms
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5">
          {platforms.map(({ name, Icon }) => (
            <div
              key={name}
              className="group flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 backdrop-blur-md px-3.5 py-1.5 text-xs font-semibold text-slate-600 transition-all duration-200 hover:border-accent/40 hover:bg-orange-50 hover:text-accent hover:scale-105 shadow-sm"
            >
              <Icon className="h-3.5 w-3.5 text-accent transition-transform group-hover:rotate-6" />
              <span>{name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
