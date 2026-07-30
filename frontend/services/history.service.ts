import { apiGet } from '@/services/api';
import type { DownloadHistoryItem } from '@/types/download';

export async function fetchDownloadHistory() {
  return apiGet<DownloadHistoryItem[]>('/history');
}
