# Mobile Architecture & Navigation

## Navigation Structure
The mobile application uses a **Bottom Tab Navigation** strategy for primary top-level navigation.

### Tabs
1.  **Control (Dashboard):** Real-time telemetry, system status, and active specimen highlights.
2.  **Scan:** AI-powered vision system for plant identification and health diagnostics.
3.  **Garden:** Full inventory of the user's flora, categorized by sector.
4.  **User (Profile):** Gardener stats, levels, system settings, and security.

## Visual Design (Mission Control)
- **Background:** Deep space blacks (`#050A10`) with large, subtle bioluminescent gradients.
- **Components:**
  - **Glassmorphism:** Tab bar uses `BlurView` (iOS) or high-transparency overlays (Android) for a frosty, layered effect.
  - **Typography:** Bold headers and monospace system text for a technical/cinematic feel.
  - **Colors:** `#00FF41` (Action Green), `#00AAFF` (System Blue), `#94a3b8` (Muted Slate).

## Implementation Details
- **Library:** `@react-navigation/bottom-tabs`.
- **Icons:** `lucide-react-native`.
- **Gradients:** `expo-linear-gradient`.
- **Blur:** `expo-blur`.
