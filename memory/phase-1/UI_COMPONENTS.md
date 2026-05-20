# Mission Control UI Components

## Overview
The UI library (`@repo/ui`) implements a cinematic, high-fidelity aesthetic inspired by modern space-age interfaces. Key features include glassmorphism, bioluminescent glows, and fluid micro-interactions.

## Core Components

### 1. BioluminescentButton
- **Purpose:** Primary action element with a striking neon glow.
- **Variants:** `primary` (glowing green), `secondary` (dark blue), `outline`, `ghost`, `destructive`.
- **Key Features:** 
  - Dynamic shadow glow (`rgba(0, 255, 65, 0.3)`).
  - Active state scaling (`scale-95`).
  - Integrated `glow` prop for toggling bioluminescence.

### 2. GlassCard
- **Purpose:** Primary container for data and UI modules.
- **Intensities:** `low` (subtle blur), `medium` (standard), `high` (extra blur/frost).
- **Key Features:** 
  - `backdrop-blur` for depth.
  - Border highlight (`white/10`) to define edges in dark space.
  - Optional `glow` border for high-priority alerts.

## Technical Implementation
- **Base:** React + Tailwind CSS.
- **Utilities:** `clsx` and `tailwind-merge` via a custom `cn` helper for conflict-free class management.
- **Icons:** Lucide-React for consistent, stroke-based iconography.
