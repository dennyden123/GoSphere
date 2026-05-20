# Phase 4: IoT Integration

## Architecture
The GroSphere platform now supports real-time hardware telemetry ingestion for IoT devices (like ESP32 or Raspberry Pi equipped with soil moisture and light sensors).

### 1. Database Schema
We introduced a new table `hardware_telemetry` to handle high-frequency sensor readings independently from manual user logs (`garden_logs`).
- **Fields:** `user_garden_id`, `sensor_type` (e.g., 'soil_moisture'), `reading_value`, `reading_unit`, `recorded_at`.
- **Indexing:** Optimized for time-series querying.
- **Realtime:** Enabled Supabase Realtime for this table.

### 2. Edge Function (Ingestion API)
Created a lightweight Deno Edge Function (`supabase/functions/iot-ingest`) specifically designed for low-power microcontrollers.
- **Why Edge?** Prevents IoT devices from needing complex Supabase client libraries. They can send a simple `POST` request with JSON and a Bearer token.
- **Payload:** `{ "user_garden_id": "uuid", "sensor_type": "soil_moisture", "value": 45, "unit": "%" }`

### 3. Frontend Visualization (Mission Control)
Both the Web Dashboard (Next.js) and the Mobile App (Expo) have been updated to subscribe to the `hardware_telemetry` table via Supabase Realtime channels.
- When an IoT device posts a new reading, the UI updates instantly without requiring a page refresh or manual sync.
- The `SpecimenRow` component now dynamically reflects the `liveTelemetry` for moisture levels and triggers warnings if levels drop below optimal thresholds.

## Next Steps for Hardware
1. Flash an ESP32 with a basic HTTP POST script pointing to the Supabase Edge Function URL.
2. Ensure the hardware passes the correct `user_garden_id` mapping to link physical sensors to the digital twin in the app.
