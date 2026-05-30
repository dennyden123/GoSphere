# GroSphere: Technical Details & Implementation Notes

This document serves as the technical source of truth for the GroSphere platform, detailing the stack, integration points, and architectural decisions.

## 1. Core Technology Stack
*   **Monorepo Tooling:** Turborepo, npm workspaces.
*   **Frontend (Web):** Next.js (App Router), React, Tailwind CSS, TypeScript.
*   **Frontend (Mobile):** Expo, React Native, TypeScript.
*   **Shared UI:** Shared React component library within the monorepo (`@repo/ui`).
*   **Backend & Database:** Supabase (PostgreSQL, GoTrue for Auth, Realtime, Storage).
*   **AI/ML:** Hugging Face Inference API (Cloud), ONNX Runtime (Mobile - Future).

## 2. Offline-First Architecture
The mobile application uses an "Offline-First" strategy for data and a "Cloud-First, Local-Cached" strategy for AI.
*   **Local Data Store:** **WatermelonDB** for reactive, offline-first data caching (Schema v3 with telemetry support).
*   **Sync Engine:** Integrated WatermelonDB `synchronize()` logic with Supabase. Optimized for performance by parallelizing table pulls (`plants`, `user_gardens`, etc.).
*   **Conflict Resolution:** Last Write Wins (LWW).
*   **Media Caching:** Images and offline guides cached via `expo-file-system`.

## 3. AR & Sensor Fusion (Phase 3)
*   **Implementation:** `expo-camera` for real-time background, `expo-gl` for 3D potential, and `react-native-svg` for holographic HUD overlays.
*   **Sensor Fusion:** `expo-sensors` (Accelerometer) integrated with `react-native-reanimated` to provide a 3D tilting parallax effect for the AR HUD.
*   **Persistence:** AR measurements and pruning actions are persisted to `garden_logs` with telemetry values (v3 schema).

## 4. Connected Ecosystem (Phase 4)
*   **IoT Infrastructure:** Deno-based Supabase Edge Functions (`iot-ingest`) for hardware telemetry ingestion.
*   **Realtime HUD:** Supabase Realtime subscriptions for live sensor data (moisture, light) and community feed synchronization.
*   **Social Architecture:** PostgreSQL tables for `social_posts`, `follows`, `post_likes`, and automated `notifications` via DB triggers.
*   **Commerce Platform:** 
    *   **Payments:** Stripe React Native SDK integration with secure server-side Payment Intent generation.
    *   **P2P Swap:** Peer-to-peer `seed_listings` and `swap_requests` integrated into the marketplace.
*   **Gamification:** Automated achievement engine awarding `badges` based on real-time horticultural milestones.

## 5. AI Implementation (Plant/Disease ID)
Pivoted to a cloud-first approach for Phase 2 to ensure maximum accuracy and zero on-device model overhead.
*   **Identification Model:** `Hemant_Kumar/plant-identification` via Hugging Face Inference API.
*   **Disease Model:** `imadegunawan/plant-disease-detection-using-vit` via Hugging Face Inference API.
*   **Preprocessing:** Images are resized to 512px and compressed to JPEG. Base64 conversion is optimized using the `base64-js` library for low-latency transmission.
*   **Latency:** Optimized for <1s inference using the Hugging Face Serverless API.

## 6. UI/UX: The "Mission Control" Aesthetic
The interface must feel cinematic, highly functional, and visually striking, inspired by modern interactive sites (`motionsites.ai`).
*   **Visual Language:** Dark mode by default, neon accents (e.g., bioluminescent green/blue), blurred glassmorphism effects for overlays.
*   **Animations:** Use Framer Motion (Web) and React Native Reanimated (Mobile) for fluid transitions and interactive elements.
*   **Components:** Custom `BioluminescentButton` and `GlassCard` built in `@repo/ui`. Web components are modularized for better maintainability (e.g., `Dashboard/TelemetryCard`).

## 7. Supabase Integration
*   **Auth:** Email/Password via Supabase Auth. Session persistence handled by `expo-secure-store` for encrypted local storage.
*   **Storage:** Buckets for `user-uploads` and `system-assets`.
*   **Database:** Reactive PostgreSQL with RLS policies, connected to mobile via `withObservables`.
*   **Edge Functions:** Deno-based functions (Sync Bridge, Cloud AI fallback).

## 8. Development & Deployment
*   **Web Deployment:** Vercel.
*   **Mobile Deployment:** Expo Application Services (EAS).
*   **CI/CD:** GitHub Actions via Turborepo (`turbo run test lint`).
