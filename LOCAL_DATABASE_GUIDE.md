# ReApp Local SQLite Database Guide (Offline-First Architecture)

This guide documents the local database architecture, schema definitions, offline zero-trust answer verification, React hooks, and sync mechanisms used across the **ReApp** mobile application.

---

## 1. Overview & Technology Stack

ReApp utilizes a **Local-First, Offline-Capable** data architecture designed to allow students to study materials, flip flashcards, take quizzes, and check answers with zero network latency or completely offline.

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
| `useLocalMaterials(subjectId, topicId?)` | `subjectId, topicId?` | `{ materials, loading }` | Fetches study materials. |
| `useLocalFlashcards(subjectId, topicId?)` | `subjectId, topicId?` | `{ flashcards, loading }` | Fetches interactive flashcards. |
| `useLocalQuizzes(subjectId, topicId?)` | `subjectId, topicId?` | `{ quizzes, loading }` | Fetches quizzes & mock exams. |
| `useLocalQuizWithQuestions(quizId)` | `quizId` | `{ quiz, questions, loading }` | Fetches quiz details and ordered questions list. |
| `useSubmitLocalAttempt()` | None | `submitAttempt(userId, quizId, answers)` | Submits quiz, grades offline, and queues for sync. |

---

## 6. Cloud Synchronization (`src/services/useSyncService.ts`)

* **Down-Sync (`syncDown`)**: Pulls published subjects, topics, materials, and questions from Convex and upserts into local SQLite (`onConflictDoUpdate`).
* **Up-Sync (`syncUp`)**: Reads `quiz_attempts` where `sync_status = 'pending_sync'` and pushes answers to Convex. Convex re-grades server-side and updates the local status to `'synced'`.
* **Automatic Background Sync (`src/components/SyncProvider.tsx`)**: Triggers whenever internet connectivity is restored or the app transitions to the foreground.

---

## 7. Seeding & Resetting Local Data (`src/db/seed.ts`)

To populate or reset sample board exam data locally:

```ts
import { seedSampleData } from '@/db/seed';

// Clears existing data and seeds 3 subjects, 6 topics, flashcards, guides, and mock exams:
await seedSampleData();
```
Users can also trigger this via the **"🌱 Populate Sample Data"** button on the Home screen or in the **Settings** tab (`src/components/DebugSQLite.tsx`).
