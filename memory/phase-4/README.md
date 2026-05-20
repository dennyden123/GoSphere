# Phase 4: Community, IoT & Marketplace

## Focus
- Social features (Seed swapping, progress sharing).
- IoT sensor integration (Soil moisture, LUX).
- Marketplace for urban gardening supplies.

## Current Progress
- [x] **Smart Technology (IoT):**
  - Designed `hardware_telemetry` schema and created Supabase migration.
  - Implemented `iot-ingest` Edge Function for low-power microcontroller communication.
  - Integrated Supabase Realtime subscriptions into both Web and Mobile "Mission Control" dashboards to dynamically visualize hardware sensor data.
- [x] **Community & Social:**
  - Expanded database schema with `follows`, `social_posts`, `likes`, and `badges`.
  - Implemented a new **Global Feed** in the mobile app with real-time post synchronization.
  - Enhanced user profiles with social telemetry (Followers/Following) and achievement grids.
- [x] **Marketplace (Complete):**
  - Designed `products`, `orders`, and `order_items` schema.
  - Implemented the **Marketplace Storefront** in the mobile app with category filtering.
  - Developed the **Shopping Cart & Checkout Flow** with secure **Stripe integration**.
  - Automated order persistence to Supabase via Edge Functions.

- [x] **Community Seed Swap:** Extended the marketplace into a P2P platform allowing users to list seeds for trade, send swap requests, and receive real-time notifications.
