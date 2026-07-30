import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface px-4 py-8">
      <div className="container mx-auto flex flex-col gap-4 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 Universal Media Downloader. Built for performance.</p>
        <div className="flex flex-wrap gap-3">
          <Link href="#" className="hover:text-white">
            Privacy Policy
          </Link>
          <Link href="#" className="hover:text-white">
            Terms of Service
          </Link>
          <Link href="#" className="hover:text-white">
            Status
          </Link>
          <Link href="#" className="hover:text-white">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
