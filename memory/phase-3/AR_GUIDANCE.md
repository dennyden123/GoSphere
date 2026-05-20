# AR Guidance System

## Overview
The AR Guidance System provides real-time, spatial instructions for complex gardening tasks like pruning and measurement. It overlays cinematic, high-precision HUD elements onto the camera feed to guide users through plant maintenance.

## Features
### 1. Interactive Pruning Guides
- **Modes:** Structural, Deadheading, Harvesting.
- **HUD:** Holographic cut-line with interactive drag-to-align functionality.
- **Guidance:** Scientific instructions for each pruning type (e.g., 45° angle cuts).

### 2. Spatial Measuring Tool
- **Mechanism:** Dual-marker sliding caliper.
- **Calculation:** Real-time pixel-to-cm conversion for leaf and stem metrics.
- **Interactivity:** Dynamic marker selection and dimension line rendering.

### 3. Sensor Fusion & Physics
- **Tech:** `expo-sensors` (Accelerometer) + `react-native-reanimated`.
- **Effect:** 3D parallax tilt based on device pitch and roll, making overlays feel "grounded" in physical space.
- **Physics:** Spring-based damping for fluid, high-tech HUD movement.

### 4. AR Diagnostics (Scan Mode)
- **Mechanism:** Neural reticle + Multi-spectral scan animation.
- **Inference:** Integrated with Cloud AI (Hugging Face) for simultaneous Plant ID and Disease Detection.
- **HUD:** Holographic callout tags floating in 3D space with confidence metrics.
- **Interactivity:** Tap-to-scan functionality with a real-time animated scan-line.

## Data Architecture
- **Schema:** v3 (WatermelonDB).
- **Persistence:** Measurements and actions are saved to `garden_logs`.
- **Telemetry:** New `telemetry_value` and `telemetry_unit` fields in logs for tracking growth trends.

## Aesthetic (Mission Control)
- **Colors:** Neon Green (#4ade80) for Pruning, Cyan (#60a5fa) for Measuring.
- **UI:** Pulsing holographic effects, glassmorphic instruction cards, and real-time status badges.
