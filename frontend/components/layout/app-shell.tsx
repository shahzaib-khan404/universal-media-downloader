import { type ReactNode } from 'react';
import { Search, Plus } from 'lucide-react';
import { Sidebar } from '@/components/navigation/sidebar';
import { Button } from '@/components/ui/button';

interface AppShellProps {
  children: ReactNode;
  breadcrumb?: string;
  greeting?: string;
}

export function AppShell({
  children,
  breadcrumb = 'Dashboard',
  greeting = 'Good morning, Alex',
}: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between border-b border-border bg-surface/60 px-8 py-4">
          <div className="flex items-center gap-2 text-sm text-muted">
            <span>{breadcrumb}</span>
            <span>/</span>
            <span className="font-medium text-white">{greeting}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-2">
              <Search className="h-3.5 w-3.5 text-muted" />
              <input
                type="text"
                placeholder="Search downloads..."
                className="w-44 bg-transparent text-sm text-white placeholder:text-muted/60 focus:outline-none"
              />
            </div>
            <Button className="gap-2 text-sm">
              <Plus className="h-4 w-4" />
              New Download
            </Button>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="space-y-8">{children}</div>
        </main>

        {/* Status bar */}
        <footer className="flex items-center justify-between border-t border-border px-8 py-3 text-xs text-muted">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
            All systems operational
          </div>
          <span>v2.4.0 Stable</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white">
              Terms of Service
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
