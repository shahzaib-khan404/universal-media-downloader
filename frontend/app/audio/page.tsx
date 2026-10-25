'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/navigation/footer';
import { Headphones, Music, Sparkles, ArrowRight, Clipboard, Disc, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';

const audioProfiles = [
  {
    format: 'MP3 320 kbps',
    label: 'Extreme Audio Quality',
    desc: 'Studio bitrate with full dynamic range and rich bass reproduction.',
    badge: 'Popular',
  },
  {
    format: 'FLAC / Lossless',
    label: 'Hi-Res Lossless Audio',
    desc: 'Uncompressed CD-quality audio stream for audiophiles and archival.',
    badge: 'Studio',
  },
  {
    format: 'M4A / AAC 256k',
    label: 'Apple & Mobile Tuned',
    desc: 'Maximum fidelity with lightweight battery-efficient playback.',
    badge: 'Optimized',
  },
];

export default function AudioDownloaderPage() {
  const [url, setUrl] = useState('');
  const [inputError, setInputError] = useState('');
  const router = useRouter();

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
      setInputError('');
    } catch {
      setInputError('Clipboard access was denied. Please paste manually.');
    }
  };

  const handleConvert = () => {
    const trimmed = url.trim();
    if (!trimmed) {
      setInputError('Please enter an audio or video link to extract.');
      return;
    }
    if (!/^https?:\/\/.+/i.test(trimmed)) {
      setInputError('Please enter a valid URL starting with http:// or https://');
      return;
    }
    setInputError('');
    router.push(`/download/options?url=${encodeURIComponent(trimmed)}&mode=audio`);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-12 space-y-16">
        {/* Hero Section */}
        <section className="flex flex-col items-center text-center pt-8 sm:pt-12">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-xs font-bold text-accent">
            <Headphones className="h-4 w-4" />
            Dedicated Audio & MP3 Studio
          </div>

          <h1 className="max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-6xl">
            Extract Clean Audio & MP3
            <br />
            <span className="text-accent">With Full ID3 Tags & Cover Art</span>
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600 font-medium sm:text-base">
            Convert any video, live stream, or sound clip into high-definition 320 kbps MP3, M4A, or FLAC. 
            Original artist names, albums, and high-resolution album artwork are embedded automatically.
          </p>

          {/* Input Box */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleConvert(); }}
            className="mt-8 w-full max-w-2xl sm:mt-10"
          >
            <div className={`flex items-center gap-1.5 rounded-2xl border bg-white p-2 shadow-sm transition-colors sm:gap-2 sm:px-3 ${inputError ? 'border-red-500/60' : 'border-slate-200'}`}>
              <Music className="h-5 w-5 shrink-0 text-accent ml-2" />
              <input
                type="text"
                value={url}
                onChange={(e) => { setUrl(e.target.value); if (inputError) setInputError(''); }}
                placeholder="Paste video, song, or sound link (YouTube, SoundCloud, TikTok)..."
                className="min-w-0 flex-1 bg-transparent px-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none font-medium"
              />
              <button
                type="button"
                onClick={handlePaste}
                className="flex shrink-0 items-center gap-1.5 rounded-xl px-2 py-2 text-xs font-semibold text-slate-600 transition-colors hover:text-slate-900 hover:bg-slate-100 sm:px-3"
              >
                <Clipboard className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Paste</span>
              </button>
              <Button type="submit" className="btn-3d-orange shrink-0 gap-1.5 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-sm">
                Extract Audio
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            {inputError && (
              <p className="mt-2 text-left text-xs text-red-500 font-medium">{inputError}</p>
            )}
          </form>
        </section>

        {/* Audio Profiles Feature Grid */}
        <section className="grid gap-6 sm:grid-cols-3 max-w-5xl mx-auto">
          {audioProfiles.map((p) => (
            <div
              key={p.format}
              className="relative rounded-3xl border border-[#FF6B00]/30 bg-gradient-to-b from-[#FFF5ED] via-[#FFEADB] to-[#FEDBC0] p-6 shadow-[0_10px_25px_-5px_rgba(255,107,0,0.15)] transition-all hover:border-[#FF6B00] hover:-translate-y-1.5 hover:shadow-[0_18px_35px_-6px_rgba(255,107,0,0.28)]"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-extrabold text-[#FF5E00]">{p.format}</span>
                <span className="rounded-full bg-[#FF6B00]/15 border border-[#FF6B00]/30 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-[#FF6B00]">
                  {p.badge}
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 mb-2">{p.label}</h3>
              <p className="text-xs leading-5 text-slate-700 font-medium">{p.desc}</p>
            </div>
          ))}
        </section>

        {/* Tagging Explanation Banner */}
        <section className="max-w-4xl mx-auto rounded-3xl border border-slate-200 bg-white/90 p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start text-xs font-bold text-accent">
              <Sparkles className="h-4 w-4" />
              Smart Tagging Engine
            </div>
            <h4 className="text-xl font-extrabold text-slate-900">Plays Everywhere With Rich Artwork</h4>
            <p className="text-xs text-slate-600 font-medium max-w-lg">
              Songs extracted with UMD display thumbnail cover posters, artist metadata, and proper track titles across Spotify local files, Apple Music, and car displays.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <div className="h-14 w-14 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-accent shadow-sm">
              <Disc className="h-7 w-7" />
            </div>
            <div className="h-14 w-14 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-accent shadow-sm">
              <Radio className="h-7 w-7" />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
