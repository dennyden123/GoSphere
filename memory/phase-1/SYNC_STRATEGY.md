# Offline Sync Strategy: WatermelonDB + Supabase

## Overview
GroSphere uses an offline-first architecture to ensure gardeners can log activities (watering, notes) even in low-connectivity areas (backyards, rooftops). Data is persisted locally in WatermelonDB and synchronized with Supabase when online.

## Sync Architecture
We will utilize WatermelonDB's built-in `synchronize()` function, which requires two primary hooks: `pullChanges` and `pushChanges`.

### 1. Pull Changes (Server -> Client)
- **Mechanism:** The client sends a `lastPulledAt` timestamp to a Supabase Edge Function.
- **Server Logic:** 
  - Query all tables for records where `updated_at > lastPulledAt`.
  - Include records where `deleted_at` is not null (to sync deletions).
- **Batching:** Use pagination if the delta is extremely large (unlikely for individual user garden data).

### 2. Push Changes (Client -> Server)
- **Mechanism:** WatermelonDB provides a JSON object containing `created`, `updated`, and `deleted` records.
- **Server Logic:** 
  - An Edge Function iterates through the changes and performs bulk `upsert` operations.
  - Deletions are handled by setting a `deleted_at` timestamp (Soft Delete) or hard deleting if preferred.
- **Security:** RLS (Row Level Security) ensures users can only push changes to their own records.

## Database Requirements (Supabase)
To support syncing, every table in Supabase must include:
1. `id` (UUID): To match WatermelonDB's local IDs.
2. `updated_at` (Timestamp): To track the latest modification.
3. `deleted_at` (Timestamp, Nullable): To track deleted records for the client.

## Conflict Resolution
- **Strategy:** "Last Write Wins" (standard for WatermelonDB). 
- **Future-proofing:** If complex conflicts arise (e.g., two people editing a shared garden), we will move logic into a dedicated "Sync Resolver" Edge Function.

## Datetime Mapping & Schema Type Casts (Fixed May 25, 2026)
- **Problem:** SQLite stores datetimes as numeric epochs (milliseconds since Jan 1 1970) for WatermelonDB, whereas Supabase/PostgreSQL stores them as string datetimes with timezone (`TIMESTAMP WITH TIME ZONE`). Direct insertions on both sides failed.
- **Solution:** Integrated `mapToLocal` and `mapToRemote` hooks directly in [sync.ts](file:///Users/denny/GroShpere/apps/mobile/src/database/sync.ts):
  - On pull, date strings are parsed into numbers using `new Date(val).getTime()`.
  - On push, numbers are converted to ISO 8601 strings using `new Date(val).toISOString()`.
  - Applied to `created_at`, `updated_at`, `deleted_at` across all synced tables, as well as `log_date` in `garden_logs`.

## Implementation Roadmap
1. **Supabase Update:** Add `updated_at` and `deleted_at` columns to all tables.
2. **Edge Function:** Create a `sync` Edge Function in Deno to handle the pull/push logic.
3. **Mobile Client:** Implement the `synchronize` call in `src/database/sync.ts`.
