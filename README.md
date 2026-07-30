# Universal Media Downloader

This repository is transitioning to a modern SaaS monorepo structure with:
- `frontend/`: Next.js 15 app for web UI
- `backend/`: Fastify API and download orchestration
- root CLI tooling: legacy downloader package

Download media from 1000+ websites including YouTube, Twitter/X, Instagram, TikTok, Vimeo, Reddit, and more — powered by [yt-dlp](https://github.com/yt-dlp/yt-dlp).

## Setup

Frontend and backend have separate install steps:

```bash
cd frontend
npm install
npm run dev
```

```bash
cd backend
npm install
npm run dev
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
