# GroSphere: Development Retrospective & Build Log

This document provides a detailed account of the end-to-end development process for **GroSphere**, an AI-powered urban gardening platform.

---

## 🚀 Project Vision
To empower urban gardeners with a "Mission Control" experience, combining cinematic UI aesthetics with high-tech features like Cloud AI diagnostics, AR spatial guidance, and real-time IoT telemetry.

---

## 🏗️ Phase 1: Foundation & Architecture
**Goal:** Establish the technical bedrock and design system.
- **Architectural Choice:** Adopted a **Turborepo monorepo** to manage the React Native (Expo) mobile app, Next.js web app, and shared UI/logic packages.
- **Backend:** Selected **Supabase** for its real-time capabilities, PostgreSQL power, and seamless Edge Function support.
- **Design System:** Developed a "Mission Control" aesthetic—dark theme, neon accents (#4ade80), and cinematic gradients inspired by high-end motion design.

## 📱 Phase 2: Core Mobile & Cloud AI
**Goal:** Build the primary user interface and intelligence layer.
- **Local Database:** Integrated **WatermelonDB** for the mobile app to ensure offline-first capability with high-performance synchronization to Supabase.
- **Cloud AI Integration:** Pivoted from local ONNX models to **Hugging Face Inference API**. This allowed for superior accuracy in plant identification and disease diagnosis without bloating the mobile bundle.
- **Authentication:** Implemented secure Supabase Auth with custom `AuthProvider` for cross-platform session management.

## 🧠 Phase 3: Smart Guidance Engine (AR)
**Goal:** Bridge the physical and digital garden.
- **AR Guidance:** Developed the `ARGuideScreen` using `expo-camera` and `react-native-svg`.
- **Feature Set:**
    - **Visual Pruning:** Overlaid holographic cut-lines and instructional nodes on the camera feed.
    - **Spatial Measurement:** Created a virtual caliper system to measure plant growth in centimeters.
- **Smart Logic:** Built a notification engine that uses local weather data (OpenWeather API) to adjust watering reminders dynamically.

## 🌐 Phase 4: Community, IoT & Marketplace
**Goal:** Expand the platform into a connected ecosystem.
- **IoT Telemetry:** Built a real-time hardware telemetry pipeline.
    - **Hardware Simulation:** Created a Node.js simulator to broadcast soil moisture, light, and temperature data to Supabase via Edge Functions.
- **Marketplace:** Integrated **Stripe** for secure transactions, allowing users to buy seeds and tools directly within the "Mission Control" dashboard.
- **Social Feed:** Implemented a global "Garden Feed" with image uploads to Supabase Storage and real-time social interactions.

## 💎 Phase 5: Expansion, Polish & Deployment
**Goal:** Optimize for production and global scale.
- **Advanced Insights:** Integrated `react-native-chart-kit` to visualize historical telemetry data, allowing users to track growth velocity over time.
- **Localization (i18n):** Implemented a full multi-language framework (`i18next`) supporting English and French, with automatic system language detection.
- **Performance Audit:** 
    - Memoized the AR rendering tree to maintain high frame rates during sensor-heavy operations.
    - Optimized the Dashboard with `React.memo` to handle high-frequency IoT updates smoothly.
- **Deployment Readiness:** 
    - Audited all environment variables for security.
    - Initialized a **GitHub Actions CI/CD pipeline** for automated testing and deployment.

---

## 🛠️ Technical Stack Summary
- **Frontend:** React Native (Expo), Next.js, Tailwind CSS, Framer Motion.
- **Mobile Native:** Reanimated, Expo Sensors, SVG, WatermelonDB.
- **Backend/API:** Supabase (Auth, DB, Storage, Realtime, Edge Functions).
- **AI/ML:** Hugging Face (Vision & LLM), OpenWeather API.
- **Payments:** Stripe API.

---

## 🏁 Final Status: MISSION COMPLETE
GroSphere has evolved from a conceptual architecture into a robust, high-performance platform ready to revolutionize how urban gardeners interact with their plants.

**Project Delivered: May 20, 2026**
