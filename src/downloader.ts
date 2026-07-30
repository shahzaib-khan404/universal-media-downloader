import { spawn } from 'child_process';
import * as cliProgress from 'cli-progress';
import chalk from 'chalk';
import * as path from 'path';
import which from 'which';
import { DownloadOptions, DownloadResult, MediaInfo, DownloadProgress } from './types';
import { buildFormatSelector, formatDuration, formatFileSize, log } from './utils';

function findYtDlp(): string {
  const candidates = ['yt-dlp', 'yt-dlp_x86', './yt-dlp'];
  for (const name of candidates) {
    try {
      return which.sync(name);
    } catch {
      continue;
    }
  }
  return 'yt-dlp';
}

function runYtDlp(binary: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn(binary, args);
    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data: Buffer) => { stdout += data.toString(); });
    proc.stderr.on('data', (data: Buffer) => { stderr += data.toString(); });

    proc.on('close', (code) => {
      if (code === 0) resolve(stdout);
      else reject(new Error(stderr || `yt-dlp exited with code ${code}`));
    });

    proc.on('error', reject);
  });
}

export class Downloader {
  private binary: string;

  constructor() {
    this.binary = findYtDlp();
  }

  async getInfo(url: string): Promise<MediaInfo> {
    const output = await runYtDlp(this.binary, [
      '--dump-json',
      '--no-playlist',
      '--no-warnings',
      url,
    ]);
    return JSON.parse(output.trim()) as MediaInfo;
  }

  async download(options: DownloadOptions): Promise<DownloadResult> {
    const {
      url,
      outputDir,
      format,
      quality,
      audioOnly,
      subtitles,
      playlist,
      filename,
      rateLimit,
      proxy,
      cookies,
    } = options;

    const formatSelector = buildFormatSelector(quality, format, audioOnly);
    const outputTemplate = filename
      ? path.join(outputDir, `${filename}.%(ext)s`)
      : path.join(outputDir, '%(uploader)s - %(title)s.%(ext)s');

    const args: string[] = [
      url,
      '-f', formatSelector,
      '-o', outputTemplate,
      '--no-warnings',
      '--newline',
      '--progress',
    ];

    if (audioOnly) {
      args.push('-x');
      if (['mp3', 'aac', 'flac', 'wav', 'opus'].includes(format)) {
        args.push('--audio-format', format);
      }
    } else if (['mp4', 'mkv', 'webm'].includes(format)) {
      args.push('--merge-output-format', format);
    }

    if (subtitles) {
      args.push('--write-subs', '--write-auto-subs', '--sub-langs', 'en,en-US');
    }

    if (!playlist) {
      args.push('--no-playlist');
    }

    if (rateLimit) {
      args.push('-r', rateLimit);
    }

    if (proxy) {
      args.push('--proxy', proxy);
    }

    if (cookies) {
      args.push('--cookies', cookies);
    }

    const progressBar = new cliProgress.SingleBar({
      format: `  ${chalk.cyan('{bar}')} {percentage}% | {speed} | ETA: {eta_formatted} | {downloaded}/{total}`,
      barCompleteChar: '█',
      barIncompleteChar: '░',
      hideCursor: true,
    }, cliProgress.Presets.shades_classic);

    let started = false;
    let outputPath: string | undefined;

    return new Promise((resolve) => {
      const proc = spawn(this.binary, args);

      const handleLine = (line: string) => {
        if (line.startsWith('[download]')) {
          const dest = line.match(/\[download\] Destination: (.+)/);
          if (dest) {
            outputPath = dest[1].trim();
            return;
          }

          const progress = this.parseProgress(line);
          if (progress) {
            if (!started) {
              progressBar.start(100, 0, {
                speed: progress.speed || 'N/A',
                downloaded: progress.downloadedSize || '0 B',
                total: progress.totalSize || 'Unknown',
              });
              started = true;
            }
            progressBar.update(progress.percent, {
              speed: progress.speed || 'N/A',
              downloaded: progress.downloadedSize || '0 B',
              total: progress.totalSize || 'Unknown',
            });
          }
        } else if (line.startsWith('[Merger]') || line.startsWith('[ffmpeg]')) {
          if (started) {
            progressBar.update(95, { speed: 'Processing...', downloaded: '', total: '' });
          }
        }
      };

      let buffer = '';
      proc.stdout.on('data', (data: Buffer) => {
        buffer += data.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        lines.forEach(handleLine);
      });

      proc.stderr.on('data', (data: Buffer) => {
        const text = data.toString();
        if (text.includes('ERROR')) {
          if (started) progressBar.stop();
          resolve({ success: false, error: text.trim() });
        }
      });

      proc.on('close', (code) => {
        if (buffer) handleLine(buffer);
        if (started) {
          progressBar.update(100, { speed: 'Done', downloaded: '', total: '' });
          progressBar.stop();
        }

        if (code === 0) {
          resolve({ success: true, outputPath });
        } else {
          resolve({ success: false, error: `yt-dlp exited with code ${code}` });
        }
      });

      proc.on('error', (err) => {
        if (started) progressBar.stop();
        const msg = (err as NodeJS.ErrnoException).code === 'ENOENT'
          ? 'yt-dlp not found. Run: node dist/index.js install  OR  brew install yt-dlp'
          : err.message;
        resolve({ success: false, error: msg });
      });
    });
  }

  private parseProgress(line: string): DownloadProgress | null {
    const percentMatch = line.match(/(\d+\.?\d*)%/);
    const speedMatch = line.match(/at\s+([\d.]+\s*\w+\/s)/);
    const etaMatch = line.match(/ETA\s+([\d:]+)/);
    const sizeMatch = line.match(/([\d.]+\s*\w+)\s+of\s+~?([\d.]+\s*\w+)/);

    if (!percentMatch) return null;

    return {
      status: 'downloading',
      percent: Math.min(parseFloat(percentMatch[1]), 99.9),
      speed: speedMatch?.[1],
      eta: etaMatch?.[1],
      downloadedSize: sizeMatch?.[1],
      totalSize: sizeMatch?.[2],
    };
  }

  static async checkInstallation(): Promise<boolean> {
    try {
      const binary = findYtDlp();
      await runYtDlp(binary, ['--version']);
      return true;
    } catch {
      return false;
    }
  }

  static async install(): Promise<void> {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    const platform = process.platform;

    try {
      if (platform === 'darwin') {
        log.info('Trying: brew install yt-dlp...');
        await execAsync('brew install yt-dlp');
      } else if (platform === 'linux') {
        log.info('Trying: pip install yt-dlp...');
        await execAsync('pip install yt-dlp');
      } else if (platform === 'win32') {
        log.info('Trying: winget install yt-dlp...');
        await execAsync('winget install yt-dlp');
      }
      log.success('yt-dlp installed successfully.');
    } catch {
      log.error('Auto-install failed. Please install manually:');
      log.info('  macOS:   brew install yt-dlp');
      log.info('  pip:     pip install yt-dlp');
      log.info('  Windows: winget install yt-dlp');
      log.info('  More:    https://github.com/yt-dlp/yt-dlp#installation');
      throw new Error('Manual installation required');
    }
  }
}

export async function printMediaInfo(info: MediaInfo): Promise<void> {
  console.log();
  log.title('Media Information');
  console.log(chalk.dim('─'.repeat(50)));
  console.log(`  ${chalk.bold('Title:')}     ${chalk.white(info.title)}`);
  console.log(`  ${chalk.bold('Uploader:')} ${chalk.white(info.uploader || 'Unknown')}`);
  if (info.duration) {
    console.log(`  ${chalk.bold('Duration:')} ${chalk.white(formatDuration(info.duration))}`);
  }
  console.log(`  ${chalk.bold('Source:')}   ${chalk.white(info.extractor || 'Unknown')}`);
  if (info.playlist) {
    console.log(`  ${chalk.bold('Playlist:')} ${chalk.white(info.playlist)}`);
  }

  if (info.formats && info.formats.length > 0) {
    console.log();
    console.log(chalk.bold('  Available Formats:'));
    const videoFormats = info.formats
      .filter(f => f.vcodec && f.vcodec !== 'none' && f.resolution)
      .slice(-5)
      .reverse();

    for (const fmt of videoFormats) {
      const size = fmt.filesize ? ` (${formatFileSize(fmt.filesize)})` : '';
      const fps = fmt.fps ? ` @ ${fmt.fps}fps` : '';
      console.log(
        `    ${chalk.dim(fmt.format_id.padEnd(10))} ${chalk.cyan((fmt.resolution || 'unknown').padEnd(12))}${fps}${chalk.dim(size)}`
      );
    }
  }
  console.log(chalk.dim('─'.repeat(50)));
  console.log();
}
