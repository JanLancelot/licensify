# Licensify Local SQLite Database Guide (Offline-First Architecture)

This guide documents the local database architecture, schema definitions, offline zero-trust answer verification, React hooks, and sync mechanisms used across the **Licensify** mobile application.

---

## 1. Overview & Technology Stack

Licensify utilizes a **Local-First, Offline-Capable** data architecture designed to allow students to study materials, flip flashcards, take quizzes, and check answers with zero network latency or completely offline.

* **Database Engine**: [`expo-sqlite`](https://docs.expo.dev/versions/v57.0.0/sdk/sqlite/) (Synchronous native SQLite database).
* **Object-Relational Mapping (ORM)**: [`drizzle-orm`](https://orm.drizzle.team/) for type-safe SQLite queries and migrations.
* **Cryptography**: [`expo-crypto`](https://docs.expo.dev/versions/v57.0.0/sdk/crypto/) for on-device SHA-256 answer verification.
* **Remote Backend**: [Convex](https://www.convex.dev/) for real-time cloud sync, re-grading, and account backup.

---

## 2. Database Connection & Lifecycle

### Client Setup (`src/db/client.ts`)
The SQLite database instance is opened synchronously via `openDatabaseSync('reapp.db')` and bootstrapped with foreign key constraints enabled.

```ts
import { openDatabaseSync } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from '@/db/schema';

// Open the SQLite database synchronously
const expoDb = openDatabaseSync('reapp.db');

// Ensure tables exist on startup
expoDb.execSync(`PRAGMA foreign_keys = ON; ...`);

export const db = drizzle(expoDb, { schema });
```

---

## 3. Schema Definitions (`src/db/schema.ts`)

The database is divided into 3 domains: **Users & Access**, **Learning Content**, and **Assessments & Attempts**.

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│    subjects     │──────<│     topics      │──────<│    materials    │
└─────────────────┘       └─────────────────┘       └─────────────────┘
         │                         │
         │                         ├──────<┌─────────────────┐
         │                         │      │   flashcards    │
         │                         │      └─────────────────┘
         │                         │
         │                         ├──────<┌─────────────────┐
         │                         │      │    questions    │
         │                         │      └─────────────────┘
         │                         │               │
         ▼                         ▼               │
┌───────────────────────────────────────────┐      │
│                  quizzes                  │──────┘ (stores question_ids JSON)
└───────────────────────────────────────────┘
         │
         ▼
┌─────────────────┐       ┌─────────────────┐
│  quiz_attempts  │──────<│  quiz_answers   │
└─────────────────┘       └─────────────────┘
```

### Table Reference

#### 1. `users`
Stores user profile information locally.
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `TEXT` | `PRIMARY KEY` | Local identifier / UUID |
| `convex_id` | `TEXT` | `UNIQUE` | Cloud ID from Convex |
| `user_id` | `TEXT` | `NOT NULL` | Auth identifier |
| `username` | `TEXT` | `NOT NULL` | User handle |
| `first_name` | `TEXT` | | First name |
| `last_name` | `TEXT` | | Last name |
| `role` | `TEXT` | `NOT NULL` | `'student' \| 'admin' \| 'content_manager'` |
| `is_active` | `INTEGER` | `DEFAULT 1` | Active status boolean |

#### 2. `subjects`
Board exam subject categories (e.g. *Architectural Design*, *Building Utilities*).
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `TEXT` | `PRIMARY KEY` | Subject ID |
| `convex_id` | `TEXT` | `UNIQUE` | Cloud ID |
| `name` | `TEXT` | `NOT NULL` | Subject title |
| `description` | `TEXT` | | Overview / syllabus info |
| `is_published`| `INTEGER` | `DEFAULT 0` | Visibility flag |
| `order` | `INTEGER` | `DEFAULT 0` | Display sorting order |

#### 3. `topics`
Modules belonging to a subject (e.g. *Space Planning*, *Zoning Codes*).
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `TEXT` | `PRIMARY KEY` | Topic ID |
| `convex_id` | `TEXT` | `UNIQUE` | Cloud ID |
| `subject_id` | `TEXT` | `REFERENCES subjects(id)` | Parent Subject |
| `name` | `TEXT` | `NOT NULL` | Topic name |
| `description` | `TEXT` | | Sub-topic summary |
| `order` | `INTEGER` | `DEFAULT 0` | Sorting order |
| `is_published`| `INTEGER` | `DEFAULT 0` | Visibility flag |

#### 4. `materials`
Articles, code references, formulas, and document notes.
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `TEXT` | `PRIMARY KEY` | Material ID |
| `convex_id` | `TEXT` | `UNIQUE` | Cloud ID |
| `subject_id` | `TEXT` | `REFERENCES subjects(id)` | Parent Subject |
| `topic_id` | `TEXT` | `REFERENCES topics(id)` | Parent Topic (optional) |
| `title` | `TEXT` | `NOT NULL` | Document title |
| `description` | `TEXT` | | Brief overview |
| `type` | `TEXT` | `NOT NULL` | `'article' \| 'pdf' \| 'document' \| 'image'` |
| `content` | `TEXT` | | Full text/markdown notes |
| `local_file_uri`| `TEXT` | | Offline cached file URI (PDFs/Images) |

#### 5. `flashcards`
Interactive study flashcards with front prompt and back answer.
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `TEXT` | `PRIMARY KEY` | Flashcard ID |
| `convex_id` | `TEXT` | `UNIQUE` | Cloud ID |
| `subject_id` | `TEXT` | `REFERENCES subjects(id)` | Parent Subject |
| `topic_id` | `TEXT` | `REFERENCES topics(id)` | Parent Topic |
| `front` | `TEXT` | `NOT NULL` | Question / prompt |
| `back` | `TEXT` | `NOT NULL` | Answer / definition |

#### 6. `questions`
Multiple-choice assessment questions.
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `TEXT` | `PRIMARY KEY` | Question ID |
| `convex_id` | `TEXT` | `UNIQUE` | Cloud ID |
| `subject_id` | `TEXT` | `REFERENCES subjects(id)` | Parent Subject |
| `topic_id` | `TEXT` | `REFERENCES topics(id)` | Parent Topic |
| `question` | `TEXT` | `NOT NULL` | Question text prompt |
| `choices` | `TEXT` | `NOT NULL` | JSON array: `[{id, text, imageId?}]` |
| `correct_choice_hash`| `TEXT` | | `SHA-256("${questionId}:${correctChoiceId}")` |
| `explanation` | `TEXT` | | Educational rationale / code citation |
| `difficulty` | `TEXT` | `NOT NULL` | `'easy' \| 'medium' \| 'hard'` |

#### 7. `quizzes`
Exams and practice tests.
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `TEXT` | `PRIMARY KEY` | Quiz ID |
| `convex_id` | `TEXT` | `UNIQUE` | Cloud ID |
| `title` | `TEXT` | `NOT NULL` | Exam title |
| `description` | `TEXT` | | Description |
| `type` | `TEXT` | `NOT NULL` | `'practice' \| 'mock_exam'` |
| `subject_id` | `TEXT` | `REFERENCES subjects(id)` | Subject (optional for general) |
| `topic_id` | `TEXT` | `REFERENCES topics(id)` | Topic (optional for mock exams) |
| `question_ids`| `TEXT` | `NOT NULL` | JSON array: `["q1", "q2", ...]` |
| `time_limit_seconds`| `INTEGER`| | Timer duration in seconds |
| `passing_score`| `INTEGER`| | Passing threshold (e.g. 70, 75) |

#### 8. `quiz_attempts`
Saved quiz attempts and local grading history.
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `TEXT` | `PRIMARY KEY` | Local attempt UUID |
| `convex_id` | `TEXT` | `UNIQUE` | Synced Cloud Attempt ID |
| `user_id` | `TEXT` | `REFERENCES users(id)` | Student ID |
| `quiz_id` | `TEXT` | `REFERENCES quizzes(id)` | Quiz ID |
| `status` | `TEXT` | `NOT NULL` | `'in_progress' \| 'submitted' \| 'expired'` |
| `sync_status` | `TEXT` | `DEFAULT 'pending_sync'`| `'pending_sync' \| 'synced'` |
| `score` | `INTEGER`| | Computed score percentage (0-100) |
| `correct_answers`| `INTEGER`| | Number of correct answers |
| `total_questions`| `INTEGER`| `NOT NULL` | Total questions |
| `started_at` | `INTEGER`| `NOT NULL` | Unix timestamp (ms) |
| `submitted_at`| `INTEGER`| | Unix timestamp (ms) |
| `signature` | `TEXT` | | Tamper detection cryptographic signature |

#### 9. `quiz_answers`
Individual answers selected per attempt.
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `TEXT` | `PRIMARY KEY` | UUID |
| `attempt_id` | `TEXT` | `REFERENCES quiz_attempts(id)` | Attempt reference |
| `question_id`| `TEXT` | `REFERENCES questions(id)` | Question reference |
| `selected_choice_id`| `TEXT` | | Selected option ID (e.g. `'c3'`) |
| `answered_at`| `INTEGER`| | Unix timestamp (ms) |

#### 10. `user_presets`
Student custom configurations (Flashcard decks, custom quizzes, and modular exams).
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `TEXT` | `PRIMARY KEY` | Preset ID / UUID |
| `convex_id` | `TEXT` | `UNIQUE` | Cloud ID |
| `user_id` | `TEXT` | `NOT NULL` | User identifier |
| `type` | `TEXT` | `NOT NULL` | `'flashcard' \| 'quiz' \| 'exam'` |
| `title` | `TEXT` | `NOT NULL` | Custom preset title |
| `icon_name` | `TEXT` | | Lucide icon name |
| `lesson_ids` | `TEXT` | `NOT NULL` | JSON array of lesson IDs |
| `subject_names` | `TEXT` | | JSON array of subject titles |
| `question_count` | `INTEGER` | | Desired items count |
| `time_limit_seconds` | `INTEGER` | | Countdown timer |
| `sync_status` | `TEXT` | `DEFAULT 'pending_sync'` | Synchronization status |

#### 11. `achievements`
Gamification badge catalog.
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `TEXT` | `PRIMARY KEY` | Achievement ID |
| `title` | `TEXT` | `NOT NULL` | Badge name (e.g. `[Seed] Code Master`) |
| `category` | `TEXT` | `NOT NULL` | Milestone category |
| `description` | `TEXT` | `NOT NULL` | Unlock criteria summary |
| `icon_name` | `TEXT` | `NOT NULL` | Lucide icon name |
| `criteria_type` | `TEXT` | `NOT NULL` | `'perfect_score' \| 'streak' \| 'flashcard_decks' \| 'rule7_8'` |
| `target_value` | `INTEGER` | `NOT NULL` | Target threshold to unlock |
| `order` | `INTEGER` | `DEFAULT 0` | Display ordering |

#### 12. `user_achievements`
Unlocked achievement records per student.
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `TEXT` | `PRIMARY KEY` | Local record ID |
| `user_id` | `TEXT` | `NOT NULL` | Student ID |
| `achievement_id` | `TEXT` | `NOT NULL` | Achievement ID reference |
| `progress` | `INTEGER` | `DEFAULT 0` | Current progress towards target |
| `is_unlocked` | `INTEGER` | `DEFAULT 0` | Unlock boolean |
| `unlocked_at` | `INTEGER` | | Unix timestamp (ms) |

#### 13. `user_streaks`
Study consistency and consecutive daily streak logs.
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `TEXT` | `PRIMARY KEY` | Local streak record ID |
| `user_id` | `TEXT` | `NOT NULL` | Student ID |
| `current_streak` | `INTEGER` | `DEFAULT 0` | Current active streak in days |
| `longest_streak` | `INTEGER` | `DEFAULT 0` | All-time best streak |
| `last_active_date` | `TEXT` | `NOT NULL` | ISO date string (`YYYY-MM-DD`) |

---

## 4. Offline Zero-Trust Answer Verification

To enable 100% offline grading without exposing plain-text correct answers in SQLite (which could be inspected to cheat):

```
User selects choice 'c3' on Question 'q1'
                  │
                  ▼
   Hash computed on-device:
   hash = SHA-256("q-ergonomics-1:c3")
                  │
                  ▼
   Compare with local DB:
   hash === question.correct_choice_hash ?
   ├── YES ➔ 🟢 Score + 1, mark choice as Correct
   └── NO  ➔ 🔴 Incorrect, test other choices to reveal answer
```

```ts
import * as crypto from 'expo-crypto';

// Compute deterministic SHA-256 hash
const hash = await crypto.digestStringAsync(
  crypto.CryptoDigestAlgorithm.SHA256,
  `${questionId}:${selectedChoiceId}`
);

// Offline instant verification
const isCorrect = hash === question.correctChoiceHash;
```

---

## 5. Data Access Hooks (`src/hooks/useLocalData.ts`)

| Hook | Parameters | Returns | Description |
|---|---|---|---|
| `useLocalSubjects()` | None | `{ subjects, loading, refetch }` | Fetches published subjects sorted by order. |
| `useLocalSubject(id)` | `subjectId` | `{ subject, loading }` | Fetches single subject by ID. |
| `useLocalTopics(subjectId)` | `subjectId` | `{ topics, loading }` | Fetches published topics for a subject. |
| `useLocalHierarchy()` | None | `{ curriculum, loading, refetch }` | Fetches full 3-tier hierarchy with markdown notes. |
| `useLocalMaterials(subjectId, topicId?)` | `subjectId, topicId?` | `{ materials, loading }` | Fetches study materials. |
| `useLocalFlashcards(subjectId, topicId?)` | `subjectId, topicId?` | `{ flashcards, loading }` | Fetches interactive flashcards. |
| `useLocalQuizzes(filter?)` | `{ type?, specializedType? }` | `{ quizzes, loading }` | Fetches mock exams or specialized practice drills. |
| `useLocalQuizWithQuestions(quizId)` | `quizId` | `{ quiz, questions, loading }` | Fetches quiz details and ordered questions list. |
| `useLocalAttempts()` | None | `{ attempts, loading, refetch }` | Fetches student quiz attempt history. |
| `useLocalStats()` | None | `{ stats, loading, refetch }` | Computes live progress %, average score, and streaks. |
| `useLocalAchievements(userId?)` | `userId?` | `{ achievements, loading, refetch }` | Evaluates live unlocked status for all badges. |
| `useUserStreak()` | None | `{ streak, loading, refetch }` | Tracks current and longest study streak. |
| `useSubmitLocalAttempt()` | None | `submitAttempt(userId, quizId, answers)` | Submits quiz, grades offline, and queues for sync. |

---

## 6. Cloud Synchronization (`src/services/useSyncService.ts` & `convex/sync.ts`)

* **Down-Sync (`syncDown`)**: 
  * Calls `api.sync.getSyncBundle` in **1 single network roundtrip** (replacing previous 100+ nested loops).
  * Pre-computes deterministic SHA-256 choice hashes directly on Convex server via Web Crypto, preserving answer secrecy without mobile client crypto bottlenecks.
  * Checks `sync_metadata` for `lastSyncedAt`. If Convex reports no updates, sync completes in `<50ms` (`upToDate: true`).
  * Ingests `subjects`, `branches`, `topics`, `lessons`, `materials`, `flashcards`, `questions`, `quizzes`, `userPresets`, `achievements`, and `userStreaks` using chunked Drizzle batch operations.
* **Up-Sync (`syncUp`)**: 
  * Collects pending attempts and their answers from `quiz_attempts` where `sync_status = 'pending_sync'`.
  * Uploads pending custom student presets (`user_presets`) and streaks (`user_streaks`).
  * Sends a single batch mutation to `api.sync.syncAttemptsBatch`, which authoritatively grades and commits attempts with embedded answers in **1 atomic write per attempt** (reducing cloud database write amplification by 99%).
  * Updates SQLite `sync_status` to `'synced'` upon server confirmation.
* **Automatic Background Sync (`src/components/SyncProvider.tsx`)**: 
  * Triggers on initial app mount and whenever the app transitions to the foreground (`AppState === 'active'`).
  * Includes 3-second debouncing to avoid duplicate concurrent sync requests during rapid UI navigation.

---

## 7. Seeding & Purging Content (`convex/_seed/`)

Seeding mutations are secured inside `convex/_seed/` as `internalMutation`s to prevent execution from client apps. They can only be executed via the Convex CLI or Convex Cloud Dashboard.

### Seeding ALE Curriculum Hierarchy from Excel
```bash
npx convex run _seed/curriculum:seedCurriculumFromExcel
```

### Seeding Mock Assessments, Questions & Achievements
To populate genuine mock exams, Rule 7 & 8 computation drills, flashcards, study notes, and achievements tagged with `[Seed]` or `[Mock]`:

```bash
npx convex run _seed/assessments:seedMockAssessmentsAndMaterials
```

### Purging Seed Data for Production
When production review questions are ready, purge all test data cleanly with:

```bash
npx convex run _seed/assessments:deleteMockSeedData
```
This removes all items containing `[Seed]` or `[Mock]` without affecting user profiles or syllabus hierarchy.

