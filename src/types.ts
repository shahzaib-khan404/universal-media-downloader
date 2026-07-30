export interface DownloadOptions {
  url: string;
  outputDir: string;
  format: DownloadFormat;
  quality: VideoQuality;
  audioOnly: boolean;
  subtitles: boolean;
  playlist: boolean;
  filename?: string;
  rateLimit?: string;
  proxy?: string;
  cookies?: string;
}

export type DownloadFormat = 'mp4' | 'mkv' | 'webm' | 'mp3' | 'aac' | 'flac' | 'wav' | 'opus' | 'best';
export type VideoQuality = '2160p' | '1440p' | '1080p' | '720p' | '480p' | '360p' | '240p' | 'best' | 'worst';

export interface MediaInfo {
  id: string;
  title: string;
  uploader: string;
  duration: number;
  thumbnail: string;
  description: string;
  formats: FormatInfo[];
  url: string;
  extractor: string;
  playlist?: string;
  playlist_index?: number;
}

export interface FormatInfo {
  format_id: string;
  ext: string;
  resolution?: string;
  fps?: number;
  filesize?: number;
  vcodec?: string;
  acodec?: string;
  abr?: number;
  vbr?: number;
  format_note?: string;
}

export interface DownloadProgress {
  status: 'downloading' | 'finished' | 'error' | 'processing';
  percent: number;
  speed?: string;
  eta?: string;
  totalSize?: string;
  downloadedSize?: string;
  filename?: string;
}

export interface DownloadResult {
  success: boolean;
  outputPath?: string;
  error?: string;
  info?: MediaInfo;
}
