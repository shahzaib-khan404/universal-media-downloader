# API.md

## Current Interface
This project currently exposes a CLI interface rather than a traditional HTTP API.

## External Dependency
- yt-dlp is the primary engine for downloading media from supported websites.

## CLI Commands
- download: download media from a URL
- info: retrieve metadata without downloading
- install: install or update yt-dlp

## Expected Inputs
- URL or playlist URL
- Output format and quality options
- Optional flags for audio-only, subtitles, playlist mode, and rate limiting

## Output Model
- Progress information during download
- Final status message with destination path
- Error output if the request fails

## Future API Considerations
If a desktop or web UI is later added, this document should be expanded to describe REST or local IPC endpoints.
