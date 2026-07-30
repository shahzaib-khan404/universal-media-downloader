import { DashboardShell } from '@/components/layout/dashboard-shell';
import { HistoryTable } from '@/components/history/history-table';

export default function HistoryPage() {
  return (
    <DashboardShell title="History" description="Review past downloads, statuses, and metrics.">
      <HistoryTable />
    </DashboardShell>
  );
}
