import inquirer from 'inquirer';
import { DownloadOptions, DownloadFormat, VideoQuality } from './types';
import * as os from 'os';
import * as path from 'path';

interface Answers {
  url?: string;
  audioOnly: boolean;
  format: string;
  quality?: string;
  subtitles?: boolean;
  playlist: boolean;
  outputDir: string;
  filename: string;
  rateLimit: string;
}

export async function promptDownload(initialUrl?: string): Promise<DownloadOptions> {
  const defaultDownloads = path.join(os.homedir(), 'Downloads', 'media-downloads');

  const answers = await inquirer.prompt<Answers>([
    {
      type: 'input',
      name: 'url',
      message: 'Enter media URL:',
      default: initialUrl,
      validate: (input: string) => {
        if (!input.trim()) return 'URL is required';
        try {
          new URL(input.trim());
          return true;
        } catch {
          return 'Please enter a valid URL';
        }
      },
      when: !initialUrl,
    },
    {
      type: 'confirm',
      name: 'audioOnly',
      message: 'Audio only?',
      default: false,
    },
    {
      type: 'list',
      name: 'format',
      message: 'Output format:',
      choices: (prev: Answers) =>
        prev.audioOnly
          ? ['mp3', 'aac', 'flac', 'wav', 'opus']
          : ['mp4', 'mkv', 'webm', 'best'],
      default: (prev: Answers) => (prev.audioOnly ? 'mp3' : 'mp4'),
    },
    {
      type: 'list',
      name: 'quality',
      message: 'Video quality:',
      choices: ['best', '2160p', '1440p', '1080p', '720p', '480p', '360p', '240p', 'worst'],
      default: '1080p',
      when: (prev: Answers) => !prev.audioOnly,
    },
    {
      type: 'confirm',
      name: 'subtitles',
      message: 'Download subtitles (English)?',
      default: false,
      when: (prev: Answers) => !prev.audioOnly,
    },
    {
      type: 'confirm',
      name: 'playlist',
      message: 'Download full playlist (if URL is a playlist)?',
      default: false,
    },
    {
      type: 'input',
      name: 'outputDir',
      message: 'Output directory:',
      default: defaultDownloads,
    },
    {
      type: 'input',
      name: 'filename',
      message: 'Custom filename (leave empty for auto):',
      default: '',
    },
    {
      type: 'input',
      name: 'rateLimit',
      message: 'Rate limit (e.g. 1M, 500K — leave empty for unlimited):',
      default: '',
    },
  ]);

  return {
    url: (initialUrl || answers.url || '').trim(),
    outputDir: answers.outputDir,
    format: answers.format as DownloadFormat,
    quality: (answers.quality || 'best') as VideoQuality,
    audioOnly: answers.audioOnly,
    subtitles: answers.subtitles || false,
    playlist: answers.playlist,
    filename: answers.filename || undefined,
    rateLimit: answers.rateLimit || undefined,
  };
}
