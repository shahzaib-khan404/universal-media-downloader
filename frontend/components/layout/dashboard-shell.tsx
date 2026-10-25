import { type ReactNode } from 'react';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/navigation/footer';
import { Sparkles } from 'lucide-react';

interface DashboardShellProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function DashboardShell({ title, description, children }: DashboardShellProps) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto py-10 sm:py-14 space-y-10">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#FFF5ED] via-[#FFEADB] to-[#FEDBC0] border border-[#FF6B00]/30 p-8 sm:p-10 shadow-[0_15px_40px_-5px_rgba(255,107,0,0.18)]">
          {/* Ambient orange glow flare */}
          <div 
            aria-hidden="true" 
            className="pointer-events-none absolute -top-12 -right-12 w-80 h-80 bg-accent/20 blur-[80px] rounded-full" 
          />
          
          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/15 px-3 py-1 text-xs font-bold text-[#FF5E00] mb-3 shadow-sm">
                <Sparkles className="h-3 w-3" />
                Personal Archive
              </div>
              <h1 className="text-3xl font-black text-slate-900 sm:text-4xl tracking-tight">{title}</h1>
              <p className="mt-2.5 max-w-2xl text-xs sm:text-sm leading-6 text-slate-700 font-medium">{description}</p>
            </div>
          </div>
        </section>
        <div className="space-y-10">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
