# ARCHITECTURE.md

## High-Level Architecture
This repository is evolving into a monorepo containing three distinct layers:
- `frontend/`: Next.js SaaS application
- `backend/`: Fastify API and download orchestration
- root CLI: legacy Universal Media Downloader tooling

The new architecture is designed for scalability, maintainability, and separation of concerns.

## Frontend Architecture
The frontend is a modern App Router application with Feature First structure.
- `app/`: top-level routes and page layout
- `components/`: reusable presentational components
- `features/`: feature-specific UI modules
- `hooks/`: shared React hooks
- `lib/`: cross-cutting utilities and providers
- `services/`: dedicated API communication layer
- `types/`: shared TypeScript models
- `styles/`: global style tokens and themes

## Backend Architecture
The backend uses Fastify and Prisma, with a modular service architecture.
- `src/modules/`: domain modules like `downloads`, `users`, `history`, `queue`
- `controllers/`: request handlers and route registration
- `services/`: business logic and orchestration
- `repositories/`: persistence and Prisma access
- `validation/`: request schemas and DTOs
- `types/`: shared backend models

## Download Pipeline
The backend architecture supports the following flow:
1. Frontend submits a download request to backend API
2. API validates the request and enqueues a job
3. Worker processes the job asynchronously
4. Worker runs `yt-dlp` and FFmpeg in an isolated execution environment
5. Processed media is stored via an abstract storage provider
6. A secure download link is generated and returned to the frontend

## Data Flow
- `frontend` only calls backend services
- `backend` never performs download work in request handlers
- downloads are processed via queue worker jobs
- storage is abstracted to support local, S3, R2, or B2 providers

## Extensibility
This structure enables:
- independent frontend and backend development
- strong separation between UI and business logic
- replacement of storage providers with minimal code changes
- safe scaling from a single server to containerized production

## Current Root Package
The existing root CLI remains in place as a legacy tool. It can be migrated into a separate package or workspace later, but it does not block frontend/backend development.
