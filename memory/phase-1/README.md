# Phase 1: Planning, Foundation & Architecture (COMPLETE)

## Goals
- [x] Establish the monorepo structure.
- [x] Define the technical stack (Offline-First).
- [x] Design the initial data schema.
- [x] Select AI models for plant identification (`MobilePlantViT` + `PlantNet Ensemble`).
- [x] Build core "Mission Control" UI components.
- [x] Apply initial schema to Supabase.
- [x] Design offline sync strategy (WatermelonDB + Supabase).

## Key Decisions
...
4. **AI Strategy:** Start with HuggingFace Inference API for web/testing, then convert models to ONNX for mobile edge execution.

## Documents
- [Architecture & Decisions](./ARCH_DECISIONS.md)
- [AI Model Research](./AI_RESEARCH.md)
- [UI Components](./UI_COMPONENTS.md)
- [Database Schema Notes](./DB_SCHEMA_NOTES.md)
- [Sync Strategy](./SYNC_STRATEGY.md)
