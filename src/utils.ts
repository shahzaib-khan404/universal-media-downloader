import chalk from 'chalk';
import * as path from 'path';
import * as fs from 'fs';
import { VideoQuality, DownloadFormat } from './types';

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
}

export function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

export function resolveOutputDir(dir: string): string {
  const resolved = path.resolve(dir);
  ensureDir(resolved);
  return resolved;
}

export function buildFormatSelector(
  quality: VideoQuality,
  format: DownloadFormat,
  audioOnly: boolean
): string {
  if (audioOnly) {
    const audioFormat = ['mp3', 'aac', 'flac', 'wav', 'opus'].includes(format)
      ? format
      : 'mp3';
    return `bestaudio[ext=${audioFormat}]/bestaudio/best`;
  }

  if (format === 'best') {
    if (quality === 'best') return 'bestvideo+bestaudio/best';
    const height = parseInt(quality);
    return `bestvideo[height<=${height}]+bestaudio/best[height<=${height}]/best`;
  }

  const height = quality === 'best' ? '' : `[height<=${parseInt(quality)}]`;
  return `bestvideo[ext=${format}]${height}+bestaudio/best[ext=${format}]${height}/bestvideo${height}+bestaudio/best`;
}

export const log = {
  info: (msg: string) => console.log(chalk.cyan('ℹ'), msg),
  success: (msg: string) => console.log(chalk.green('✓'), msg),
  warn: (msg: string) => console.log(chalk.yellow('⚠'), msg),
  error: (msg: string) => console.log(chalk.red('✗'), msg),
  dim: (msg: string) => console.log(chalk.dim(msg)),
  title: (msg: string) => console.log(chalk.bold.white(msg)),
  highlight: (msg: string) => chalk.cyan(msg),
  url: (msg: string) => chalk.underline.blue(msg),
};
