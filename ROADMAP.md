# ROADMAP.md

## Phase 1 - Engine & CLI Stabilization [COMPLETED]
- [x] Integrate full native binary resolution for `yt-dlp` and `ffmpeg` (Gyan build).
- [x] Direct worker polling and execution mode with SQLite state persistence.
- [x] Robust error handling, sanitize filenames, and support multi-platform extraction.

## Phase 2 - Feature & Audio Expansion [COMPLETED]
- [x] Dedicated Audio Downloader section (`/audio`) supporting MP3 320kbps, FLAC lossless, and M4A/AAC.
- [x] ID3 metadata embedding (cover artwork, artist, title, album tags).
- [x] Album and Playlist bulk extraction engine (`/album`) with automated `.zip` packaging and sequential downloading.

## Phase 3 - 3D Glassmorphic UI & Visual Experience [COMPLETED]
- [x] Revamped design system using **Vibrant Tangerine Orange (`#FF6B00`)**, **Crisp White (`#FFFFFF`)**, and **Obsidian Glass (`#0B0D13`)**.
- [x] Interactive floating 3D orb canvas and dynamic glowing glass panels (`.glass-panel`, `.glass-panel-elevated`).
- [x] 3D tactile buttons (`.btn-3d-orange`) with micro-interactions and smooth hover depth.
- [x] Redesigned live extraction progress ring with multi-stop gradients and real-time step trackers.
- [x] Fully mobile-viewport responsive layout across navigation, search input, format tables, and pricing cards.

## Phase 4 - Cloud Queue, Production & Distribution [COMPLETED]
- [x] WebSocket / SSE live telemetry streaming across multiple concurrent workers with polling fallback.
- [x] User authentication (JWT + bcrypt) with 3D glassmorphic auth portals (`/login`, `/register`).
- [x] Redis + BullMQ cluster worker engine with auto binary resolution, ID3 tagging, and SSE broadcast.
- [x] Native Desktop App wrapper configured with Electron (`npm run desktop`) loading full Next.js UI.
