# ReApp - ALE Reviewer Application 🏗️

Welcome to the **ReApp** documentation! ReApp is an offline-first, mobile Architectural Licensure Examination (ALE) Reviewer application built with React Native (Expo) and a robust sync-engine powered by Convex and SQLite.

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
ReApp aims to provide aspiring architects with a seamless studying experience. It features curriculum tracking, flashcards, and configurable practice quizzes. Its defining architectural trait is its **Offline-First Zero-Trust** capability, allowing users to study on the go without an internet connection, while securely syncing progress to the cloud when online.

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
ReApp uses a **Local-First Data Flow**:
1. **Cloud Truth (Convex):** The central repository for all curriculum data (subjects, topics, questions) and global user data.
2. **Local Cache (SQLite):** All curriculum data is synchronized down to the local device. The UI **only** reads from the local SQLite database.
3. **Local Mutations:** When a user completes a quiz, the attempt is scored locally using cryptographic hashes (to prevent local cheating) and saved to SQLite with a `pending_sync` status.
4. **Background Sync:** The `SyncProvider` continuously listens for network connectivity. When online, it pushes `pending_sync` attempts up to Convex and pulls down any new curriculum updates.

---

## 4. Core Features & Screens

### 📊 Dashboard (`/app/(tabs)/index.tsx`)
- **Overall Readiness:** Displays a calculated readiness score and progress bar based on local quiz attempts.
- **Key Statistics:** Live metrics for Total Study Time, Questions Answered, and Accuracy.
- **Recommended Subjects:** Dynamically suggests curriculum areas based on the local database.
- **Recent Activity:** A chronologically sorted feed of the user's latest practice quiz and mock exam attempts.

### 📚 Learn / Curriculum (`/app/(tabs)/learn`)
- **Study Notes:** Organized documentation and syllabus covering ALE Area 1, 2, and 3.
- **Curriculum Stats:** Live counts of available Subjects, Modules, and Lessons stored in the local DB.
- **Flashcards:** Spaced repetition decks for rapid memorization of architectural styles, laws, and utility standards.

### 🎮 Practice Arena (`/app/(tabs)/practice`)
- **Configurable Quiz Launcher:** Users can customize their drill by selecting:
  - Subject Area (All, Area 1, Area 2, Area 3)
  - Difficulty Level (Easy, Medium, Hard)
  - Question Count (5, 10, 20)
- **Practice History:** A historical log of past attempts, showing scores, topics, and timestamps.

### 👤 Profile & Settings (`/app/(tabs)/profile.tsx`)
- **Study Streak:** Calculates consecutive days of study activity.
- **Manual Sync:** A forced trigger to push/pull data from Convex.
- **Database Debugger:** A developer tool (`/debug-sqlite`) to view local SQLite tables, execute raw queries, and seed mock data.
- **Settings:** Controls for dark mode, notifications, and analytics resets.

---

## 5. Database Schema
The schema is defined in Drizzle (`src/db/schema.ts`) and mirrored in Convex:

- **Curriculum Tables:**
  - `subjects`: Core domains (e.g., History, Building Utilities).
  - `topics`: Sub-sections of subjects (e.g., Plumbing Systems).
  - `materials`: Detailed study notes and articles.
  - `flashcards`: Front/Back active recall cards.
- **Assessment Tables:**
  - `questions`: Individual quiz questions with multiple choices. The correct choice is hashed to prevent exposure in local DB.
  - `quizzes`: Curated sets of questions (Mock Exams).
- **User State Tables:**
  - `quizAttempts`: Logs of user quiz sessions, scores, and time spent. Includes a `syncStatus` flag (`synced` or `pending_sync`).
  - `quizAnswers`: Specific choices made by the user during an attempt.

---

## 6. Data Synchronization Strategy

### Down-Sync (Cloud ➔ Device)
Handled by `syncDown` in `useSyncService.ts`:
1. Fetches all updated `subjects`, `topics`, `materials`, `flashcards`, `quizzes`, and `questions` from Convex.
2. Uses `drizzle-orm` `onConflictDoUpdate` to cleanly upsert data into local SQLite.

### Up-Sync (Device ➔ Cloud)
Handled by `syncUp` in `useSyncService.ts`:
1. Scans local SQLite for `quizAttempts` where `syncStatus = 'pending_sync'`.
2. Pushes these attempts to the Convex `syncAttempt` mutation.
3. Upon success, updates the local `syncStatus` to `synced`.

### Cryptographic Answer Verification
To allow offline grading without exposing correct answers in the local database, ReApp uses **Zero-Trust Hashing**:
- The backend stores the `SHA-256` hash of `questionId + correctChoiceId`.
- When the user selects an answer offline, the app hashes the selection and compares it against the stored hash to calculate the local score.
- The raw answers are eventually sent to Convex for authoritative server-side grading.

---

## 7. Development & Testing

### Running the App
\`\`\`bash
# Start the Expo bundler
npx expo start
\`\`\`

### Managing the Backend (Convex)
\`\`\`bash
# Run Convex development server
npx convex dev

# Seed the database with sample ALE curriculum data
npx convex run seed:seedDatabase
\`\`\`

### Testing Offline Mode
1. Start the app with network connectivity and wait for initial sync.
2. Disable Wi-Fi/Data on the emulator or physical device.
3. Complete a practice quiz.
4. Check the **Profile -> Database Debugger** to see the attempt stored locally.
5. Re-enable network connectivity. The `SyncProvider` will automatically detect the connection and push the attempt to Convex.
