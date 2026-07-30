import { AppShell } from '@/components/layout/app-shell';
import { SummaryCards } from '@/components/dashboard/summary-cards';
import { RecentDownloads } from '@/components/dashboard/recent-downloads';

export default function DashboardPage() {
  return (
    <AppShell breadcrumb="Dashboard" greeting="Good morning, Alex">
      <SummaryCards />

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        {/* Downloads over Time chart placeholder */}
        <section className="rounded-3xl border border-border bg-surface p-6 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Downloads over Time</h2>
            <span className="text-xs text-muted">Last 30 days</span>
          </div>
          <div className="mt-6 h-72 rounded-2xl bg-surface2" />
        </section>

        {/* Media Formats chart placeholder */}
        <section className="rounded-3xl border border-border bg-surface p-6 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Media Formats</h2>
          </div>
          <div className="space-y-4">
            {[
              { label: 'MP4 Video', pct: 64, color: 'bg-accent' },
              { label: 'MP3 Audio', pct: 22, color: 'bg-amber-400' },
              { label: 'MOV Original', pct: 10, color: 'bg-teal-400' },
              { label: 'Others', pct: 4, color: 'bg-muted/40' },
            ].map(({ label, pct, color }) => (
              <div key={label}>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="text-muted">{label}</span>
                  <span className="text-white">{pct}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface2">
                  <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
          <button className="mt-6 text-xs text-accent hover:underline">View details</button>
        </section>
      </div>

      <RecentDownloads />
    </AppShell>
  );
}
