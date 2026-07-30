import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PreviewCard } from '@/components/preview/preview-card';

export default function PreviewPage() {
  return (
    <DashboardShell title="Media Preview" description="Preview and select the correct media before downloading.">
      <PreviewCard />
    </DashboardShell>
  );
}
