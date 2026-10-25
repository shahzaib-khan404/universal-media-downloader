'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/navigation/footer';
import { Library, FolderArchive, ArrowRight, Clipboard, CheckCircle, Music2, Video, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AlbumDownloaderPage() {
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

  const handleFetch = () => {
    const trimmed = url.trim();
    if (!trimmed) {
      setInputError('Please enter a playlist or album URL.');
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
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-12 space-y-16">
        {/* Hero Section */}
        <section className="flex flex-col items-center text-center pt-8 sm:pt-12">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-50 px-4 py-2 text-xs font-bold text-purple-700">
            <Library className="h-4 w-4" />
            Full Album & Playlist Batch Downloader
          </div>

          <h1 className="max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-6xl">
            Download Entire Albums & Playlists
            <br />
            <span className="text-accent">In One Single Click</span>
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600 font-medium sm:text-base">
            Paste any YouTube playlist, SoundCloud set, or music discography. Choose to export the full collection as high-fidelity audio tracks (MP3 320k) or video files, all packaged cleanly in a ready-to-unzip archive.
          </p>

          {/* Input Box */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleFetch(); }}
            className="mt-8 w-full max-w-2xl sm:mt-10"
          >
            <div className={`flex items-center gap-1.5 rounded-2xl border bg-white p-2 shadow-sm transition-colors sm:gap-2 sm:px-3 ${inputError ? 'border-red-500/60' : 'border-slate-200'}`}>
              <FolderArchive className="h-5 w-5 shrink-0 text-accent ml-2" />
              <input
                type="text"
                value={url}
                onChange={(e) => { setUrl(e.target.value); if (inputError) setInputError(''); }}
                placeholder="Paste playlist or album link (YouTube, SoundCloud, Bandcamp)..."
                className="min-w-0 flex-1 bg-transparent px-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none font-medium"
              />
              <button
                type="button"
                onClick={handlePaste}
                className="flex shrink-0 items-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-600 transition-colors hover:text-slate-900 hover:bg-slate-100 sm:px-3"
              >
                <Clipboard className="h-3.5 w-3.5 text-accent" />
                <span className="hidden sm:inline">Paste</span>
              </button>
              <Button type="submit" className="btn-3d-orange shrink-0 gap-1.5 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-sm">
                Inspect Album
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            {inputError && (
              <p className="mt-2 text-left text-xs text-red-500 font-medium">{inputError}</p>
            )}
          </form>
        </section>

        {/* Feature Cards */}
        <section className="grid gap-6 sm:grid-cols-2 max-w-4xl mx-auto">
          <div className="rounded-3xl border border-[#FF6B00]/30 bg-gradient-to-b from-[#FFF5ED] via-[#FFEADB] to-[#FEDBC0] p-8 space-y-4 shadow-[0_10px_25px_-5px_rgba(255,107,0,0.18)] hover:shadow-[0_18px_35px_-6px_rgba(255,107,0,0.28)] hover:border-[#FF6B00] hover:-translate-y-1.5 transition-all">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#FF6B00] to-[#FFA766] text-white shadow-md shadow-orange-500/25">
              <Music2 className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">Export as Music Album</h3>
            <p className="text-sm text-slate-700 font-medium leading-6">
              Extracts each track sequentially in 320 kbps MP3 or FLAC, embeds album art, tags track numbers (01, 02, 03...), and packages everything into an organized zip file.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-bold text-[#FF5E00]">
              <CheckCircle className="h-4 w-4" />
              Numbered tracks + ID3 Cover Art
            </div>
          </div>

          <div className="rounded-3xl border border-[#FF6B00]/30 bg-gradient-to-b from-[#FFF5ED] via-[#FFEADB] to-[#FEDBC0] p-8 space-y-4 shadow-[0_10px_25px_-5px_rgba(255,107,0,0.18)] hover:shadow-[0_18px_35px_-6px_rgba(255,107,0,0.28)] hover:border-[#FF6B00] hover:-translate-y-1.5 transition-all">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#FF6B00] to-[#FFA766] text-white shadow-md shadow-orange-500/25">
              <Video className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">Export as Video Playlist</h3>
            <p className="text-sm text-slate-700 font-medium leading-6">
              Archives entire courses, video series, or music video compilations at 1080p or 720p with synchronized audio streams and original filenames.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-bold text-[#FF5E00]">
              <CheckCircle className="h-4 w-4" />
              Full HD Video Batch Archiving
            </div>
          </div>
        </section>

        {/* Bottom Banner */}
        <section className="max-w-4xl mx-auto rounded-3xl border border-orange-500/25 bg-orange-50/60 p-8 text-center space-y-3 shadow-sm">
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-accent">
            <Sparkles className="h-4 w-4" />
            No Rate Limits or Interstitial Popups
          </div>
          <h4 className="text-2xl font-extrabold text-slate-900">Ready to archive large discographies?</h4>
          <p className="text-xs text-slate-600 font-medium max-w-xl mx-auto">
            Universal Media Downloader uses async queue processing so even 50+ video playlists process reliably in the background without browser stalls.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
