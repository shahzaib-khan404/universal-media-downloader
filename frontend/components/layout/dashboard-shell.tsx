import { type ReactNode } from 'react';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/navigation/footer';

interface DashboardShellProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function DashboardShell({ title, description, children }: DashboardShellProps) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto py-12">
        <section className="mb-10 rounded-3xl border border-border bg-surface p-8 shadow-card">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.36em] text-accent">Universal Media Downloader</p>
              <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">{title}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">{description}</p>
            </div>
          </div>
        </section>
        <div className="space-y-10">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
