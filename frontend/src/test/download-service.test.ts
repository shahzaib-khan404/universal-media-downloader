import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the api module before importing the service
vi.mock('../../services/api', () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiDelete: vi.fn(),
}));

import * as api from '../../services/api';
import {
  createDownloadJob,
  getDownloadJob,
  fetchAllMediaData,
} from '../../services/download.service';

const mockApiPost = vi.mocked(api.apiPost);
const mockApiGet = vi.mocked(api.apiGet);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('createDownloadJob', () => {
  it('calls the real API and returns jobId', async () => {
    mockApiPost.mockResolvedValueOnce({ jobId: 'abc-123' });
    const result = await createDownloadJob('https://yt.com/watch?v=x', 'best');
    expect(result.jobId).toBe('abc-123');
    expect(mockApiPost).toHaveBeenCalledWith('/downloads', {
      url: 'https://yt.com/watch?v=x',
      qualityId: 'best',
      audioOnly: false,
    });
  });

  it('falls back to mock jobId when API fails', async () => {
    mockApiPost.mockRejectedValueOnce(new Error('network error'));
    const result = await createDownloadJob('https://yt.com/watch?v=x', 'best');
    expect(result.jobId).toMatch(/^mock-\d+$/);
  });
});

describe('getDownloadJob', () => {
  it('maps backend fields to frontend DownloadJob shape', async () => {
    mockApiGet.mockResolvedValueOnce({
      id: 'job-1',
      sourceUrl: 'https://yt.com',
      qualityId: '1080p',
      status: 'downloading',
      progress: 45,
      speed: '5 MiB/s',
      eta: '00:30',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:10Z',
      result: null,
    });
    const job = await getDownloadJob('job-1');
    expect(job.id).toBe('job-1');
    expect(job.status).toBe('downloading');
    expect(job.progress).toBe(45);
    expect(job.speed).toBe('5 MiB/s');
    expect(job.timeRemaining).toBe('00:30');
  });

  it('returns a fallback job on API failure', async () => {
    mockApiGet.mockRejectedValueOnce(new Error('timeout'));
    const job = await getDownloadJob('missing');
    expect(job.id).toBe('missing');
    expect(job.status).toBe('downloading');
    expect(job.progress).toBe(0);
  });
});

describe('fetchAllMediaData', () => {
  it('maps metadata response into media + quality + audio', async () => {
    mockApiPost.mockResolvedValueOnce({
      id: 'yt',
      title: 'Test Video',
      channel: 'Test Channel',
      platform: 'youtube',
      views: 1000,
      uploadedAt: '20240101',
      thumbnail: null,
      duration: 180,
      quality: [{ id: 'q1', label: '1080p', resolution: '1920x1080', codec: 'h264', features: [], container: 'mp4', estimatedSize: '200MB' }],
      audio: [{ id: 'a1', label: 'MP3', format: 'MP3', bitrate: '320kbps', estimatedSize: '5MB' }],
    });
    const { media, qualities, audioOptions } = await fetchAllMediaData('https://yt.com');
    expect(media.title).toBe('Test Video');
    expect(qualities).toHaveLength(1);
    expect(qualities[0].label).toBe('1080p');
    expect(audioOptions).toHaveLength(1);
    expect(audioOptions[0].format).toBe('MP3');
  });

  it('falls back to mock data when API is unavailable', async () => {
    mockApiPost.mockRejectedValueOnce(new Error('backend down'));
    const { media, qualities, audioOptions } = await fetchAllMediaData('https://yt.com');
    expect(media.title).toBeTruthy();
    expect(qualities.length).toBeGreaterThan(0);
    expect(audioOptions.length).toBeGreaterThan(0);
  });
});
