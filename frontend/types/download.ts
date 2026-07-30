export type Platform =
  | 'YouTube'
  | 'youtube'
  | 'Vimeo'
  | 'TikTok'
  | 'Instagram'
  | 'Facebook'
  | 'Spotify'
  | 'DirectLink'
  | string; // allow arbitrary platform strings from backend

export interface MediaInfo {
  id: string;
  url: string;
  title: string;
  thumbnail: string | null;
  platform: Platform;
  duration: string;
  views: number;
  uploadedAt: string;
  channel: string;
  subscribers: string | null;
  description: string | null;
}

export interface QualityOption {
  id: string;
  label: string;
  resolution: string;
  codec: string;
  fps?: string;
  features: string[];
  container: string;
  estimatedSize: string;
  recommended?: boolean;
}

export interface AudioOption {
  id: string;
  label: string;
  format: string;
  bitrate: string;
  estimatedSize: string;
}

export type DownloadStatus =
  | 'queued'
  | 'fetching_metadata'
  | 'downloading'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface DownloadJob {
  id: string;
  url: string;
  mediaTitle: string;
  mediaFilename: string;
  mediaThumbnail: string | null;
  resolution: string;
  codec: string;
  container: string;
  totalSize: string | null;
  status: DownloadStatus;
  progress: number;
  speed: string | null;
  timeRemaining: string | null;
  downloaded: string | null;
  partsCompleted: number | null;
  partsTotal: number | null;
  streamStatus: 'Stable' | 'Unstable' | 'Slow' | null;
  startedAt: string;
  completedAt: string | null;
  fileSize: string | null;
}

export type HistoryStatus = 'COMPLETED' | 'DOWNLOADING' | 'FAILED' | 'CANCELLED';

export interface HistoryItem {
  id: string;
  filename: string;
  platform: string;
  platformColor: string;
  date: string;
  format: string;
  resolution: string;
  status: HistoryStatus;
  duration: string;
  size: string;
  progress?: number;
  speed?: string;
}

// Legacy types — kept for backward compat with existing services
export interface DownloadJobRequest {
  url: string;
  format?: string;
  quality?: string;
  audioOnly?: boolean;
}

export interface DownloadJobResponse {
  id: string;
  status: string;
  sourceUrl: string;
  fileName: string;
}

export interface DownloadHistoryItem {
  id: string;
  title: string;
  platform: string;
  date: string;
  format: string;
  resolution: string;
  status: string;
  duration: string;
  size: string;
}
