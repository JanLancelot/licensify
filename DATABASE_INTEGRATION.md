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

### A. SQLite Schema Expansion
* **[`src/db/schema.ts`](file:///c:/Users/Adrian/Desktop/Folders/websites/archiapp/react-native-repo/src/db/schema.ts)**
  * Added `branches` and `lessons` schemas to support the structured curriculum.
  * Added foreign keys (`branch_id`, `lesson_id`) to the `materials`, `flashcards`, `questions`, and `quizzes` schemas.
  * Configured `sync_status` columns on transactional tables (`quiz_attempts`, `quiz_answers`) to tracking synchronization state.

### B. High-Performance Sync Engine
* **[`convex/sync.ts`](file:///c:/Users/Adrian/Desktop/Folders/websites/archiapp/react-native-repo/convex/sync.ts)**
  * `getSyncBundle`: Single-roundtrip bulk query that fetches all published curriculum data atomically.
  * Server-side SHA-256 choice hashing via Web Crypto API (fast + secure).
  * Delta sync support with `sinceTimestamp` (<50ms when database is unchanged).
  * `syncAttemptsBatch`: Single atomic mutation to sync multiple offline quiz attempts and answers.
* **[`src/services/useSyncService.ts`](file:///c:/Users/Adrian/Desktop/Folders/websites/archiapp/react-native-repo/src/services/useSyncService.ts)**
  * Integrated chunked SQLite batch inserts (`drizzle-orm`) replacing slow row-by-row loops.
  * Manages `lastSyncedAt` in SQLite `sync_metadata` table.
* **[`src/components/SyncProvider.tsx`](file:///c:/Users/Adrian/Desktop/Folders/websites/archiapp/react-native-repo/src/components/SyncProvider.tsx)**
  * Listens to network connectivity state (`expo-network`).
  * Debounced down-sync and up-sync execution on application mount and foreground events.

### C. SQLite Web Client Mock
* **[`src/db/client.web.ts`](file:///c:/Users/Adrian/Desktop/Folders/websites/archiapp/react-native-repo/src/db/client.web.ts)**
  * Provides an in-memory SQL mock fallback so developers can run, test, and debug the app inside a web browser without breaking on native SQLite bindings.

### D. Developer Sync Tool Screen
* **[`src/components/DebugSQLite.tsx`](file:///c:/Users/Adrian/Desktop/Folders/websites/archiapp/react-native-repo/src/components/DebugSQLite.tsx)**
  * A diagnostic UI panel featuring:
    * **Wipe Local Cache**: Wipes all tables locally to resolve duplicates or orphaned database artifacts.
    * **Synchronize Database**: Triggers manual down-sync and up-sync with Convex to instantly populate a clean state.

---

## 3. What Was Changed (Integrated)

### A. Reactive Data Layer
* **[`src/hooks/useLocalData.ts`](file:///c:/Users/Adrian/Desktop/Folders/websites/archiapp/react-native-repo/src/hooks/useLocalData.ts)**
  * Modified to read exclusively from live database tables (falling back to empty lists, which get filled via sync, rather than resorting to mock seeds).
  * Implemented zero-trust local grading: computes user answer selection hashes (`SHA-256`) on-device and logs graded results directly to the local database, triggering a background sync sequence.

### B. Frontend Screens
All screens have been completely detached from static imports and bound to live database hooks:
1. **Learn Notes Hub (`learn/notes/index.tsx`)**: Bound to `useLocalHierarchy()` showing real lessons and topics.
2. **Flashcards Hub & Builder (`learn/flashcards/index.tsx`)**: Custom presets dynamically compile database flashcards.
3. **Practice Launcher & Quiz (`practice/index.tsx`, `practice/quiz.tsx`)**: Loads database question items and computes cryptographic SHA-256 checks.
4. **Exams Details & Session (`exams/details.tsx`, `exams/session.tsx`)**: Synchronized time limit counters, exam question reviews, and detailed correct/incorrect breakdowns.
5. **Dashboard (`index.tsx`)**: Greets the user with live Convex profile names (`getCurrentUserProfile`) and displays computed statistics.
6. **Profile (`profile.tsx`)**: Bound profile editing to Convex profile mutation and triggers manual backup syncing.

---

## 4. What Was Deprecated (Cleared)

To enforce strict reliance on the database, the static mock files have been deprecated and emptied:
* **[`src/data/curriculum.ts`](file:///c:/Users/Adrian/Desktop/Folders/websites/archiapp/react-native-repo/src/data/curriculum.ts)** (Deprecated, exports empty arrays).
* **[`src/data/quiz-questions.ts`](file:///c:/Users/Adrian/Desktop/Folders/websites/archiapp/react-native-repo/src/data/quiz-questions.ts)** (Deprecated, exports empty arrays).
* **[`src/db/seed.ts`](file:///c:/Users/Adrian/Desktop/Folders/websites/archiapp/react-native-repo/src/db/seed.ts)** (No-op seed function, database is populated purely via synchronization).
