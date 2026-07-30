import { RefreshCw, CloudUpload, FolderOpen, PlayCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

const cards = [
  {
    label: 'Active Downloads',
    value: '3 active',
    Icon: RefreshCw,
    iconColor: 'text-teal-400',
    iconBg: 'bg-teal-400/10',
    extra: (
      <div className="h-1 w-full overflow-hidden rounded-full bg-surface2">
        <div className="h-full w-[40%] rounded-full bg-teal-400" />
      </div>
    ),
  },
  {
    label: 'Storage Used',
    value: '1.2 GB',
    Icon: CloudUpload,
    iconColor: 'text-orange-400',
    iconBg: 'bg-orange-400/10',
    extra: (
      <div className="space-y-1.5">
        <p className="text-xs text-muted">of 10 GB</p>
        <div className="h-1 w-full overflow-hidden rounded-full bg-surface2">
          <div className="h-full w-[12%] rounded-full bg-orange-400" />
        </div>
      </div>
    ),
  },
  {
    label: 'Total Downloads',
    value: '154',
    Icon: FolderOpen,
    iconColor: 'text-muted',
    iconBg: 'bg-surface2',
    extra: (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-400/10 px-2.5 py-0.5 text-xs text-green-400">
        +12 this week
      </span>
    ),
  },
  {
    label: 'Favorite Platform',
    value: 'YouTube',
    Icon: PlayCircle,
    iconColor: 'text-red-400',
    iconBg: 'bg-red-400/10',
    extra: <p className="text-xs text-muted">45% of total media</p>,
  },
];

export function SummaryCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ label, value, Icon, iconColor, iconBg, extra }) => (
        <Card key={label} className="flex flex-col gap-4 p-5">
          <div className="flex items-start justify-between">
            <p className="text-sm text-muted">{label}</p>
            <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${iconBg}`}>
              <Icon className={`h-4 w-4 ${iconColor}`} />
            </div>
          </div>
          <p className="text-2xl font-semibold text-white">{value}</p>
          <div>{extra}</div>
        </Card>
      ))}
    </div>
  );
}
