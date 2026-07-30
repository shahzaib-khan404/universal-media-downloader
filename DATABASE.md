# DATABASE.md

## Current State
The current project does not require a database for the base CLI experience.

## Planned Persistence
If history, preferences, or queue management are added later, the project can use one of the following:
- SQLite for structured local storage
- JSON files for lightweight configuration and history
- Optional cloud sync in a future product version

## Suggested Data Models
### Download Record
- id
- sourceUrl
- format
- quality
- outputPath
- status
- createdAt
- completedAt

### User Settings
- outputDirectory
- defaultFormat
- defaultQuality
- subtitlePreference
- themePreference
