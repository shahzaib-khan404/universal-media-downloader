import Link from 'next/link';
import { ArrowLeft, SearchX } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-6">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-border bg-surface">
        <SearchX className="h-10 w-10 text-muted" />
      </div>

      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">404</p>
        <h1 className="mt-3 text-4xl font-bold text-white">Page not found</h1>
        <p className="mt-3 max-w-sm text-sm leading-6 text-muted">
          The page you&apos;re looking for doesn&apos;t exist or has been moved. Try going back to
          the homepage.
        </p>
      </div>

      <div className="flex gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/90"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-xl border border-border bg-surface px-5 py-2.5 text-sm font-medium text-white transition-colors hover:border-accent/40"
        >
          Dashboard
        </Link>
      </div>
    </div>
  );
}
