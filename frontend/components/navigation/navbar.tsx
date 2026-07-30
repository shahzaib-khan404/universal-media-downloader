'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Moon, Sun, ArrowDownToLine } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Features', href: '/' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'History', href: '/history' },
  { label: 'Blog', href: '/' },
  { label: 'About', href: '/' },
];

export function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur-xl">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-accent">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-accent">
            <ArrowDownToLine className="h-3.5 w-3.5 text-white" />
          </span>
          Universal Media Downloader
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => {
            const isActive =
              item.href !== '/'
                ? pathname.startsWith(item.href)
                : pathname === '/';
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  'relative text-sm transition-colors after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-full after:rounded-full after:bg-accent after:transition-opacity',
                  isActive
                    ? 'font-medium text-white after:opacity-100'
                    : 'text-muted hover:text-white after:opacity-0'
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-xl p-2 text-muted transition-colors hover:bg-surface2 hover:text-white"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
          <Link
            href="/login"
            className="hidden text-sm text-muted transition-colors hover:text-white md:block"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="hidden rounded-full border border-accent px-4 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/10 md:inline-flex"
          >
            Try Free
          </Link>
        </div>
      </div>
    </header>
  );
}
