import Link from 'next/link';
import { ArrowRight, Flame, ShieldCheck, Zap } from 'lucide-react';

export function CallToAction() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#FFF5ED] via-[#FFEADB] to-[#FEDBC0] p-8 sm:p-12 md:p-16 border border-[#FF6B00]/30 shadow-[0_15px_40px_-5px_rgba(255,107,0,0.22)]">
      {/* Background orange radiant flare */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute -right-20 -bottom-20 w-96 h-96 bg-gradient-to-tl from-[#FF6B00]/40 via-[#FFA766]/20 to-transparent blur-[90px] rounded-full" 
      />
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute -left-20 -top-20 w-80 h-80 bg-accent/20 blur-[100px] rounded-full" 
      />

      <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/15 px-3.5 py-1 text-xs font-bold text-[#FF5E00] mb-4 shadow-sm">
            <Flame className="h-4 w-4 fill-accent" />
            Join 2.4M+ Power Archivers
          </div>
          <h2 className="text-3xl font-black text-slate-900 sm:text-4xl lg:text-5xl tracking-tight leading-tight">
            Ready to download media at <span className="text-[#FF5E00]">maximum speed</span>?
          </h2>
          <p className="mt-4 text-sm text-slate-700 font-medium leading-relaxed">
            No software installation required. Paste any link to instantly convert and download high-resolution videos, lossless audio, and complete albums.
          </p>

          <div className="mt-8 flex flex-wrap gap-8 sm:gap-12 pt-6 border-t border-[#FF6B00]/20">
            <div>
              <p className="text-3xl font-black text-slate-900">240M+</p>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#FF5E00] mt-1">
                Files Processed
              </p>
            </div>
            <div>
              <p className="text-3xl font-black text-slate-900">99.9%</p>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#FF5E00] mt-1">
                Conversion Success
              </p>
            </div>
            <div>
              <p className="text-3xl font-black text-slate-900">4K & 8K</p>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#FF5E00] mt-1">
                Highest Fidelity
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
          <Link
            href="/download"
            className="btn-3d-orange inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-4 text-sm font-extrabold text-white uppercase tracking-wider text-center"
          >
            <span>Start Downloading</span>
            <ArrowRight className="h-4 w-4 stroke-[2.5]" />
          </Link>

          <div className="flex items-center justify-center gap-2 text-xs text-slate-700 font-semibold pt-1">
            <ShieldCheck className="h-4 w-4 text-[#FF5E00]" />
            <span>100% Free • No Sign-Up Needed</span>
          </div>
        </div>
      </div>
    </section>
  );
}
