#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import * as path from 'path';
import * as os from 'os';
import { Downloader, printMediaInfo } from './downloader';
import { promptDownload } from './interactive';
import { log, resolveOutputDir } from './utils';
import { DownloadFormat, VideoQuality } from './types';

const DEFAULT_OUTPUT = path.join(os.homedir(), 'Downloads', 'media-downloads');

function printBanner(): void {
  console.log();
  console.log(chalk.bold.cyan('  ██╗   ██╗███╗   ███╗██████╗ '));
  console.log(chalk.bold.cyan('  ██║   ██║████╗ ████║██╔══██╗'));
  console.log(chalk.bold.cyan('  ██║   ██║██╔████╔██║██║  ██║'));
  console.log(chalk.bold.cyan('  ██║   ██║██║╚██╔╝██║██║  ██║'));
  console.log(chalk.bold.cyan('  ╚██████╔╝██║ ╚═╝ ██║██████╔╝'));
  console.log(chalk.bold.cyan('   ╚═════╝ ╚═╝     ╚═╝╚═════╝ '));
  console.log(chalk.dim('  Universal Media Downloader — 1000+ sites'));
  console.log();
}

async function ensureYtDlp(): Promise<boolean> {
  const installed = await Downloader.checkInstallation();
  if (!installed) {
    log.warn('yt-dlp is not installed. Installing now...');
    try {
      await Downloader.install();
      return true;
    } catch (err) {
      log.error('Failed to install yt-dlp automatically.');
      log.info('Please install it manually: https://github.com/yt-dlp/yt-dlp#installation');
      log.info('  macOS:   brew install yt-dlp');
      log.info('  pip:     pip install yt-dlp');
      return false;
    }
  }
  return true;
}

const program = new Command();

program
  .name('umd')
  .description('Universal Media Downloader — download from YouTube, Twitter, Instagram, TikTok, and 1000+ more sites')
  .version('1.0.0')
  .showHelpAfterError();

program
  .command('download [url]', { isDefault: true })
  .alias('dl')
  .description('Download media from a URL (interactive mode if no URL provided)')
  .option('-o, --output <dir>', 'Output directory', DEFAULT_OUTPUT)
  .option('-f, --format <fmt>', 'Output format: mp4|mkv|webm|mp3|aac|flac|wav|best', 'mp4')
  .option('-q, --quality <res>', 'Video quality: 2160p|1440p|1080p|720p|480p|360p|best', '1080p')
  .option('-a, --audio-only', 'Extract audio only')
  .option('-s, --subtitles', 'Download English subtitles')
  .option('-p, --playlist', 'Download full playlist')
  .option('-n, --filename <name>', 'Custom output filename (without extension)')
  .option('-r, --rate-limit <rate>', 'Rate limit (e.g. 1M, 500K)')
  .option('--proxy <url>', 'Use proxy URL')
  .option('--cookies <file>', 'Path to cookies file (Netscape format)')
  .option('-i, --interactive', 'Force interactive mode')
  .action(async (url?: string, opts?: {
    output: string;
    format: string;
    quality: string;
    audioOnly: boolean;
    subtitles: boolean;
    playlist: boolean;
    filename?: string;
    rateLimit?: string;
    proxy?: string;
    cookies?: string;
    interactive?: boolean;
  }) => {
    printBanner();

    const ready = await ensureYtDlp();
    if (!ready) process.exit(1);

    const downloader = new Downloader();

    let downloadOptions;

    if (!url || opts?.interactive) {
      downloadOptions = await promptDownload(url);
    } else {
      downloadOptions = {
        url,
        outputDir: opts!.output,
        format: opts!.format as DownloadFormat,
        quality: opts!.quality as VideoQuality,
        audioOnly: opts!.audioOnly || false,
        subtitles: opts!.subtitles || false,
        playlist: opts!.playlist || false,
        filename: opts!.filename,
        rateLimit: opts!.rateLimit,
        proxy: opts!.proxy,
        cookies: opts!.cookies,
      };
    }

    log.info(`Fetching media info for: ${log.url(downloadOptions.url)}`);

    try {
      const info = await downloader.getInfo(downloadOptions.url);
      await printMediaInfo(info);
    } catch {
      log.warn('Could not fetch media info, proceeding with download...');
    }

    const outputDir = resolveOutputDir(downloadOptions.outputDir);
    log.info(`Saving to: ${chalk.white(outputDir)}`);
    console.log();

    const result = await downloader.download({ ...downloadOptions, outputDir });

    console.log();
    if (result.success) {
      log.success('Download complete!');
      if (result.outputPath) {
        log.dim(`  Saved to: ${result.outputPath}`);
      }
    } else {
      log.error(`Download failed: ${result.error}`);
      process.exit(1);
    }
  });

program
  .command('info <url>')
  .description('Show media info without downloading')
  .action(async (url: string) => {
    printBanner();

    const ready = await ensureYtDlp();
    if (!ready) process.exit(1);

    log.info(`Fetching info for: ${log.url(url)}`);

    try {
      const downloader = new Downloader();
      const info = await downloader.getInfo(url);
      await printMediaInfo(info);
    } catch (err) {
      log.error(`Failed to get media info: ${err instanceof Error ? err.message : String(err)}`);
      process.exit(1);
    }
  });

program
  .command('install')
  .description('Install or update the yt-dlp dependency')
  .action(async () => {
    printBanner();
    log.info('Installing yt-dlp...');
    try {
      await Downloader.install();
    } catch (err) {
      log.error(`Installation failed: ${err instanceof Error ? err.message : String(err)}`);
      process.exit(1);
    }
  });

program.parse(process.argv);
