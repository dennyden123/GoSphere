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

## Security & Storage Constraints
- **Session Chunking on Mobile:** The Supabase session object can easily exceed `expo-secure-store`'s hardware key size limit of 2KB (2048 bytes). Refactored [storage.ts](file:///Users/denny/GroShpere/apps/mobile/src/lib/storage.ts) to automatically chunk values exceeding 2000 bytes across split keys (`[key]_chunk_[i]`) and reconcile them via a manifest (`[key]_manifest`) during retrieval, resolving infinite logouts.
- **Row Level Security (RLS) & Triggers:** Optimizations applied to `order_items` (added `INSERT` policy), `swap_requests` (added cancellation capability), and `hardware_telemetry` triggers (preventing performance bottlenecks on high-frequency writes by checking existing badges early).
