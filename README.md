# Universal Media Downloader

This repository is a modern full-stack media extraction monorepo with:
- `frontend/`: Next.js 15 app with playful 3D obsidian & tangerine orange glassmorphic UI (`#FF6B00`)
- `backend/`: Fastify API with SSE telemetry, SQLite/PostgreSQL persistence, and BullMQ/Direct download workers
- Root CLI tooling: Legacy terminal downloader & Electron desktop wrapper

Download 8K/4K video, 320 kbps MP3 tracks, and full album `.zip` packages from 1,800+ websites powered by native `yt-dlp` and `ffmpeg`.

## Setup & Running

### 1. Web Application
```bash
# Backend (Fastify API on :4000)
cd backend
npm install
npm run dev

# Frontend (Next.js 15 on :3000)
cd ../frontend
npm install
npm run dev
```

### 2. Native Desktop Application
```bash
# In the repository root:
npm run desktop
```

## Usage

### Interactive mode
```bash
npm run dev
# or after build:
node dist/index.js
```

### CLI mode
```bash
# Download a video
node dist/index.js download "https://www.youtube.com/watch?v=..."

# Download audio only (MP3)
node dist/index.js download "https://www.youtube.com/watch?v=..." -a -f mp3

# Download at specific quality
node dist/index.js download "URL" -q 720p -f mp4

# Download a full playlist
node dist/index.js download "https://youtube.com/playlist?list=..." -p

# Download with subtitles
node dist/index.js download "URL" -s

# Get media info without downloading
node dist/index.js info "URL"

# Install/update yt-dlp
node dist/index.js install
```

### Options
| Flag | Description | Default |
|------|-------------|---------|
| `-o, --output <dir>` | Output directory | `~/Downloads/media-downloads` |
| `-f, --format <fmt>` | Format: `mp4\|mkv\|webm\|mp3\|aac\|flac\|wav\|best` | `mp4` |
| `-q, --quality <res>` | Quality: `2160p\|1440p\|1080p\|720p\|480p\|360p\|best` | `1080p` |
| `-a, --audio-only` | Extract audio only | `false` |
| `-s, --subtitles` | Download English subtitles | `false` |
| `-p, --playlist` | Download full playlist | `false` |
| `-n, --filename <name>` | Custom output filename | auto |
| `-r, --rate-limit <rate>` | Rate limit (e.g. `1M`, `500K`) | unlimited |
| `--proxy <url>` | Proxy URL | none |
| `--cookies <file>` | Cookies file (Netscape format) | none |
| `-i, --interactive` | Force interactive mode | `false` |

## Supported Sites

Any site supported by yt-dlp, including:
- YouTube, YouTube Music
- Twitter/X, Instagram, TikTok
- Vimeo, Dailymotion
- Reddit, Facebook
- Twitch (VODs & clips)
- SoundCloud, Bandcamp
- And [1000+ more](https://github.com/yt-dlp/yt-dlp/blob/master/supportedsites.md)

## Requirements

- Node.js 18+
- `yt-dlp` (auto-installed on first run, or install via `brew install yt-dlp`)
- `ffmpeg` (recommended for best quality merging): `brew install ffmpeg`
