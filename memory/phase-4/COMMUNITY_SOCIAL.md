# Phase 4: Community & Social Ecosystem

## Architecture
The Community & Social features transform GroSphere into a collaborative platform where urban gardeners can share progress, follow others, and earn achievements.

### 1. Database Schema Expansion
We evolved the Supabase schema (Migration `20260520000002_community_social.sql`) to support social interactions:
- **`follows`:** Tracks unidirectional user relationships.
- **`social_posts`:** Allows users to share content (text/images) linked to their plant specimens.
- **`post_likes`:** Simple engagement tracking.
- **`badges` & `user_badges`:** Foundation for the gamification system.
- **`profiles`:** Enhanced with `avatar_url` and `bio`.

### 2. Global Feed & Post Creation
- **Global Feed:** Introduced a new tab in the mobile application (`CommunityScreen.tsx`) that provides a real-time feed of all garden transmissions via Supabase Realtime.
- **Post Creation:** Developed `CreatePostScreen.tsx` allowing users to compose transmissions, select/capture photos (`expo-image-picker`), and broadcast them to the community.
- **Media Ingrastructure:** Integrated Supabase Storage (`user-uploads` bucket) for hosting social media assets.
- **Neural Link Aesthetic:** Visual design consistent with "Mission Control," using neon accents and dark glassmorphic cards.
- **Interactive Feed:** Implemented optimistic "Like" functionality with real-time synchronized counts and automated user notifications.

### 3. Notification Center (System Alerts)
Implemented a centralized hub for social and system events:
- **Realtime Alerts:** Subscribes to the `notifications` table via Supabase Realtime for instant user feedback.
- **Automated Triggers:** PostgreSQL functions automatically generate notifications when users receive new followers or likes on their transmissions.
- **Dynamic Icons:** Differentiates between interaction types (Hearts for likes, UserPlus for follows, Awards for achievements) using a cinematic visual language.
- **Deep Linking Ready:** Data architecture supports future deep linking directly to posts or user profiles from the alerts.

### 4. Gardener Network Directory
Introduced a user discovery system to build horticultural networks:
- **Neural Search:** Developed `NetworkScreen.tsx` with a debounced search interface for finding other gardeners by username.
- **Link Interaction:** Implemented a unified "Link/Unlink" (Follow/Unfollow) system with optimistic UI updates for instant feedback.
- **Mutual Connection Check:** Efficient Supabase queries check follow-state during search results generation.
- **Profile Integration:** Linked the network directory to the "Community Network" hub in the user profile.

### 5. Automated Achievement Engine
Implemented a gamification backend to reward user engagement:
- **Milestone Tracking:** PostgreSQL triggers automatically monitor user actions (Posts, Follows, IoT links) and award relevant badges.
- **Initial Badge Set:** 
    - *First Transmission:* Awarded on the first social post.
    - *Neural Link Established:* Awarded on the first follower connection.
    - *Community Pioneer:* Awarded for establishing 5+ garden connections.
    - *High-Tech Gardener:* Awarded when the first IoT telemetry signal is received.
- **Instant Recognition:** Badge awards trigger a system notification, providing immediate feedback to the user.
- **Persistence:** Earned badges are stored in the `user_badges` table and displayed on the cinematic profile dashboard.

### 6. Profile Enhancements
Upgraded the `ProfileScreen.tsx` to serve as a social hub:
- **Social Telemetry:** Real-time counters for Followers and Following.
- **Achievement Grid:** Visual display of earned badges (unlocked via the gamification system).
- **Network Access:** New menu items for managing the user's community network.

## Next Steps for Social
1.  **Post Creation UI:** Implement a modal to allow users to capture garden photos and share them to the feed.
2.  **Notification Center:** Deepen the notification system to alert users of new followers or post interactions.
3.  **Badge Logic:** Implement Edge Functions to automatically award badges based on milestones (e.g., "First IoT Link", "Healthy Garden for 30 Days").
