import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowDownToLine } from 'lucide-react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 lg:flex-col lg:justify-between lg:bg-surface lg:p-12">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent">
            <ArrowDownToLine className="h-5 w-5 text-white" />
          </div>
          <span className="text-sm font-semibold text-accent">Universal Media Downloader</span>
        </Link>

        {/* Decorative quote */}
        <div>
          <blockquote className="mb-6 text-2xl font-medium leading-relaxed text-white">
            &ldquo;Download anything. <br className="hidden xl:block" />
            Keep everything.&rdquo;
          </blockquote>
          <div className="flex items-center gap-10 text-muted">
            <div>
              <p className="text-2xl font-bold text-white">240M+</p>
              <p className="mt-1 text-xs">Downloads served</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">99.9%</p>
              <p className="mt-1 text-xs">Uptime SLA</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">1,000+</p>
              <p className="mt-1 text-xs">Sites supported</p>
            </div>
          </div>
        </div>

        {/* Platform indicator dots */}
        <div className="flex gap-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full bg-accent/20"
              style={{ width: i === 0 ? 24 : 8 }}
            />
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        {/* Mobile logo */}
        <Link href="/" className="mb-8 flex items-center gap-3 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
            <ArrowDownToLine className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-accent">Universal Media Downloader</span>
        </Link>

        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
