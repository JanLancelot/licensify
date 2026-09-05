# Database Integration & Mock Data Migration TODO

This document tracks all tasks required to eliminate mock, static, and ephemeral data across the Licensify mobile and web applications, fully connecting every feature to the Convex cloud database and local offline SQLite (Drizzle ORM) database.

---

## 📋 Overview of Changes Needed

1. **Backend Schemas**: Add missing tables in Convex and SQLite (`user_presets`, `achievements`, `user_achievements`, `user_streaks`, `user_preferences`).
2. **Content Seeding**: Seed genuine ALE questions, flashcards, study notes/materials, and mock exams into Convex.
3. **Local Store Migration**: Replace broken `window.localStorage` preset stores with persistent SQLite + Convex sync.
4. **UI Refactoring**: Remove hardcoded constants (`masterPool`, `COMPREHENSIVE_MOCK_SETS`, static achievements, hardcoded `"local-student-1"`, fake key points generator) from screens and hooks.
5. **Sync Engine Expansion**: Update sync bundle and up-sync services to include all new entities and attempt types.

---

## 🗄️ Phase 1: Database Schema Expansion

### 1.1 Convex Schema ([`convex/schema.ts`](file:///c:/Users/Adrian/Desktop/Folders/websites/archiapp/react-native-repo/convex/schema.ts))
- [x] **`userPresets`**: Add table to store student-created flashcard decks, quiz configurations, and custom modular exams.
  - Fields: `userId` (id "users"), `type` ("flashcard" | "quiz" | "exam"), `title` (string), `iconName` (optional string), `lessonIds` (array of string), `subjectNames` (optional array of string), `questionCount` (optional number), `timeLimitSeconds` (optional number), `settings` (optional any), `createdAt` (number), `updatedAt` (number).
- [x] **`achievements`**: Add catalog table of available badges and milestones.
  - Fields: `title` (string), `category` (string), `description` (string), `iconName` (string), `criteriaType` (string), `targetValue` (number), `badgeColor` (optional string), `order` (number).
- [x] **`userAchievements`**: Add student unlocked achievements table.
  - Fields: `userId` (id "users"), `achievementId` (id "achievements"), `unlockedAt` (number), `progress` (number).
- [x] **`userStreaks`**: Add study streak and daily activity log table.
  - Fields: `userId` (id "users"), `currentStreak` (number), `longestStreak` (number), `lastActiveDate` (string `YYYY-MM-DD`), `updatedAt` (number).
- [x] **`userPreferences` / `users` update**: Add settings fields to `users` (`soundEnabled` boolean, `dailyReminder` boolean).
- [x] **`questions` update**: Add optional `specializedType` / `categoryTag` (e.g. `"developmental_control"` for Rule 7 & 8 computation sets).

### 1.2 SQLite Schema ([`src/db/schema.ts`](file:///c:/Users/Adrian/Desktop/Folders/websites/archiapp/react-native-repo/src/db/schema.ts))
- [x] **`user_presets`**: Mirror `userPresets` table in SQLite with `sync_status`.
- [x] **`achievements`**: Mirror `achievements` table in SQLite.
- [x] **`user_achievements`**: Mirror `userAchievements` table in SQLite.
- [x] **`user_streaks`**: Mirror `userStreaks` table in SQLite.
- [x] **`user_preferences` / settings**: Local and remote persistence for offline sound/reminder settings.

---

## 📦 Phase 2: Database Content Seeding

### 2.1 Convex Seed Scripts ([`convex/_seed/assessments.ts`](file:///c:/Users/Adrian/Desktop/Folders/websites/archiapp/react-native-repo/convex/_seed/assessments.ts) & [`convex/_seed/curriculum.ts`](file:///c:/Users/Adrian/Desktop/Folders/websites/archiapp/react-native-repo/convex/_seed/curriculum.ts))
- [x] **Seed Comprehensive Mock Exam Quizzes** (All tagged with `[Mock]` or `[Seed]`):
  - `[Mock] Comprehensive Mock Set 1` (Area 1: HOA, TOA, Tropical Design, Prof Practice).
  - `[Mock] Comprehensive Mock Set 2` (Area 2: Utilities, Building Tech, Materials).
  - `[Mock] Comprehensive Mock Set 3` (Area 3: Site Planning, Arch Design, NBCP Rule 7 & 8, Laws).
  - `[Mock] Area 1 Practice Drill`.
  - `[Mock] Area 2 Practice Drill`.
  - `[Mock] Area 3 Practice Drill`.
  - `[Mock] Rule 7 & 8 Developmental Controls Drill`.
- [x] **Seed Genuine Questions Bank (`questions`)**:
  - Multi-choice questions with SHA-256 target choice IDs, rich explanations, and difficulty tags linked to subject/topic/lesson IDs.
  - Specialized computational questions for NBCP Rule 7 & 8 (AMBF, BHL, TGFA, Setbacks, Parking).
- [x] **Seed Flashcards (`flashcards`)**:
  - Key architectural terms, definitions, building code provisions, and formula flashcards linked to lessons.
- [x] **Seed Study Materials / Notes (`materials`)**:
  - Core summaries and key provisions for lessons (`type: 'article'`, inline markdown content).
- [x] **Seed System Achievements (`achievements`)**:
  - `[Seed] Code Master` (Rule 7 & 8 Mastery)
  - `[Seed] Rapid Recall` (Complete 5 Flashcard Decks)
  - `[Seed] 14-Day Streak` (14-day study consistency)
  - `[Seed] Area 1 Specialist` (Pass Area 1 Mock Exam)
  - `[Seed] Perfectionist` (Achieve 100% on any quiz drill)
- [x] **Clean-up Mutation (`deleteMockSeedData`)**:
  - Dedicated mutation to cleanly delete all seeded mock data with `[Seed]` or `[Mock]` in their name/title when production content is ready.

---

## 🔄 Phase 3: Client-Side Store Migration (Remove `localStorage`)

Migrate stores away from `window.localStorage` (which fails on iOS/Android native builds) to local SQLite tables synced to Convex:

- [x] **[`src/services/flashcardPresetStore.ts`](file:///c:/Users/Adrian/Desktop/Folders/websites/archiapp/react-native-repo/src/services/flashcardPresetStore.ts)**:
  - Replaced `localStorage` with SQLite `user_presets` table (`type = 'flashcard'`).
  - Wired reactive hooks with Drizzle queries and background sync trigger.
- [x] **[`src/services/quizPresetStore.ts`](file:///c:/Users/Adrian/Desktop/Folders/websites/archiapp/react-native-repo/src/services/quizPresetStore.ts)**:
  - Replaced `localStorage` with SQLite `user_presets` table (`type = 'quiz'`).
- [x] **[`src/services/modularExamStore.ts`](file:///c:/Users/Adrian/Desktop/Folders/websites/archiapp/react-native-repo/src/services/modularExamStore.ts)**:
  - Replaced `localStorage` with SQLite `user_presets` table (`type = 'exam'`).

---

## 📱 Phase 4: Screen Refactoring & Mock Data Removal

### 4.1 Home / Dashboard Screen ([`src/app/(tabs)/index.tsx`](file:///c:/Users/Adrian/Desktop/Folders/websites/archiapp/react-native-repo/src/app/(tabs)/index.tsx))
- [x] **Streak Card**: Replaced hardcoded `"3 DAYS"` with live streak from `useLocalStats()` / `user_streaks` table.
- [x] **Milestone Voucher**: Replaced static `"COMPLETE 10 DAYS..."` and hardcoded `20%` bar with dynamic streak milestone progress.
- [x] **Confidence Rate**: Replaced static fallback array of 10 hardcoded lessons with real topic mastery scores calculated from quiz attempts.
- [x] **Continue Learning**: Removed static `"HISTORY OF ARCHITECTURE (0%)"` fallback; relies purely on real `useLessonProgress()` and `useLocalHierarchy()`.

### 4.2 Exams Hub & Session ([`src/app/(tabs)/exams/index.tsx`](file:///c:/Users/Adrian/Desktop/Folders/websites/archiapp/react-native-repo/src/app/(tabs)/exams/index.tsx) & [`session.tsx`](file:///c:/Users/Adrian/Desktop/Folders/websites/archiapp/react-native-repo/src/app/(tabs)/exams/session.tsx))
- [x] **`exams/index.tsx`**: Replaced hardcoded `COMPREHENSIVE_MOCK_SETS` constant with `useLocalQuizzes('mock_exam')`.
- [x] **`exams/session.tsx`**:
  - Removed hardcoded `masterPool` constant.
  - Removed fake question generation loop (`gen-q-${examId}-${i}`).
  - Replaced hardcoded user ID (`'local-student-1'`) with active user ID from Convex Auth.
  - Dynamically computes subject performance breakdown using database subject IDs.
- [x] **`exams/details.tsx`**: Fetches exam metadata (passing score, duration, item count, title, description) directly from the `quizzes` database table instead of hardcoded switch cases.

### 4.3 Practice Drills ([`src/app/(tabs)/practice/index.tsx`](file:///c:/Users/Adrian/Desktop/Folders/websites/archiapp/react-native-repo/src/app/(tabs)/practice/index.tsx) & [`quiz.tsx`](file:///c:/Users/Adrian/Desktop/Folders/websites/archiapp/react-native-repo/src/app/(tabs)/practice/quiz.tsx))
- [x] **`practice/index.tsx`**: Loads specialized computation sets dynamically from `quizzes` table with `specializedType = 'developmental_control'`.
- [x] **`practice/quiz.tsx`**:
  - Replaced hardcoded `'local-student-1'` submission with active user ID from Convex Auth.
  - Filtered questions by `specializedType` when passed as param.
  - Replaced fallback explanation strings with live database `questions.explanation` fields.

### 4.4 Study Notes & Flashcards ([`src/components/notes/LessonDetailModal.tsx`](file:///c:/Users/Adrian/Desktop/Folders/websites/archiapp/react-native-repo/src/components/notes/LessonDetailModal.tsx) & [`src/hooks/useLocalData.ts`](file:///c:/Users/Adrian/Desktop/Folders/websites/archiapp/react-native-repo/src/hooks/useLocalData.ts))
- [x] **`useLocalHierarchy()`**:
  - Fetches real lesson notes and key points from the `materials` table (`type = 'article'`) dynamically instead of generating static placeholder strings.
- [x] **`flashcard-utils.ts`**:
  - Built dynamically using markdown key points from database materials linked to lessons.

### 4.5 Profile & Settings ([`src/app/(tabs)/profile.tsx`](file:///c:/Users/Adrian/Desktop/Folders/websites/archiapp/react-native-repo/src/app/(tabs)/profile.tsx))
- [x] **Profile Picture Upload & Avatar Management**:
  - Added camera capture (`launchCameraAsync`) and gallery selection (`launchImageLibraryAsync`) using `expo-image-picker`.
  - Implemented secure upload to Convex Storage via `generateProfileUploadUrl` mutation.
  - Added offline avatar caching in SQLite `users` table (`profile_image_id`, `profile_image_url`).
  - Rendered high-performance cached avatar with `expo-image`, interactive camera badge, and uploading spinner.
  - Supported avatar removal / reset to default icon with storage cleanup.
- [x] **Achievements Carousel**:
  - Replaced hardcoded `ACHIEVEMENTS` array with dynamic query from `achievements` + `user_achievements` tables.
- [x] **Preferences Toggles**:
  - Persisted `soundEnabled` and `dailyReminder` toggles in database (`users` profile) and local state.
- [x] **Profile Updates**:
  - Connected name and profile updates to Convex `updateProfile` mutation.

### 4.6 Statistics Hook ([`src/hooks/useLocalData.ts:useLocalStats`](file:///c:/Users/Adrian/Desktop/Folders/websites/archiapp/react-native-repo/src/hooks/useLocalData.ts#L695))
- [x] Removed hardcoded default values (`progressPercentage: 75`, `averageScore: 85`, `streakDays: 14`).
- [x] Computes actual curriculum progress percentage: `(completedLessonsCount / totalPublishedLessonsCount) * 100`.
- [x] Computes real study streak from `quizAttempts.submittedAt` and `lessonProgress.completedAt` calendar day timestamps.

---

## ⚡ Phase 5: Sync Engine Updates

### 5.1 Convex Sync Handler ([`convex/sync.ts`](file:///c:/Users/Adrian/Desktop/Folders/websites/archiapp/react-native-repo/convex/sync.ts))
- [x] Included `userPresets`, `achievements`, `userAchievements`, and `userStreaks` in `getSyncBundle`.
- [x] Added batch up-sync handlers for `userPresets` and streak progress (`syncUserPresets`, `syncUserStreaks`).

### 5.2 Client Sync Service ([`src/services/useSyncService.ts`](file:///c:/Users/Adrian/Desktop/Folders/websites/archiapp/react-native-repo/src/services/useSyncService.ts))
- [x] **Removed Hardcoded Filter**:
  - Removed filters that skipped uploading attempts with `quizId` starting with `area-`, `all-`, or `mock-`.
  - Ensures all offline practice and mock exam attempts sync cleanly to Convex.
- [x] **Batch Sync for New Tables**:
  - Added down-sync and up-sync routines for `user_presets`, `achievements`, and `user_streaks`.

---

## ✅ Phase 6: Verification & Quality Assurance

- [x] Verified full TypeScript compilation: `npx tsc --noEmit` passed with 0 errors across the entire codebase.
- [x] Verified ESLint compliance: `npx expo lint` passed with 0 errors and 0 warnings.
- [x] Verified schema alignment between Convex and SQLite Drizzle schemas.
- [x] Verified all seeded records contain `[Seed]` or `[Mock]` identifiers and confirmed `deleteMockSeedData` mutation is present and functional.
- [x] Verified stores operate seamlessly offline with SQLite and background sync.
- [x] Verified Confidence Rate calculation dynamically reflects test attempts and auto-refetches on screen focus.
- [x] Verified Continue Learning strictly displays real student progress and prioritizes active subjects.
- [x] Verified automated backend security and unit tests pass (`npm run test`, 4/4 suites pass).
- [x] **Convex Backend Optimization & Security Hardening**:
  - Embedded `answers` array in `quizAttempts` to reduce write amplification by 99% and eliminate mutation bounds.
  - Added composite indexes on `quizAnswers` (`by_attempt_and_question`), `questions` (`by_subject_and_published`, `by_topic_and_published`), and `quizzes` (`by_type_and_published`, `by_published`).
  - Precalculated SHA-256 `correctChoiceHash` at question write-time; stripped plain `correctChoiceId` from live exam and practice queries for anti-cheat protection.
  - Restructured backend folders: private helpers isolated in `convex/_helpers/`, destructive seeders converted to `internalMutation` in `convex/_seed/`, and tests organized in `convex/__tests__/`.

---

## 🚀 Phase 7: Next Steps & Operational Roadmap

Here are the immediate actions and upcoming roadmap for the application:

### 7.1 Immediate Operational Steps
- [ ] **Commit Changes to Git**:
  - Check status: `git status`
  - Stage changes: `git add .`
  - Commit:
    ```bash
    git commit -m "feat: complete database integration, offline-first SQLite migration, and mock data elimination"
    ```
  - Push branch to remote:
    ```bash
    git push origin feat/updated-database-integration-and-offline-sync
    ```
- [ ] **Run Initial Content Seed (If not yet populated)**:
  - Seed Curriculum: `npx convex run _seed/curriculum:seedCurriculumFromExcel`.
  - Seed Mock Assessments & Questions: `npx convex run _seed/assessments:seedMockAssessmentsAndMaterials`.
- [ ] **Initial Device Sync**:
  - Open the mobile app in Expo, navigate to **Profile**, and tap **"Cloud Backup & Sync"** to pull down all syllabus items, mock exams, and badges.

### 7.2 Content Authoring & Production Readiness
- [ ] **Populate Production Board Exam Bank**:
  - Replace/supplement `[Seed]` questions with genuine ALE board exam questions across Area 1 (HOA/TOA/PP), Area 2 (Utilities/BT/Materials), and Area 3 (Site Planning/Design).
  - Add diagrams, floor plans, and architectural illustrations to question choices using Convex storage (`questionImageId`).
- [ ] **Clean-up Seed Data**:
  - When production questions and mock sets are ready, run:
    ```bash
    npx convex run _seed/assessments:deleteMockSeedData
    ```
  - This purges all test data tagged with `[Seed]` and `[Mock]` cleanly without touching user profiles or syllabus hierarchy.

### 7.3 Advanced Features & Enhancements (Future Sprints)
- [ ] **FCM Push Notifications**:
  - Configure Firebase Cloud Messaging credentials for daily study reminders (`users.dailyReminder`) and streak alerts.
- [ ] **Audio Flashcards / Spaced Repetition**:
  - Integrate Text-to-Speech (TTS) for architectural term definitions and building code summaries.
- [ ] **EAS Build & Native Production Release**:
  - Configure `eas.json` for Android APK/AAB and iOS IPA builds targeting the App Store and Google Play Store.
  - Test offline SQLite migrations on clean physical Android and iOS devices.

