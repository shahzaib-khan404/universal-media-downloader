'use client';

import { Sparkles, Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  title?: string;
  subtitle?: string;
}

export function LoadingScreen({
  title = 'Processing Media...',
  subtitle = 'Connecting with edge engine and preparing high-speed pipeline.',
}: LoadingScreenProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16">
      <div className="relative flex flex-col items-center text-center max-w-md w-full">
        {/* Glowing Ambient Halo */}
        <div 
          aria-hidden="true" 
          className="absolute -top-10 h-44 w-44 rounded-full bg-gradient-to-tr from-[#FF6B00]/25 to-[#FFA766]/30 blur-2xl animate-pulse" 
        />

        {/* Tactile 3D Animated Spinner Centerpiece */}
        <div className="relative mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-tr from-[#FF6B00] to-[#FFA766] p-1 shadow-[0_12px_30px_rgba(255,107,0,0.4)]">
          <div className="flex h-full w-full items-center justify-center rounded-[22px] bg-white/95 backdrop-blur-md shadow-inner">
            <Loader2 className="h-10 w-10 text-[#FF6B00] animate-spin" />
          </div>
          {/* Subtle floating badge */}
          <div className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 border-2 border-white shadow-md">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          </div>
        </div>

        {/* Dynamic Titles */}
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          {title}
        </h2>
        <p className="mt-3 text-sm font-medium leading-6 text-slate-600">
          {subtitle}
        </p>

        {/* Animated Activity Progress Bar */}
        <div className="mt-8 w-full max-w-xs overflow-hidden rounded-full bg-orange-100 p-0.5 border border-orange-200 shadow-inner">
          <div className="h-2 w-full rounded-full bg-gradient-to-r from-[#FF6B00] via-[#FFA766] to-[#FF6B00] animate-[shimmer_1.6s_infinite_linear] bg-[length:200%_100%]" />
        </div>

        {/* Engaging Real-Time Status Ticker */}
        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-orange-200/80 bg-white/80 px-4 py-1.5 shadow-xs backdrop-blur-sm">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-700 tracking-wide uppercase">
            Worker Active & Processing
          </span>
        </div>
      </div>
    </div>
  );
}
