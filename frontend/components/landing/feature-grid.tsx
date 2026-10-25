import { Zap, MonitorPlay, Music, ListVideo, Tag, Shield, Sparkles } from 'lucide-react';

const features = [
  {
    Icon: Zap,
    title: 'Turbocharged Multi-Threaded Engine',
    description:
      "Parallelized stream segment algorithms download at 100% of your maximum network bandwidth without drops.",
    glow: 'from-[#FF6B00] to-[#FFA766]',
  },
  {
    Icon: MonitorPlay,
    title: 'Cinematic 4K & 8K HDR Support',
    description:
      'Preserve every crisp detail. Extract at full native resolution with crisp 60fps frame rate and HDR10 color fidelity.',
    glow: 'from-[#FF8833] to-[#FF4500]',
  },
  {
    Icon: Music,
    title: 'Studio-Grade 320 kbps Audio',
    description:
      'Instant extraction to MP3 320k, M4A, or FLAC lossless with automatic volume normalization.',
    glow: 'from-[#FF5E00] to-[#FF9900]',
  },
  {
    Icon: ListVideo,
    title: 'One-Click Full Album / Playlist ZIP',
    description:
      "Archive complete YouTube playlists, SoundCloud albums, or courses bundled cleanly into a single organized ZIP archive.",
    glow: 'from-[#FF7A1A] to-[#FFB77D]',
  },
  {
    Icon: Tag,
    title: 'Smart Metadata & Cover Art Embedding',
    description:
      'Original artist names, track numbers, and HD poster artwork are written directly into media ID3 tags.',
    glow: 'from-[#FF6B00] to-[#FFAA66]',
  },
  {
    Icon: Shield,
    title: '100% Ad-Free & Sandboxed Security',
    description:
      'Zero ads, zero redirects, zero telemetry trackers. Completely private media conversion on secure servers.',
    glow: 'from-[#FF8833] to-[#FF5500]',
  },
];

export function FeatureGrid() {
  return (
    <section className="relative">
      {/* Background ambient blur */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[300px] bg-accent/10 blur-[120px] rounded-full -z-10" 
      />

      <div className="mb-12 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-3.5 py-1 text-xs font-bold text-accent mb-3">
          <Sparkles className="h-3.5 w-3.5" />
          Engineered for Peak Performance
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
          Everything You Need to Archive the Web
        </h2>
        <p className="mt-3 max-w-lg text-sm leading-6 text-slate-600 font-medium">
          Designed with fluid glass aesthetics and high-performance workers to make media saving effortless.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map(({ Icon, title, description, glow }) => (
          <div
            key={title}
            className="group relative flex flex-col justify-between rounded-3xl bg-gradient-to-b from-[#FFF5ED] via-[#FFEADB] to-[#FEDBC0] border border-[#FF6B00]/30 p-7 shadow-[0_10px_25px_-5px_rgba(255,107,0,0.18)] transition-all duration-300 hover:-translate-y-2 hover:border-[#FF6B00] hover:shadow-[0_20px_40px_-8px_rgba(255,107,0,0.32)]"
          >
            {/* Top decorative glass corner */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#FF6B00] to-[#FFA766] p-0.5 shadow-md shadow-orange-500/25">
                <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-white transition-colors group-hover:bg-[#FFF5ED]">
                  <Icon className="h-5 w-5 text-[#FF6B00]" />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-base font-extrabold text-slate-900 transition-colors group-hover:text-[#FF5E00]">
                {title}
              </h3>
              <p className="mt-2 text-xs leading-5 text-slate-700 font-medium">
                {description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
