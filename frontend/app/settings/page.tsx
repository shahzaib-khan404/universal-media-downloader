import { DashboardShell } from '@/components/layout/dashboard-shell';
import { SettingsPanel } from '@/components/settings/settings-panel';

export default function SettingsPage() {
  return (
    <DashboardShell title="Settings" description="Manage your downloader preferences and account configurations.">
      <SettingsPanel />
    </DashboardShell>
  );
}
