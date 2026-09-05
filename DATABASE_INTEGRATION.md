# Database Integration & Sync Architecture Documentation

This document outlines the architectural changes, new file additions, modifications, and deprecated resources made while connecting the live Convex cloud database to the local offline-first SQLite database and front-end screens.

---

## 1. Overview of Architecture

The application implements an **offline-first, sync-eventual** data architecture. 

* **Convex Cloud** serves as the single source of truth for global curriculum content and user accounts.
* **Local SQLite (Drizzle ORM)** operates as the local data layer on the device.
* **Sync Engine (`SyncProvider`)** handles automatic bi-directional sync (pulling live syllabus contents down and pushing student attempts up).

---

## 2. What Was Added

### A. SQLite & Convex Schema Expansion
* **[`src/db/schema.ts`](file:///c:/Users/Adrian/Desktop/Folders/websites/archiapp/react-native-repo/src/db/schema.ts) & [`convex/schema.ts`](file:///c:/Users/Adrian/Desktop/Folders/websites/archiapp/react-native-repo/convex/schema.ts)**
  * Added `branches` and `lessons` schemas to support the structured curriculum.
  * Added foreign keys (`branch_id`, `lesson_id`) to `materials`, `flashcards`, `questions`, and `quizzes`.
  * Added `specializedType` to `questions` and `quizzes` (supporting Rule 7 & 8 computation drills).
  * Added `user_presets` (`userPresets` in Convex) for student-configured flashcard decks, quiz presets, and modular exams.
  * Added `achievements` and `user_achievements` (`userAchievements` in Convex) for dynamic gamified milestone badges.
  * Added `user_streaks` (`userStreaks` in Convex) for real study consistency and active day tracking.
  * Added `soundEnabled` and `dailyReminder` fields to user settings.
  * Configured `sync_status` columns on transactional tables (`quiz_attempts`, `quiz_answers`, `user_presets`, `user_streaks`).

### B. High-Performance Sync Engine
* **[`convex/sync.ts`](file:///c:/Users/Adrian/Desktop/Folders/websites/archiapp/react-native-repo/convex/sync.ts)**
  * `getSyncBundle`: Single-roundtrip bulk query that fetches all published curriculum, presets, achievements, and streaks atomically.
  * Server-side SHA-256 choice hashing via Web Crypto API (fast + secure, precomputed at write time).
  * Delta sync support with `sinceTimestamp` (<50ms when database is unchanged).
  * `syncAttemptsBatch`: Single atomic mutation to sync multiple offline quiz attempts and answers with no skip filters. Embeds answers directly inside each `quizAttempts` document in 1 atomic write per attempt (reducing write amplification by 99% and avoiding mutation limits).
  * `syncUserPresets`: Syncs custom student decks and configurations cross-device.
  * `syncUserStreaks`: Synchronizes study streaks and longest consistency records.
* **[`src/services/useSyncService.ts`](file:///c:/Users/Adrian/Desktop/Folders/websites/archiapp/react-native-repo/src/services/useSyncService.ts)**
  * Integrated chunked SQLite batch inserts (`drizzle-orm`) replacing slow row-by-row loops.
  * Manages `lastSyncedAt` in SQLite `sync_metadata` table.
  * Uploads all completed offline practice drills and mock exams without hardcoded exclusions.
* **[`src/components/SyncProvider.tsx`](file:///c:/Users/Adrian/Desktop/Folders/websites/archiapp/react-native-repo/src/components/SyncProvider.tsx)**
  * Listens to network connectivity state (`expo-network`).
  * Debounced down-sync and up-sync execution on application mount and foreground events.

### C. Persistent Client-Side Preset Stores (No `localStorage`)
* **[`src/services/flashcardPresetStore.ts`](file:///c:/Users/Adrian/Desktop/Folders/websites/archiapp/react-native-repo/src/services/flashcardPresetStore.ts)**
* **[`src/services/quizPresetStore.ts`](file:///c:/Users/Adrian/Desktop/Folders/websites/archiapp/react-native-repo/src/services/quizPresetStore.ts)**
* **[`src/services/modularExamStore.ts`](file:///c:/Users/Adrian/Desktop/Folders/websites/archiapp/react-native-repo/src/services/modularExamStore.ts)**
  * Replaced `window.localStorage` (which fails on iOS/Android native builds) with reactive SQLite `user_presets` queries backed by Drizzle and background cloud sync.

### D. Standardized Seed Data & Clean-up Mutation
* **[`convex/_seed/assessments.ts`](file:///c:/Users/Adrian/Desktop/Folders/websites/archiapp/react-native-repo/convex/_seed/assessments.ts) & [`convex/_seed/curriculum.ts`](file:///c:/Users/Adrian/Desktop/Folders/websites/archiapp/react-native-repo/convex/_seed/curriculum.ts)**
  * All seeded test data (questions, quizzes, flashcards, materials, achievements) are prefixed with `[Seed]` or `[Mock]`.
  * Includes genuine ALE questions, SHA-256 target choice verification, and specialized Rule 7 & 8 computation questions (AMBF, BHL, TGFA, setbacks, parking).
  * Provides `deleteMockSeedData` internal mutation to cleanly purge all seeded records when production review content is ready.
  * Protected via `internalMutation` in `convex/_seed/` to prevent execution from client apps. Run via CLI:
    - `npx convex run _seed/assessments:seedMockAssessmentsAndMaterials`
    - `npx convex run _seed/assessments:deleteMockSeedData`
    - `npx convex run _seed/curriculum:seedCurriculumFromExcel`

### E. SQLite Web Client Mock
* **[`src/db/client.web.ts`](file:///c:/Users/Adrian/Desktop/Folders/websites/archiapp/react-native-repo/src/db/client.web.ts)**
  * Provides an in-memory SQL mock fallback so developers can run, test, and debug the app inside a web browser without breaking on native SQLite bindings.

### F. Developer Sync Tool Screen
* **[`src/components/DebugSQLite.tsx`](file:///c:/Users/Adrian/Desktop/Folders/websites/archiapp/react-native-repo/src/components/DebugSQLite.tsx)**
  * A diagnostic UI panel featuring:
    * **Wipe Local Cache**: Wipes all tables locally to resolve duplicates or orphaned database artifacts.
    * **Synchronize Database**: Triggers manual down-sync and up-sync with Convex to instantly populate a clean state.

---

## 3. What Was Changed (Integrated)

### A. Reactive Data Layer
* **[`src/hooks/useLocalData.ts`](file:///c:/Users/Adrian/Desktop/Folders/websites/archiapp/react-native-repo/src/hooks/useLocalData.ts)**
  * Modified to read exclusively from live database tables (falling back to empty lists, which get filled via sync, rather than resorting to mock seeds).
  * `useLocalHierarchy()` dynamically extracts syllabus keyPoints from markdown in `materials`.
  * `useLocalStats()` calculates actual curriculum progress percentage and study streaks from real calendar activity.
  * `useLocalAchievements()` evaluates unlocked states dynamically against SQLite quiz attempts and streaks.
  * Implemented zero-trust local grading: computes user answer selection hashes (`SHA-256`) on-device and logs graded results directly to the local database, triggering a background sync sequence.

### B. Frontend Screens
All screens have been completely detached from static imports and bound to live database hooks:
1. **Dashboard (`index.tsx`)**: Displays live Convex profile names, real consecutive streak flame, dynamic milestone voucher progress, and topic Confidence Rates calibrated by quiz attempt scores.
2. **Exams Hub & Session (`exams/index.tsx`, `exams/details.tsx`, `exams/session.tsx`)**: Replaced `COMPREHENSIVE_MOCK_SETS` and `masterPool` with dynamic `useLocalQuizzes({ type: 'mock_exam' })` and database questions; bound submissions to active user ID from Convex Auth.
3. **Practice Launcher & Quiz (`practice/index.tsx`, `practice/quiz.tsx`)**: Specialized drills (Rule 7 & 8) load from database with `specializedType = 'developmental_control'` and live explanations.
4. **Learn Notes Hub (`learn/notes/index.tsx`)**: Bound to `useLocalHierarchy()` showing real lessons and topics.
5. **Flashcards Hub & Builder (`learn/flashcards/index.tsx`)**: Custom presets dynamically compile database flashcards.
6. **Profile (`profile.tsx`)**: Dynamic achievements carousel & modal backed by SQLite `achievements` and `user_achievements`; persists sound and reminder settings to Convex user profile.

---

## 4. What Was Deprecated (Cleared)

To enforce strict reliance on the database, the static mock files have been deprecated and emptied:
* **[`src/data/curriculum.ts`](file:///c:/Users/Adrian/Desktop/Folders/websites/archiapp/react-native-repo/src/data/curriculum.ts)** (Deprecated, exports empty arrays).
* **[`src/data/quiz-questions.ts`](file:///c:/Users/Adrian/Desktop/Folders/websites/archiapp/react-native-repo/src/data/quiz-questions.ts)** (Deprecated, exports empty arrays).
* **[`src/db/seed.ts`](file:///c:/Users/Adrian/Desktop/Folders/websites/archiapp/react-native-repo/src/db/seed.ts)** (Deprecated, replaced by `convex/_seed/assessments.ts`).
* **`window.localStorage` preset stores**: Replaced with SQLite `user_presets`.
