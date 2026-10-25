import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowDownToLine } from 'lucide-react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen overflow-hidden bg-[#F8FAFC]">
      {/* Background 3D ambient orbs */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-[#FF6B00]/10 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 right-10 h-96 w-96 rounded-full bg-[#FF8533]/10 blur-[140px] pointer-events-none" />

      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 lg:flex-col lg:justify-between p-12 border-r border-slate-200 relative z-10 glass-panel">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF6B00] to-[#E05300] shadow-[0_4px_16px_rgba(255,107,0,0.4)]">
            <ArrowDownToLine className="h-6 w-6 text-white" />
          </div>
          <span className="text-base font-black text-slate-900 tracking-wide">
            Universal <span className="text-[#FF6B00]">Media Downloader</span>
          </span>
        </Link>

        {/* Decorative quote & stats */}
        <div className="my-auto">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#FF6B00]/40 bg-[#FF6B00]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-[#FF6B00]">
            Ultra-Speed Media Hub
          </div>
          <blockquote className="mb-8 text-3xl font-extrabold leading-snug text-slate-900">
            &ldquo;Extract any stream in 8K & 320k. <br />
            Keep everything offline forever.&rdquo;
          </blockquote>

          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-200">
            <div className="glass-panel p-4 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-2xl font-black text-[#FF6B00]">240M+</p>
              <p className="mt-1 text-xs text-slate-500 font-medium">Streams Served</p>
            </div>
            <div className="glass-panel p-4 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-2xl font-black text-emerald-600">99.9%</p>
              <p className="mt-1 text-xs text-slate-500 font-medium">Success Rate</p>
            </div>
            <div className="glass-panel p-4 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-2xl font-black text-slate-900">1,000+</p>
              <p className="mt-1 text-xs text-slate-500 font-medium">Sites Supported</p>
            </div>
          </div>
        </div>

        {/* Platform indicator dots */}
        <div className="flex items-center gap-2">
          <div className="h-2 w-8 rounded-full bg-[#FF6B00] shadow-[0_0_10px_rgba(255,107,0,0.4)]" />
          <div className="h-2 w-2 rounded-full bg-slate-300" />
          <div className="h-2 w-2 rounded-full bg-slate-300" />
          <div className="h-2 w-2 rounded-full bg-slate-300" />
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 relative z-10">
        {/* Mobile logo */}
        <Link href="/" className="mb-8 flex items-center gap-3 lg:hidden">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF6B00] to-[#E05300] shadow-[0_4px_12px_rgba(255,107,0,0.4)]">
            <ArrowDownToLine className="h-5 w-5 text-white" />
          </div>
          <span className="text-sm font-black text-slate-900">Universal <span className="text-[#FF6B00]">Downloader</span></span>
        </Link>

        <div className="w-full max-w-md glass-panel-elevated p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl">
          {children}
        </div>
      </div>
    </div>
  );
}
