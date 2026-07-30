# PRD.md

## Product Summary
Universal Media Downloader helps users quickly download videos, audio, subtitles, and playlists from supported media sites.

## Target Users
- Casual users who want a one-command download experience
- Power users who need playlists, quality selection, and advanced options
- Developers who want a reusable CLI foundation for media tooling

## Core Features
- Download videos from single URLs
- Download audio-only MP3 or other formats
- Download full playlists
- Select video quality and output format
- Optional subtitle download
- Interactive mode for guided usage

## Non-Goals
- Full browser automation for unsupported sites
- A desktop/mobile app in the first release
- Complex media editing features

## Success Criteria
- Users can successfully download a supported URL in under 1 minute
- CLI commands remain understandable and predictable
- New contributors can extend the downloader with minimal friction

## Design Alignment
- The Figma design should clarify onboarding, command usage, progress states, and success/error feedback.
- Any future UI should preserve the product’s core simplicity.
