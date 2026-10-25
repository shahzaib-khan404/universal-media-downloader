import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

let cachedYtDlpBinary: string | null = null;
let cachedFfmpegBinary: string | null = null;
let cachedFfprobeBinary: string | null = null;

export function resolveYtDlpBinary(): string {
  if (cachedYtDlpBinary) return cachedYtDlpBinary;

  if (process.env.YT_DLP_PATH && fs.existsSync(process.env.YT_DLP_PATH)) {
    cachedYtDlpBinary = process.env.YT_DLP_PATH;
    return cachedYtDlpBinary;
  }

  if (process.platform === 'win32') {
    const appData = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
    const localAppData = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');

    const candidates = [
      path.join(appData, 'Python', 'Python313', 'Scripts', 'yt-dlp.exe'),
      path.join(appData, 'Python', 'Python312', 'Scripts', 'yt-dlp.exe'),
      path.join(appData, 'Python', 'Python311', 'Scripts', 'yt-dlp.exe'),
      path.join(appData, 'Python', 'Python310', 'Scripts', 'yt-dlp.exe'),
      path.join(localAppData, 'Programs', 'Python', 'Python313', 'Scripts', 'yt-dlp.exe'),
      path.join(localAppData, 'Programs', 'Python', 'Python312', 'Scripts', 'yt-dlp.exe'),
      path.join(localAppData, 'Microsoft', 'WinGet', 'Links', 'yt-dlp.exe'),
      'C:\\Python313\\Scripts\\yt-dlp.exe',
      'C:\\Python312\\Scripts\\yt-dlp.exe',
      path.join(process.cwd(), 'yt-dlp.exe'),
    ];

    for (const candidate of candidates) {
      if (fs.existsSync(candidate)) {
        cachedYtDlpBinary = candidate;
        return cachedYtDlpBinary;
      }
    }
  }

  cachedYtDlpBinary = 'yt-dlp';
  return cachedYtDlpBinary;
}

export function resolveFfmpegBinary(): string {
  if (cachedFfmpegBinary) return cachedFfmpegBinary;

  if (process.env.FFMPEG_PATH && fs.existsSync(process.env.FFMPEG_PATH)) {
    cachedFfmpegBinary = process.env.FFMPEG_PATH;
    return cachedFfmpegBinary;
  }

  if (process.platform === 'win32') {
    const localAppData = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
    const wingetDir = path.join(localAppData, 'Microsoft', 'WinGet', 'Packages');
    
    if (fs.existsSync(wingetDir)) {
      try {
        const dirs = fs.readdirSync(wingetDir);
        for (const dir of dirs) {
          if (dir.toLowerCase().includes('ffmpeg')) {
            const fullPath = path.join(wingetDir, dir);
            // Search inside directory for bin/ffmpeg.exe
            const subdirs = fs.readdirSync(fullPath);
            for (const sub of subdirs) {
              const binFfmpeg = path.join(fullPath, sub, 'bin', 'ffmpeg.exe');
              if (fs.existsSync(binFfmpeg)) {
                cachedFfmpegBinary = binFfmpeg;
                return cachedFfmpegBinary;
              }
            }
          }
        }
      } catch { /* ignore filesystem scan errors */ }
    }

    const wingetLink = path.join(localAppData, 'Microsoft', 'WinGet', 'Links', 'ffmpeg.exe');
    if (fs.existsSync(wingetLink)) {
      cachedFfmpegBinary = wingetLink;
      return cachedFfmpegBinary;
    }
  }

  cachedFfmpegBinary = 'ffmpeg';
  return cachedFfmpegBinary;
}

export function resolveFfprobeBinary(): string {
  if (cachedFfprobeBinary) return cachedFfprobeBinary;

  if (process.env.FFPROBE_PATH && fs.existsSync(process.env.FFPROBE_PATH)) {
    cachedFfprobeBinary = process.env.FFPROBE_PATH;
    return cachedFfprobeBinary;
  }

  if (process.platform === 'win32') {
    const localAppData = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
    const wingetDir = path.join(localAppData, 'Microsoft', 'WinGet', 'Packages');
    
    if (fs.existsSync(wingetDir)) {
      try {
        const dirs = fs.readdirSync(wingetDir);
        for (const dir of dirs) {
          if (dir.toLowerCase().includes('ffmpeg')) {
            const fullPath = path.join(wingetDir, dir);
            const subdirs = fs.readdirSync(fullPath);
            for (const sub of subdirs) {
              const binFfprobe = path.join(fullPath, sub, 'bin', 'ffprobe.exe');
              if (fs.existsSync(binFfprobe)) {
                cachedFfprobeBinary = binFfprobe;
                return cachedFfprobeBinary;
              }
            }
          }
        }
      } catch { /* ignore filesystem scan errors */ }
    }

    const wingetLink = path.join(localAppData, 'Microsoft', 'WinGet', 'Links', 'ffprobe.exe');
    if (fs.existsSync(wingetLink)) {
      cachedFfprobeBinary = wingetLink;
      return cachedFfprobeBinary;
    }
  }

  cachedFfprobeBinary = 'ffprobe';
  return cachedFfprobeBinary;
}
