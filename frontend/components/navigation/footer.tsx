import Link from 'next/link';

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-slate-200 bg-white/70 px-4 py-8">
      <div className="container mx-auto flex flex-col gap-4 text-xs text-slate-500 font-medium sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 Universal Media Downloader. Built for performance.</p>
        <div className="flex flex-wrap gap-4">
          <Link href="#" className="hover:text-slate-900 transition-colors">
            Privacy Policy
          </Link>
          <Link href="#" className="hover:text-slate-900 transition-colors">
            Terms of Service
          </Link>
          <Link href="#" className="hover:text-slate-900 transition-colors">
            Status
          </Link>
          <Link href="#" className="hover:text-slate-900 transition-colors">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
