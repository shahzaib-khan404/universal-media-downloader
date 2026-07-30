# CLAUDE.md

## Project Overview
Universal Media Downloader is a Node.js + TypeScript CLI tool for downloading media from URLs, playlists, and supported sites using yt-dlp.

## Primary Goals
- Provide a simple command-line experience for downloading video and audio.
- Support interactive and non-interactive usage.
- Keep the implementation modular, typed, and easy to extend.

## Tech Stack
- TypeScript
- Node.js 18+
- Commander for CLI parsing
- Inquirer for interactive prompts
- chalk and cli-progress for UX output

## Development Guidelines
- Prefer small, focused modules under src/.
- Keep types explicit and avoid any.
- Preserve CLI compatibility when changing commands or flags.
- Write clear inline comments only where behavior is non-obvious.
- When adding new features, update documentation files in the repo root.

## Project Structure
- src/index.ts: CLI entry point
- src/interactive.ts: interactive flow
- src/downloader.ts: download orchestration
- src/utils.ts: helper functions
- src/types.ts: shared types

## Figma and Design Notes
- If a UI redesign is introduced, keep the design system document in sync with the implementation.
- Treat Figma as a source of truth for layout, visual hierarchy, and interaction flow.
