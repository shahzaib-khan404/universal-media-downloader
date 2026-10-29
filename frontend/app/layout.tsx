import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: {
    template: '%s | Universal Media Downloader',
    default: 'Universal Media Downloader — High Speed Media Archiver',
  },
  description: 'Download and convert videos, music, and full playlists in 4K, 1080p, and 320kbps MP3 lossless without software installation.',
  openGraph: {
    title: 'Universal Media Downloader',
    description: 'Instant online media converter and archiver. Fast, free, and secure.',
    siteName: 'Universal Media Downloader',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Universal Media Downloader',
    description: 'Instant online media converter and archiver. Fast, free, and secure.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
