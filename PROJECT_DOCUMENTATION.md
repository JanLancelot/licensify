# Licensify - ALE Reviewer Application 🏗️

Welcome to the **Licensify** documentation! Licensify is an offline-first, mobile Architectural Licensure Examination (ALE) Reviewer application built with React Native (Expo) and a robust sync-engine powered by Convex and SQLite.

---

## 📑 Table of Contents
1. [Overview](#1-overview)
2. [Technology Stack](#2-technology-stack)
3. [System Architecture](#3-system-architecture)
4. [Core Features & Screens](#4-core-features--screens)
5. [Database Schema](#5-database-schema)
6. [Data Synchronization Strategy](#6-data-synchronization-strategy)
7. [Development & Testing](#7-development--testing)

---

## 1. Overview
Licensify aims to provide aspiring architects with a seamless studying experience. It features curriculum tracking, flashcards, and configurable practice quizzes. Its defining architectural trait is its **Offline-First Zero-Trust** capability, allowing users to study on the go without an internet connection, while securely syncing progress to the cloud when online.

---

## 2. Technology Stack
- **Frontend / Mobile Framework:** Expo (React Native), Expo Router
- **Local Database:** `expo-sqlite`
- **ORM:** Drizzle ORM
- **Cloud Backend & Sync:** Convex
- **Styling:** Custom Theme Context (`useAppTheme`), Lucide React Native (Icons)
- **Security:** `expo-crypto` (Zero-trust local answer verification)

---

## 3. System Architecture
Licensify uses a **Local-First Data Flow**:
1. **Cloud Truth (Convex):** The central repository for all curriculum data (subjects, topics, questions) and global user data.
2. **Local Cache (SQLite):** All curriculum data is synchronized down to the local device. The UI **only** reads from the local SQLite database.
3. **Local Mutations:** When a user completes a quiz, the attempt is scored locally using cryptographic hashes (to prevent local cheating) and saved to SQLite with a `pending_sync` status.
4. **Background Sync:** The `SyncProvider` continuously listens for network connectivity. When online, it pushes `pending_sync` attempts up to Convex and pulls down any new curriculum updates.

---

## 4. Core Features & Screens

### 📊 Dashboard (`/app/(tabs)/index.tsx`)
- **Live Streak & Milestone:** Flame card bound to real consecutive study days; milestone voucher unlock progress bar.
- **Confidence Rate:** Dynamically calculates topic confidence from student quiz attempt scores and lesson completion.
- **Continue Learning:** Pulls active curriculum progress directly from SQLite `lessonProgress`.

### 📚 Learn / Curriculum (`/app/(tabs)/learn`)
- **Study Notes:** 3-tier hierarchy (Subjects, Topics, Lessons) loaded from SQLite with markdown bullet points from `materials`.
- **Flashcards:** Custom and lesson-linked flashcard decks with persistent user configurations.

### 🎮 Practice Arena (`/app/(tabs)/practice`)
- **Configurable Quiz Launcher:** Custom item count, timer, and syllabus topic filters.
- **Specialized Drills:** NBCP Rule 7 & 8 Developmental Control drills (`specializedType = 'developmental_control'`).

### 🏛️ Exams Hub (`/app/(tabs)/exams`)
- **Comprehensive Mock Sets:** 100, 150, and 200-item mock exam simulations with timer countdowns and offline cryptographic answer verification.

### 👤 Profile & Settings (`/app/(tabs)/profile.tsx`)
- **Achievements:** Gamified achievement carousel and modal evaluating live criteria (perfect scores, streak days, drills completed).
- **Settings Persistence:** Sound and daily reminder switches persisted to Convex profile and local state.
- **Cloud Backup & Sync:** Manual sync trigger with live status indicators.

---

## 5. Database Schema
The schema is defined in Drizzle (`src/db/schema.ts`) and mirrored in Convex (`convex/schema.ts`):

- **Curriculum Tables:**
  - `subjects`: Core domains (e.g., History, Building Utilities).
  - `branches`: Sub-branches of subjects.
  - `topics`: Sub-sections of subjects.
  - `lessons`: Individual study modules.
  - `materials`: Detailed study notes and markdown articles.
  - `flashcards`: Front/Back active recall cards.
- **Assessment Tables:**
  - `questions`: Individual quiz questions with multiple choices and `specializedType`. Stores precomputed write-time `correctChoiceHash` for instant verification without exposing plaintext answer keys.
  - `quizzes`: Curated sets of questions (Mock Exams, Specialized Drills) indexed by published status and type.
- **User Activity & Gamification Tables:**
  - `quizAttempts`: Logs of user quiz sessions and scores with embedded `answers` array for atomic 1-write submissions and O(1) single-document reads.
  - `quizAnswers`: Preserved for legacy records and indexed via composite `["attemptId", "questionId"]`.
  - `userPresets`: Student-configured custom decks and quiz presets (replaces `localStorage`).
  - `achievements` & `userAchievements`: Badges catalog and unlocked student records.
  - `userStreaks`: Consecutive study days and longest streak records.

---

## 6. Data Synchronization Strategy

### Down-Sync (Cloud ➔ Device - High-Performance Bulk & Delta Sync)
Handled by `syncDown` in `useSyncService.ts` via `api.sync.getSyncBundle`:
1. **Single-Roundtrip Bundle (`api.sync.getSyncBundle`)**: Convex atomically collects all published `subjects`, `branches`, `topics`, `lessons`, `materials`, `flashcards`, `questions`, `quizzes`, `userPresets`, `achievements`, and `userStreaks`.
2. **Precomputed SHA-256 Hashing**: Answer choice hashes are precomputed and stored on the Convex backend on question write, eliminating runtime CPU loops during sync bundles.
3. **Delta Syncing**: Uses `lastSyncedAt` timestamps from SQLite `sync_metadata`. If no cloud updates have occurred, sync completes in `<50ms` (`upToDate: true`).
4. **Chunked SQLite Batch Ingestion**: Uses `drizzle-orm` chunked batch inserts (`db.insert().values(chunk).onConflictDoUpdate()`).

### Up-Sync (Device ➔ Cloud - Single Batch Mutation)
Handled by `syncUp` in `useSyncService.ts` via `api.sync.syncAttemptsBatch`, `api.sync.syncUserPresets`, and `api.sync.syncUserStreaks`:
1. Scans local SQLite for pending attempts, custom presets, and streak updates.
2. Uploads all completed offline practice drills and mock exams without skip filters.
3. Convex authoritatively grades the attempts, records the server attempts with embedded answers in a single write per attempt (reducing write amplification by 99%), and returns synced IDs.
4. Upon success, updates local `sync_status` to `'synced'` in SQLite.

### Automatic Sync Lifecycle & Debouncing (`src/components/SyncProvider.tsx`)
- Triggers on initial app mount and whenever the app transitions to the foreground (`AppState === 'active'`).
- Integrated 3-second debouncing to prevent redundant concurrent sync executions.

### Cryptographic Answer Verification
To allow offline grading without exposing correct answers in the local database, Licensify uses **Zero-Trust Hashing**:
- The backend stores the `SHA-256` hash of `questionId + correctChoiceId`.
- When the user selects an answer offline, the app hashes the selection and compares it against the stored hash to calculate the local score.
- The raw answers are sent to Convex during sync for authoritative server-side grading.

---

## 7. Development & Testing

### Running the Mobile App
```bash
# Start the Expo bundler
npx expo start
```

### Running the Admin Dashboard
```bash
cd admin
npm run dev
```

### Managing the Backend (Convex)
```bash
# Run Convex development server
npx convex dev

# Seed Curriculum from Excel (CLI / Internal Mutation)
npx convex run _seed/curriculum:seedCurriculumFromExcel

# Seed Mock Assessments, Questions & Achievements
npx convex run _seed/assessments:seedMockAssessmentsAndMaterials

# Clean-up / Purge Seed Data when ready for production
npx convex run _seed/assessments:deleteMockSeedData

# Promote User to Admin
npx convex run _seed/curriculum:promoteUserToAdmin '{"email": "your_email@example.com"}'
```

### Testing Offline Mode
1. Start the app with network connectivity and wait for initial sync.
2. Disable Wi-Fi/Data on the emulator or physical device.
3. Complete a practice quiz.
4. Check the **Profile -> Database Debugger** to see the attempt stored locally.
5. Re-enable network connectivity. The `SyncProvider` will automatically detect the connection and push the attempt to Convex.
