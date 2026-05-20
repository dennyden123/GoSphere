# Architecture & Core Decisions

## Tech Stack
- **Monorepo:** Turborepo + NPM Workspaces.
- **Mobile:** Expo (React Native) + WatermelonDB + SQLite.
- **Web:** Next.js (App Router) + Tailwind CSS + Framer Motion.
- **Backend:** Supabase (Postgres, Auth, Edge Functions).
- **UI:** Shared `@repo/ui` package using Tailwind and Radix primitives.

## Data Flow (Offline-First)
1. **Local Writes:** Mobile app writes directly to WatermelonDB.
2. **Sync Engine:** A background task checks for connectivity.
3. **Push/Pull:** Local changes are synced to Supabase; global updates (like new plant dictionary entries) are pulled down.

## UI/UX: Mission Control
- **Palette:** `#050A10` (Background), `#00FF41` (Primary Green), `#00AAFF` (Accent Blue).
- **Glassmorphism:** Used for overlays and cards to maintain depth.
- **Typography:** Inter for readability, possibly a monospace font for data points.
