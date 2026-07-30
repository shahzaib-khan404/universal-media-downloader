import { Zap, MonitorPlay, Music, ListVideo, Tag, Shield } from 'lucide-react';
import { Card } from '@/components/ui/card';

const features = [
  {
    Icon: Zap,
    title: 'Fast Downloads',
    description:
      "Parallelized chunking algorithms ensure you're using 100% of your bandwidth capacity.",
  },
  {
    Icon: MonitorPlay,
    title: '4K & 8K Support',
    description:
      'Preserve every pixel. Download in original resolution, from 720p up to cinematic 8K UHD.',
  },
  {
    Icon: Music,
    title: 'Audio Extraction',
    description:
      'Seamlessly convert video to high-fidelity MP3, FLAC, or M4A with intelligent bit-rate selection.',
  },
  {
    Icon: ListVideo,
    title: 'Playlist Downloads',
    description:
      "Don't do it manually. Fetch entire YouTube playlists or Spotify albums in a single click.",
  },
  {
    Icon: Tag,
    title: 'Metadata Support',
    description:
      'Automatic tagging. Thumbnails, artist info, and timestamps are embedded into every file.',
  },
  {
    Icon: Shield,
    title: 'No Ads',
    description:
      'Clean, minimalist experience. No popups, no trackers, no malware. Pure utility.',
  },
];

export function FeatureGrid() {
  return (
    <section>
      <div className="mb-10">
        <h2 className="text-3xl font-semibold text-white">Engineered for Performance</h2>
        <p className="mt-3 max-w-md text-sm leading-7 text-muted">
          Every feature is designed to eliminate friction between finding media and owning it.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map(({ Icon, title, description }) => (
          <Card key={title} className="flex flex-col gap-5 p-7 transition-colors hover:border-accent/40">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-surface2">
              <Icon className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h3 className="font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
