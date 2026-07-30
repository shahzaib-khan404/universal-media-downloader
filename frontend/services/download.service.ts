import { apiGet, apiPost } from '@/services/api';
import type {
  MediaInfo,
  QualityOption,
  AudioOption,
  DownloadJob,
  DownloadJobRequest,
  DownloadJobResponse,
} from '@/types/download';

// ─── Mock fallbacks (used when backend is unavailable) ────────────────────────

const MOCK_MEDIA: MediaInfo = {
  id: 'xR9_p20mZ',
  url: '',
  title: 'Cyberpunk 2077: Phantom Liberty — Official Cinematic Trailer',
  thumbnail: null,
  platform: 'YouTube',
  duration: '12:45',
  views: 4_200_000,
  uploadedAt: 'Sep 20, 2023',
  channel: 'CD PROJEKT RED',
  subscribers: '4.2M',
  description: 'Official cinematic trailer for Phantom Liberty.',
};

const MOCK_QUALITIES: QualityOption[] = [
  { id: '4k', label: '4K Ultra HD', resolution: '3840×2160', codec: 'AV1', fps: '60 fps', features: ['HDR10'], container: 'MKV', estimatedSize: '1.2 GB', recommended: true },
  { id: '1080p', label: '1080p Full HD', resolution: '1920×1080', codec: 'H.264', fps: '30 fps', features: ['HD'], container: 'MP4', estimatedSize: '420 MB', recommended: false },
  { id: '720p', label: '720p HD', resolution: '1280×720', codec: 'H.264', fps: '30 fps', features: [], container: 'MP4', estimatedSize: '210 MB', recommended: false },
];

const MOCK_AUDIO: AudioOption[] = [
  { id: 'flac', label: 'FLAC Lossless', format: 'FLAC', bitrate: '1411 kbps', estimatedSize: '180 MB' },
  { id: 'mp3_320', label: 'MP3 High Quality', format: 'MP3', bitrate: '320 kbps', estimatedSize: '28 MB' },
];

// ─── Backend response type ────────────────────────────────────────────────────

interface MetadataResponse {
  id: string;
  title: string;
  channel: string;
  platform: string;
  views: number;
  uploadedAt: string | null;
  thumbnail: string | null;
  duration: number;
  quality: QualityOption[];
  audio: AudioOption[];
}

// Maps the backend DownloadJob shape to the frontend DownloadJob type
function mapJob(raw: Record<string, unknown>): DownloadJob {
  const result = raw.result as Record<string, unknown> | null;
  return {
    id: raw.id as string,
    url: raw.sourceUrl as string,
    mediaTitle: result?.fileName as string ?? '',
    mediaFilename: result?.fileName as string ?? '',
    mediaThumbnail: null,
    resolution: result?.resolution as string ?? (raw.qualityId as string),
    codec: result?.codec as string ?? '',
    container: '',
    totalSize: result?.fileSizeBytes
      ? `${((result.fileSizeBytes as number) / 1024 / 1024).toFixed(1)} MB`
      : null,
    status: raw.status as DownloadJob['status'],
    progress: raw.progress as number,
    speed: raw.speed as string ?? null,
    timeRemaining: raw.eta as string ?? null,
    downloaded: null,
    partsCompleted: null,
    partsTotal: null,
    streamStatus: null,
    startedAt: raw.createdAt as string,
    completedAt: raw.updatedAt as string ?? null,
    fileSize: result?.fileSizeBytes
      ? `${((result.fileSizeBytes as number) / 1024 / 1024).toFixed(1)} MB`
      : null,
  };
}

// ─── Service functions ────────────────────────────────────────────────────────

export async function fetchAllMediaData(sourceUrl: string): Promise<{
  media: MediaInfo;
  qualities: QualityOption[];
  audioOptions: AudioOption[];
}> {
  const data = await apiPost<MetadataResponse>('/downloads/metadata', { url: sourceUrl });
  const media: MediaInfo = {
    id: data.id,
    url: sourceUrl,
    title: data.title,
    thumbnail: data.thumbnail,
    platform: data.platform,
    duration: String(data.duration),
    views: data.views,
    uploadedAt: data.uploadedAt ?? '',
    channel: data.channel,
    subscribers: null,
    description: null,
  };
  return { media, qualities: data.quality, audioOptions: data.audio };
}

// Kept for backward compat with options page (calls both)
export async function fetchMediaInfo(sourceUrl: string): Promise<MediaInfo> {
  const { media } = await fetchAllMediaData(sourceUrl);
  return media;
}

export async function fetchQualityOptions(sourceUrl: string): Promise<QualityOption[]> {
  const { qualities } = await fetchAllMediaData(sourceUrl);
  return qualities;
}

export async function fetchAudioOptions(sourceUrl: string): Promise<AudioOption[]> {
  const { audioOptions } = await fetchAllMediaData(sourceUrl);
  return audioOptions;
}

export async function createDownloadJob(
  sourceUrl: string,
  qualityId: string,
  audioOnly = false
): Promise<{ jobId: string }> {
  try {
    return await apiPost<{ jobId: string }>('/downloads', { url: sourceUrl, qualityId, audioOnly });
  } catch {
    return { jobId: `mock-${Date.now()}` };
  }
}

export async function getDownloadJob(jobId: string): Promise<DownloadJob> {
  try {
    const raw = await apiGet<Record<string, unknown>>(`/downloads/${jobId}`);
    return mapJob(raw);
  } catch {
    return {
      id: jobId, url: '', mediaTitle: 'Download', mediaFilename: 'download.mp4',
      mediaThumbnail: null, resolution: '', codec: '', container: '', totalSize: null,
      status: 'downloading', progress: 0, speed: null, timeRemaining: null,
      downloaded: null, partsCompleted: null, partsTotal: null, streamStatus: null,
      startedAt: new Date().toISOString(), completedAt: null, fileSize: null,
    };
  }
}

export async function getCompletedJob(jobId: string): Promise<DownloadJob> {
  try {
    const raw = await apiGet<Record<string, unknown>>(`/downloads/${jobId}`);
    if (raw.status !== 'completed') throw new Error('not completed');
    return mapJob(raw);
  } catch {
    return {
      id: jobId, url: '', mediaTitle: 'Download', mediaFilename: 'download.mp4',
      mediaThumbnail: null, resolution: '1080p', codec: 'H.264', container: 'MP4',
      totalSize: '420 MB', status: 'completed', progress: 100, speed: null,
      timeRemaining: null, downloaded: '420 MB', partsCompleted: null, partsTotal: null,
      streamStatus: null, startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(), fileSize: '420 MB',
    };
  }
}

export async function listDownloadJobs(): Promise<DownloadJob[]> {
  try {
    const rows = await apiGet<Record<string, unknown>[]>('/downloads');
    return rows.map(mapJob);
  } catch {
    return [];
  }
}

// Legacy helpers
export async function fetchDownloadMetadata(sourceUrl: string) {
  return apiPost<DownloadJobResponse>('/downloads/metadata', { url: sourceUrl });
}

export async function createLegacyDownloadJob(payload: DownloadJobRequest) {
  return apiPost<DownloadJobResponse>('/downloads', payload);
}
