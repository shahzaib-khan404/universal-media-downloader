'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowDownToLine, Menu, X, Sparkles, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Video', href: '/' },
  { label: 'Audio MP3', href: '/audio' },
  { label: 'Albums & Playlists', href: '/album' },
  { label: 'History', href: '/history' },
];

export function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <header className="sticky top-4 z-50 px-4 transition-all">
      <div
        className={cn(
          'container mx-auto flex items-center justify-between rounded-full border px-5 py-3 transition-all duration-300',
          scrolled
            ? 'glass-panel-elevated shadow-lg border-orange-500/20'
            : 'glass-panel border-slate-200/80'
        )}
      >
        {/* Brand Logo */}
        <Link href="/" className="group flex items-center gap-2.5 text-sm font-bold text-slate-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-[#FF5E00] to-[#FFA766] shadow-orangeGlow transition-transform duration-300 group-hover:scale-110">
            <Flame className="h-4 w-4 text-white fill-white" />
          </span>
          <div className="flex flex-col">
            <span className="leading-tight tracking-tight text-slate-900 flex items-center gap-1.5 font-extrabold text-base">
              Universal <span className="text-accent">Media</span>
            </span>
          </div>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden items-center gap-1.5 lg:flex bg-slate-100/80 p-1.5 rounded-full border border-slate-200 backdrop-blur-xl shadow-inner">
          {navItems.map((item) => {
            const isActive = item.href !== '/' ? pathname.startsWith(item.href) : pathname === '/';
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  'rounded-full px-4 py-1.5 text-xs font-bold transition-all duration-200 tracking-wide',
                  isActive
                    ? 'bg-gradient-to-r from-[#FF6B00] to-[#FF8833] text-white shadow-[0_2px_12px_rgba(255,107,0,0.4)] font-extrabold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/download"
            className="hidden sm:inline-flex btn-3d-orange items-center gap-1.5 rounded-full px-5 py-2 text-xs font-bold text-white uppercase tracking-wider"
          >
            <Sparkles className="h-3.5 w-3.5 fill-white" />
            Quick Start
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-full border border-slate-200 bg-white/80 p-2 text-slate-700 transition-colors hover:text-slate-900 lg:hidden shadow-sm"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu drawer */}
      {menuOpen && (
        <div className="container mx-auto mt-2 rounded-3xl glass-panel-elevated p-5 lg:hidden border border-slate-200 shadow-xl">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = item.href !== '/' ? pathname.startsWith(item.href) : pathname === '/';
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    'rounded-2xl px-4 py-3 text-sm font-bold transition-all',
                    isActive
                      ? 'bg-[#FF6B00]/15 text-[#FF6B00] font-extrabold border border-[#FF6B00]/30 shadow-sm'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/80'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="mt-4 pt-3 border-t border-slate-200">
              <Link
                href="/download"
                className="w-full block btn-3d-orange rounded-2xl py-3 text-center text-xs font-bold text-white uppercase tracking-wider"
              >
                Quick Start
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
