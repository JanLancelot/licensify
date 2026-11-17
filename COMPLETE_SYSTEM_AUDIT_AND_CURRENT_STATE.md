# P App Platform: Complete System Audit & Current State 🏛️📱

> **Audit Date:** November 2026  
> **Platform Version:** P App v1.0.0 (Pre-Upgrade Baseline)  
> **Target Exam:** Architectural Licensure Examination (ALE, Philippines)  
> **Architecture Pattern:** Offline-First Zero-Trust Hybrid (Expo SQLite + Convex Cloud)

---

## 1. High-Level System Architecture

P App is built on a **Local-First, Cloud-Synced** pattern. Aspiring architects can study anywhere—even without cellular data or Wi-Fi—while progress and scores sync seamlessly to the cloud.

```
┌────────────────────────────────────────────────────────┐
│                   CONVEX CLOUD BACKEND                 │
│  • Master Curriculum (Subjects, Branches, Topics)      │
│  • Question Bank & Quizzes                             │
│  • Auth & User Accounts (@convex-dev/auth)             │
│  • Cloud Re-Grading & Sync Engine (sync.ts)            │
│  • Collaborative Study Rooms (rooms.ts)                │
└──────────────────────────┬─────────────────────────────┘
                           │ TLS 1.3 Sync (When Online)
                           ▼
┌────────────────────────────────────────────────────────┐
│             MOBILE CLIENT (EXPO / REACT NATIVE)        │
│  • Local SQLite Database (`reapp.db` via Drizzle ORM)  │
│  • Offline Zero-Trust SHA-256 Answer Verification      │
│  • Local Attempt Mutation Queue (`pending_sync`)       │
│  • Hardware-Backed Token Storage (expo-secure-store)   │
└────────────────────────────────────────────────────────┘
```

---

## 2. Mobile Application Inventory (`src/`)

### A. Technology Stack
* **Framework**: React Native 0.86.2 with Expo SDK 52 (v57 docs) & Expo Router
* **Local Database**: `expo-sqlite` (synchronous native SQLite) + `drizzle-orm`
* **Security & Crypto**: `expo-crypto` (SHA-256 answer verification), `expo-secure-store`
* **UI & Animations**: `lucide-react-native`, `react-native-reanimated`, `moti`, custom theme context (`useTheme`)

---

### B. Route & Screen Map (`src/app/`)

| Route Path | Screen Name | Current Features & Capabilities |
| :--- | :--- | :--- |
| **`/(auth)/login`** | Sign In | Email/Password login, Google OAuth button, redirect logic, error alerts. |
| **`/(auth)/register`** | Registration | Account creation with first/last name, username, email, password validation. |
| **`/(auth)/forgot-password`** | Password Reset | Password reset instructions via email (Resend integration). |
| **`/(tabs)/index`** | **Dashboard** | • **Study Streak Tracker**: Flame badge tracking consecutive study days.<br>• **Confidence Rate**: Weighted progress tracker computed from quiz scores.<br>• **Continue Learning**: Direct jump into the last accessed lesson.<br>• **What's New Card**: Recent platform updates and announcements. |
| **`/(tabs)/learn/index`** | **Curriculum Hub** | 4-tier interactive tree: Subjects → Branches → Topics → Lessons.<br>Progress bars per subject domain. |
| **`/(tabs)/learn/[id]`** | Subject Detail | Deep dive into a specific subject's branches, topics, and lessons. |
| **`/(tabs)/learn/notes/`** | Notes Hub | Browse comprehensive study notes grouped by subject. |
| **`/(tabs)/learn/notes/[lessonId]`**| Note Reader | Markdown-rendered lesson notes with code references (e.g. NBCP, BP 344). |
| **`/(tabs)/learn/flashcards/`** | Flashcards Hub | Deck selection, card count, mastery status. |
| **`/(tabs)/practice/index`** | **Practice Arena** | Launcher for custom quizzes, quick practice drills, and NBCP Rule 7 & 8 computation tests. |
| **`/(tabs)/practice/quiz`** | Active Quiz Session | Timer countdown, choice selection, instant local grading, score summary. |
| **`/(tabs)/practice/flashcards`** | Flashcard Player | Active recall 3D flip card view, self-assessment (Easy, Good, Hard). |
| **`/(tabs)/exams/index`** | **Exams Hub** | Official simulated board exams (100, 150, 200 items), mock exam history. |
| **`/(tabs)/exams/[id]`** | Exam Details | Overview, syllabus coverage, time limit, and rules. |
| **`/(tabs)/exams/session`** | Exam Runner | Full board exam simulation, question navigation drawer, flag-for-review. |
| **`/(tabs)/profile`** | **User Profile** | Gamified achievements system, study stats, dark/light theme switch, sound & daily reminder toggles, manual sync trigger. |
| **`/room/[id]`** | **Study Room** | Real-time collaborative peer study room (Convex reactive room state). |

---

### C. Key Mobile Components & Modals (`src/components/`)
* **`ModularExamBuilderModal.tsx`**: Lets students configure custom mock exams by syllabus area.
* **`FlashcardPresetBuilderModal.tsx`**: Custom flashcard deck configurations.
* **`QuizLauncherModal.tsx`**: Quick setup for practice sessions (items, timer, topic).
* **`ExamRemindersModal.tsx`**: Scheduled notification alerts for board exam countdowns.
* **`LessonDetailModal.tsx`**: Summary sheet for quick lesson review before quizzes.
* **`MarkdownContentView.tsx`**: Custom markdown parser for rendering study materials.

---

## 3. Web Admin Portal Inventory (`admin/`)

### A. Technology Stack
* **Framework**: Next.js 15 (App Router), React 19, TypeScript
* **Styling**: Tailwind CSS 3.4 with custom Studio Dark/Light theme palette
* **Backend Bridge**: Convex React Client (`convex/react`)

---

### B. Admin Studios & Route Map (`admin/src/app/`)

| Studio Route | Studio Name | Current Admin Capabilities |
| :--- | :--- | :--- |
| **`/`** | **Dashboard** | Overview cards: Total Students, Questions in Bank, Active Mock Exams, Sync Activity. |
| **`/curriculum`** | **Curriculum Studio** | Full CRUD for the 4-level ALE curriculum hierarchy: **Subjects**, **Branches**, **Topics**, and **Lessons**. Order drag/numbering, publication toggles. |
| **`/materials`** | **Materials Studio** | Study notes and articles composer. Has a split-pane Markdown editor (`<textarea>` + preview), file upload attachment handler (PDFs, images). |
| **`/flashcards`** | **Flashcard Studio** | Manage flashcard decks, create/edit cards (Front prompt, Back answer, image attachment), filter by subject/topic. |
| **`/questions`** | **Question Bank Studio** | • Single question composer with 4 choices (A, B, C, D), correct choice selector, explanation, difficulty tier (Easy, Medium, Hard).<br>• Filter by subject, topic, difficulty, search.<br>• **Bulk Question Importer**: JSON & CSV parser calling `bulkCreateQuestions`. |
| **`/quizzes`** | **Assessments Studio** | Assemble and publish Practice Quizzes and Board Mock Exams from the question bank. Configure time limits and passing scores. |
| **`/announcements`** | **Announcements Studio**| Create, publish, or archive global banner announcements pushed to mobile users. |
| **`/users`** | **User Management** | View registered students, assign roles (`student`, `admin`, `content_manager`), activate/deactivate accounts. |
| **`/login`** | **Admin Auth** | Role-guarded login screen with session validation. |

---

## 4. Backend Cloud Inventory (`convex/`)

### A. Database Schema (`convex/schema.ts`)
The cloud database houses **15+ tables** with optimized composite indexes:

1. **Users & Auth Domain**:
   - `users`: Core profile (`email`, `username`, `firstName`, `lastName`, `role`, `isActive`, `fcmToken`, `soundEnabled`, `dailyReminder`, `lastActiveAt`).
   - `authTables`: Convex Auth sessions, accounts, and verifications.
   - `profileImageClaims`: Storage claims ensuring students only delete files they own.
2. **Curriculum Domain**:
   - `subjects`: Level 1 (e.g., *History & Theory of Architecture*, *Building Tech*, *Practice*).
   - `branches`: Level 1.5 (Optional branches, e.g., *Architectural Laws* under Practice).
   - `topics`: Level 2.
   - `lessons`: Level 3 (Individual learning modules).
   - `materials`: Articles, notes, storage attachments (`storageId`).
   - `flashcards`: Front, Back, image attachments, publish status.
3. **Assessment & Question Bank Domain**:
   - `questions`: Question stem, choices array (`{ id, text, imageId }`), `correctChoiceId`, write-time `correctChoiceHash`, `explanation`, `difficulty`, `specializedType` (e.g. `developmental_control`).
   - `quizzes`: Curated Mock Exams and Practice Tests (`questionIds` array, time limit, type).
   - `quizAttempts`: Student submissions with embedded `answers` array for atomic 1-write submissions and O(1) grade lookups.
   - `quizAnswers`: Detailed attempt answers for historical breakdown.
4. **Collaboration & System Domain**:
   - `studyRooms` & `studyRoomMembers`: Peer review rooms and live presence.
   - `notifications`: Push and in-app alerts.
   - `announcements`: Global updates and board exam countdowns.

---

### B. Backend API Endpoints (`convex/*.ts`)

| Module | Core Queries & Mutations |
| :--- | :--- |
| **`auth.ts`** | Custom Password credentials, email verification, Google OAuth handler, redirection security. |
| **`users.ts`** | `getCurrentUser`, `updateProfile`, `getUserStreak`, `recordStudySession`, `checkUserRole`. |
| **`subjects.ts`** | `getFullCurriculum`, `listPublishedSubjects`, `createSubject`, `updateSubject`, `deleteSubject`. |
| **`branches.ts`** | `listBranchesBySubject`, `listAllBranchesAdmin`, `createBranch`, `updateBranch`, `deleteBranch`. |
| **`topics.ts`** | `listTopicsBySubject`, `listAllTopicsAdmin`, `createTopic`, `updateTopic`, `deleteTopic`. |
| **`lessons.ts`** | `listLessonsByTopic`, `listAllLessonsAdmin`, `createLesson`, `updateLesson`, `deleteLesson`. |
| **`materials.ts`** | `listMaterialsByLesson`, `generateUploadUrl`, `createMaterial`, `updateMaterial`, `deleteMaterial`. |
| **`flashcards.ts`** | `listFlashcardsByTopic`, `listAllFlashcardsAdmin`, `createFlashcard`, `updateFlashcard`, `deleteFlashcard`. |
| **`questions.ts`** | `listAllQuestionsAdmin`, `searchQuestions`, `createQuestion`, `updateQuestion`, `deleteQuestion`, **`bulkCreateQuestions`**. |
| **`quizzes.ts`** | `listPublishedQuizzes`, `getQuizWithQuestions`, `createQuiz`, `updateQuiz`, `deleteQuiz`. |
| **`attempts.ts`** | `startAttempt`, `submitQuizAttempt` (cloud server-side re-grading), `getAttemptReview`. |
| **`sync.ts`** | Bidirectional delta sync engine connecting on-device SQLite with Convex Cloud. |
| **`rooms.ts`** | Collaborative room creation, member join/leave, live room status. |
| **`notifications.ts`** | FCM device token registration, broadcast alerts. |
| **`announcements.ts`** | Public and admin announcement feed. |
| **`admin.ts`** | High-level metrics, system telemetry, user role assignment. |

---

### C. Seed & Maintenance Utilities (`convex/_seed/`)
* **`_seed/curriculum.ts`**: Imports and parses ALE curriculum hierarchy directly from Excel spreadsheets (`seedCurriculumFromExcel`).
* **`_seed/assessments.ts`**: Seeds mock assessments, NBCP Rule 7 & 8 computation drills, and flashcards (`seedMockAssessmentsAndMaterials`). Includes `deleteMockSeedData` for clean production resets.

---

## 5. Summary: Baseline Readiness vs. Planned Upgrades

The existing codebase provides a solid, working offline-first foundation. Here is how our upcoming upgrades map to the current system:

```
CURRENT BASELINE                           PLANNED UPGRADES
────────────────────────────────────       ──────────────────────────────────────────────
• Raw Markdown textarea in materials ───►  • Tiptap WYSIWYG Word-like Editor with Inline Images
• Static 2D Images in Flashcards     ───►  • Interactive Photo Hotspots & Guided Zoom Tours
• Static 2D Blueprint Figures        ───►  • Rotatable 3D Architectural Models (.glb)
• Manual JSON/CSV Bulk Paste         ───►  • 3-Tab AI-Assisted PDF Quiz Importer
• Multiple Choice Questions Only     ───►  • Identification, Essay (AI Rubrics), Pinch-to-Zoom
• Admin-Only Content Authoring       ───►  • Student Custom Decks & Architect Evaluation Queue
• Free Prototype Stage               ───►  • PayMongo/RevenueCat Subscriptions & RA 10173 Privacy
```
