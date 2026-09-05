# Architecture Board Exam Platform — Convex Database Developer Guide

> [!NOTE]
> This guide is for the development team (**Frontend**, **Backend 1**, **Backend 2**, **Security**, and **DevOps**). It explains how to interact with the database via Convex React hooks (`useQuery`, `useMutation`), TypeScript types, authorization roles, and available database functions.

---

## 1. Setup & Integration in React Native / Expo

### Wrapping the App Root
Ensure `ConvexProvider` wraps your root app component (`src/app/_layout.tsx` or `App.tsx`):

```tsx
import { ConvexProvider, ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
});

export default function RootLayout() {
  return (
    <ConvexProvider client={convex}>
      {/* App Navigation / Screens */}
    </ConvexProvider>
  );
}
```

---

## 2. Shared TypeScript Types

Import generated document and ID types directly into your UI components:

```ts
import { Doc, Id } from "../../convex/_generated/dataModel";

export type User = Doc<"users">;
export type Subject = Doc<"subjects">;
export type Topic = Doc<"topics">;
export type Question = Doc<"questions">;
export type Quiz = Doc<"quizzes">;
export type QuizAttempt = Doc<"quizAttempts">;
export type StudyRoom = Doc<"studyRooms">;
```

---

## 3. Database API Function Reference

### 👤 Domain 1: Users & Access (`convex/users.ts`)

| Function | Type | Parameters | Description |
|---|---|---|---|
| `api.users.storeUser` | Mutation | `{ username?, firstName?, lastName? }` | Call on login to register identity |
| `api.users.getCurrentUserProfile` | Query | `{}` | Returns current logged in user doc |
| `api.users.updateProfile` | Mutation | `{ username?, firstName?, lastName?, profileImageId?, soundEnabled?, dailyReminder? }` | Updates profile metadata & preferences |
| `api.users.updateRole` | Mutation | `{ targetUserId, newRole: "student" \| "admin" \| "content_manager" }` | Admin-only role elevation |

**Example Usage in Component:**
```tsx
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

function UserProfile() {
  const profile = useQuery(api.users.getCurrentUserProfile);
  const updateProfile = useMutation(api.users.updateProfile);

  if (!profile) return <Text>Loading...</Text>;
  return <Text>Welcome {profile.username} ({profile.role})</Text>;
}
```

---

### 📚 Domain 2: Learning Content (`convex/subjects.ts`, `topics.ts`, `materials.ts`, `flashcards.ts`)

| Function | Type | Parameters | Description |
|---|---|---|---|
| `api.subjects.listPublishedSubjects` | Query | `{}` | Returns all active board exam subjects |
| `api.subjects.getSubjectWithTopics` | Query | `{ subjectId }` | Returns subject with nested topics |
| `api.materials.listMaterialsByTopic` | Query | `{ topicId }` | Returns study articles/documents |
| `api.materials.generateUploadUrl` | Mutation | `{}` | Short-lived Convex Storage upload URL |
| `api.flashcards.getFlashcardsByTopic` | Query | `{ topicId }` | Returns flashcards for study deck |

**Example Uploading PDF/Image Material:**
```tsx
const generateUploadUrl = useMutation(api.materials.generateUploadUrl);
const createMaterial = useMutation(api.materials.createMaterial);

async function handleUpload(fileBlob: Blob) {
  const postUrl = await generateUploadUrl();
  const result = await fetch(postUrl, { method: "POST", body: fileBlob });
  const { storageId } = await result.json();

  await createMaterial({
    subjectId,
    title: "Building Utilities Code",
    type: "pdf",
    storageId,
  });
}
```

---

### 📝 Domain 3: Assessments & Quizzes (`convex/questions.ts`, `quizzes.ts`, `attempts.ts`)

| Function | Type | Parameters | Description |
|---|---|---|---|
| `api.quizzes.listQuizzes` | Query | `{ type?: "practice" \| "mock_exam", paginationOpts }` | List quizzes (Paginated) |
| `api.quizzes.getQuizWithQuestions` | Query | `{ quizId }` | Fetch quiz with populated question cards |
| `api.quizzes.generatePracticeQuiz` | Mutation | `{ title, subjectId, topicId?, questionCount }` | Create dynamic practice quiz |
| `api.attempts.startQuizAttempt` | Mutation | `{ quizId }` | Starts exam attempt (`in_progress`) |
| `api.attempts.recordAnswer` | Mutation | `{ attemptId, questionId, selectedChoiceId }` | Records real-time answer |
| `api.attempts.submitQuizAttempt` | Mutation | `{ attemptId }` | Finalizes exam & calculates score % |
| `api.attempts.getUserQuizHistory` | Query | `{}` | Student exam history & scores |

**Example Exam Flow Execution:**
```tsx
const startAttempt = useMutation(api.attempts.startQuizAttempt);
const recordAnswer = useMutation(api.attempts.recordAnswer);
const submitAttempt = useMutation(api.attempts.submitQuizAttempt);

// 1. Start Exam
const attemptId = await startAttempt({ quizId });

// 2. Select Choice
await recordAnswer({ attemptId, questionId, selectedChoiceId: "choice_b" });

// 3. Submit Exam
const result = await submitAttempt({ attemptId });
console.log(`Score: ${result.score}% (${result.correctAnswers}/${result.totalQuestions})`);
```

---

### 🎙️ Domain 4: Collaboration & Rooms (`convex/rooms.ts`)

| Function | Type | Parameters | Description |
|---|---|---|---|
| `api.rooms.listActiveRooms` | Query | `{}` | Returns all live study rooms |
| `api.rooms.getRoomDetails` | Query | `{ roomId }` | Room info + active participant list |
| `api.rooms.createStudyRoom` | Mutation | `{ name, subjectId?, maxParticipants? }` | Creates room & outputs LiveKit channel ID |
| `api.rooms.joinRoom` | Mutation | `{ roomId }` | Joins room and gets LiveKit channel ID |
| `api.rooms.leaveRoom` | Mutation | `{ roomId }` | Leaves room and updates roster |

---

### 🔄 Domain 6: High-Performance Offline Sync (`convex/sync.ts`)

| Function | Type | Parameters | Description |
|---|---|---|---|
| `api.sync.getSyncBundle` | Query | `{ sinceTimestamp?: number }` | Fetches entire published curriculum, presets, achievements, and streaks in 1 single atomic query with precomputed SHA-256 choice hashes (supports Delta sync) |
| `api.sync.syncAttemptsBatch` | Mutation | `{ attempts: Array<{ localId, quizId, status, score?, correctAnswers?, totalQuestions, startedAt, submittedAt?, answers: Array<{ questionId, selectedChoiceId?, answeredAt? }> }> }` | Batch uploads and authoritatively grades multiple offline quiz attempts in 1 atomic write per attempt |
| `api.sync.syncUserPresets` | Mutation | `{ presets: Array<{ localId, type, title, iconName?, lessonIds, subjectNames?, questionCount?, timeLimitSeconds?, isShuffled?, createdAt, updatedAt }> }` | Batch synchronizes custom student decks and quiz presets cross-device |
| `api.sync.syncUserStreaks` | Mutation | `{ currentStreak, longestStreak, lastActiveDate }` | Synchronizes student study streaks and consistency records |

---

## 4. Seeding & Purging ALE Exam Data

Seed scripts are protected as `internalMutation`s inside `convex/_seed/` to prevent public execution via client DevTools or unauthenticated network requests. They can only be executed via the Convex CLI or Convex Cloud Dashboard.

### A. Seed Curriculum Hierarchy
```bash
npx convex run _seed/curriculum:seedCurriculumFromExcel
```

### B. Seed Genuine Mock Assessments, Questions & Achievements
All seeded review questions, drills, flashcards, study notes, and achievements contain `[Seed]` or `[Mock]` in their name:
```bash
npx convex run _seed/assessments:seedMockAssessmentsAndMaterials
```

### C. Clean-Up / Purge Seed Data for Production
To cleanly delete all seeded test records when production review content is ready:
```bash
npx convex run _seed/assessments:deleteMockSeedData
```

### D. Promote User to Administrator (CLI Only)
```bash
npx convex run _seed/curriculum:promoteUserToAdmin '{"email": "your_email@example.com"}'
```

---

## 5. Security & Architectural Patterns

The backend enforces the following security and storage patterns:

1. **Embedded Attempt Storage (99% Write Amplification Reduction):** Rather than writing 100+ individual documents to a normalized `quizAnswers` table on each submission, `quizAttempts` embeds the graded `answers` array directly. This reduces writes from 101 to 1 per attempt, prevents write quota exhaustion, and allows O(1) single-document reads on exam review.
2. **Composite Indexing:** High-frequency lookups utilize targeted composite indexes to eliminate memory and B-tree scans:
   - `quizAnswers`: `.index("by_attempt_and_question", ["attemptId", "questionId"])` (Eliminates O(N) linear filter scans in `recordAnswer`).
   - `questions`: `.index("by_subject_and_published", ["subjectId", "isPublished"])` and `.index("by_topic_and_published", ["topicId", "isPublished"])`.
   - `quizzes`: `.index("by_type_and_published", ["type", "isPublished"])` and `.index("by_published", ["isPublished"])`.
3. **Private Backend Modules (`_helpers/`):** Modules prefixed with an underscore (such as `_helpers/auth.ts`, `_helpers/crypto.ts`, `_helpers/ResendOTP.ts`) are internal to Convex and are excluded from the public client `api.*` code-generation.
4. **Internal-Only Administrative Tools (`_seed/`):** Destructive seeding or account promotion functions use `internalMutation`, making them inaccessible from client apps and restricted to authenticated CLI/Dashboard developers.
5. **Anti-Cheat Data Sanitization:** Endpoints returning questions for active test-taking (`api.quizzes.getQuizWithQuestionsOnline` and `api.questions.getQuestionsForPractice`) omit plain text `correctChoiceId`. They supply precomputed `correctChoiceHash` values generated via Web Crypto SHA-256 for instant client verification without exposing answers in plain text.
6. **Rate Limiting:** Critical mutations (`startQuizAttempt`, `recordAnswer`) are token-bucket rate-limited.

---

## 6. Automated Backend Testing

Tests run against an in-memory execution context via `convex-test` and Vitest.

### Running Tests
To run the test suite once:
```bash
npm run test
```

To run tests in watch mode:
```bash
npx vitest
```

### Setup Overview
*   **Test Runner:** [Vitest](https://vitest.dev/) (defined in `vitest.config.ts`)
*   **Mock Database:** `convex-test` (manages mock clients, mock database transactions, and component mocking)
*   **Test File Location:** Backend tests are located inside `convex/__tests__/` (e.g., [attempts.test.ts](file:///c:/Users/Adrian/Desktop/Folders/websites/archiapp/react-native-repo/convex/__tests__/attempts.test.ts)).

### Writing a New Test (Template)
To add a test suite, place a file in `convex/__tests__/`:

```typescript
import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "../_generated/api";
import schema from "../schema";
import { register as registerRateLimiter } from "@convex-dev/rate-limiter/test";

test("Module description under test", async () => {
  // 1. Initialize in-memory DB and register backend functions
  const t = convexTest(schema, import.meta.glob("../**/*.ts"));
  
  // 2. Register required components
  registerRateLimiter(t, "ratelimiter");

  // 3. Setup Mock Identities (User Auth Context)
  const student = t.withIdentity({ subject: "student_a_subject" });
  const studentId = await student.mutation(api.users.storeUser, { username: "stud_a" });

  // 4. Assert behavior
  const profile = await student.query(api.users.getCurrentUserProfile);
  expect(profile).not.toBeNull();
  expect(profile!.username).toBe("stud_a");
});
```

