# Smart Guidance Engine

## Overview
The Smart Guidance Engine is a local, client-side recommendation system that adapts gardening tasks (like watering schedules) based on real-time local weather conditions.

## Architecture
- **Location:** Uses `expo-location` to retrieve the device's latitude and longitude.
- **Weather Provider:** Integrates with the free [Open-Meteo API](https://open-meteo.com/) for current weather and daily precipitation forecasts.
- **Notification Engine:** Utilizes `expo-notifications` for scheduling local reminders without relying on a centralized push server.

## Logic Flow
1. **Weather Fetching (`src/hooks/useWeather.ts`):** 
   - Retrieves location on app launch.
   - Fetches temperature and precipitation data.
   - Determines a boolean `isRainy` state (currently configured to trigger if daily precipitation > 5mm).
2. **Notification Scheduling (`src/lib/notifications.ts`):**
   - Automatically iterates through all active specimens in the local WatermelonDB (`user_gardens`).
   - If `isRainy` is false, it schedules a local push notification reminding the user to water the plant the following morning.
   - If `isRainy` is true, the scheduling is skipped, preventing over-watering and reducing user notification fatigue.
3. **UI Integration (`DashboardScreen.tsx`):**
   - The "Gardening Copilot" card reacts dynamically to the weather state, updating its icon (Sun/Rain) and displaying context-aware advice to the user.

## Future Enhancements
- Fine-tune precipitation thresholds per plant species (e.g., succulents vs. tomatoes).
- Add seasonal task reminders (e.g., "Time to prune your tomatoes").
- Integrate temperature alerts (e.g., frost warnings).
