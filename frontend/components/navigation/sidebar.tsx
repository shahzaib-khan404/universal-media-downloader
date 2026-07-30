'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Download,
  History,
  Star,
  HardDrive,
  Key,
  CreditCard,
  Settings,
  BarChart2,
  ArrowDownToLine,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const mainNav = [
  { label: 'Downloads', href: '/dashboard', Icon: Download },
  { label: 'History', href: '/history', Icon: History },
  { label: 'Favorites', href: '/favorites', Icon: Star },
  { label: 'Storage', href: '/storage', Icon: HardDrive },
];

const systemNav = [
  { label: 'API Keys', href: '/api-keys', Icon: Key },
  { label: 'Subscription', href: '/subscription', Icon: CreditCard },
  { label: 'Settings', href: '/settings', Icon: Settings },
  { label: 'Analytics', href: '/analytics', Icon: BarChart2 },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href);

  return (
    <aside className="flex h-screen w-44 shrink-0 flex-col border-r border-border bg-surface">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
          <ArrowDownToLine className="h-4 w-4 text-white" />
        </div>
        <span className="text-sm font-bold text-white">UMD</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted/50">
          Main
        </p>
        <ul className="space-y-0.5">
          {mainNav.map(({ label, href, Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-colors',
                  isActive(href)
                    ? 'bg-accent/10 font-medium text-accent'
                    : 'text-muted hover:bg-surface2 hover:text-white'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <p className="mb-2 mt-8 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted/50">
          System
        </p>
        <ul className="space-y-0.5">
          {systemNav.map(({ label, href, Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-colors',
                  isActive(href)
                    ? 'bg-accent/10 font-medium text-accent'
                    : 'text-muted hover:bg-surface2 hover:text-white'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* User */}
      <div className="border-t border-border px-4 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/20 text-sm font-semibold text-accent">
            A
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-white">Alex Rivera</p>
            <p className="text-[10px] text-muted">Pro Plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
