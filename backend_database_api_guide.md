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
| `api.users.updateProfile` | Mutation | `{ username?, firstName?, lastName?, profileImageId? }` | Updates profile metadata |
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
| `api.sync.getSyncBundle` | Query | `{ sinceTimestamp?: number }` | Fetches entire published curriculum in 1 single atomic query with precomputed SHA-256 choice hashes (supports Delta sync) |
| `api.sync.syncAttemptsBatch` | Mutation | `{ attempts: Array<{ localId, quizId, status, score?, correctAnswers?, totalQuestions, startedAt, submittedAt?, answers: Array<{ questionId, selectedChoiceId?, answeredAt? }> }> }` | Batch uploads and authoritatively grades multiple offline quiz attempts in 1 network call |

---

## 4. Seeding Initial ALE Exam Data

To seed default Architecture Board Exam subjects, topics, flashcards, and questions:

```bash
npx convex run seed:seedDatabase
```

---

## 5. Security Patterns

The backend enforces the following security patterns which the frontend must be aware of:

1. **Pagination Required:** Endpoints returning unbounded lists (e.g., `api.quizzes.listQuizzes`) require `paginationOpts`. The frontend must use Convex's `usePaginatedQuery` hook to interact with these endpoints to prevent memory and bandwidth exhaustion.
2. **IDOR Protection:** Queries fetching user-specific records (e.g., `api.attempts.getAttemptWithAnswers`) enforce strict ownership checks. Ensure you only request attempts owned by the logged-in user, otherwise the API will throw an `Unauthorized` error.
3. **Data Sanitization:** Endpoints that return test or quiz data (e.g., `api.quizzes.getQuizWithQuestions`) automatically strip sensitive fields like `correctChoiceId` and `explanation` to prevent cheating. These fields are only available when the attempt is graded and returned via `api.attempts.submitQuizAttempt`.
4. **Rate Limiting:** Key mutations (`startQuizAttempt`, `recordAnswer`) are rate-limited. Ensure the frontend handles potential `Error("Rate limit exceeded")` exceptions gracefully, especially during network reconnection bursts.

---

## 6. Automated Backend Testing

To ensure the backend functions remain secure, reliable, and regression-free, we have established an automated testing environment. Tests run against a mock database inside an in-memory execution context and do not require a running frontend.

### Running Tests
To run the test suite once (useful for CI/CD checks):
```bash
npm run test
```

To run tests in interactive watch mode (automatically re-runs when files are modified):
```bash
npx vitest
```

### Setup Overview
*   **Test Runner:** [Vitest](https://vitest.dev/) (defined in [vitest.config.ts](file:///c:/Users/Adrian/OneDrive/Desktop/ReApp/react-native-repo/vitest.config.ts))
*   **Mock Database:** `convex-test` (manages mock clients, mock database transactions, and component mocking)
*   **Test File Location:** Backend tests are located inside the `convex/` directory with a `.test.ts` extension (e.g., [attempts.test.ts](file:///c:/Users/Adrian/OneDrive/Desktop/ReApp/react-native-repo/convex/attempts.test.ts)).
*   **Scenarios Covered:**
    1.  **Data Sanitization:** Ensures answer keys (`correctChoiceId` and `explanation`) are stripped from payloads.
    2.  **IDOR Protection:** Validates that users cannot query attempts belonging to others.
    3.  **Invalid Choice Validation:** Asserts that registering invalid choice IDs throws a validation error.
    4.  **Quiz Start Rate Limiter:** Confirms the mutation limits starting too many quiz attempts.
    5.  **Practice Quiz Size Limit:** Verifies that generating a practice quiz with >100 questions is blocked.
    6.  **Answer Submission Rate Limiter:** Confirms that recording answers too quickly triggers the rate limiter.

### Writing a New Test (Template)
If you add new backend functions, create a test file in the `convex/` directory using this template:

```typescript
import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";
import { register as registerRateLimiter } from "@convex-dev/rate-limiter/test";

test("Module description under test", async () => {
  // 1. Initialize in-memory DB and register backend functions
  const t = convexTest(schema, import.meta.glob("./**/*.ts"));
  
  // 2. Register required components (e.g., rate-limiter component)
  registerRateLimiter(t, "ratelimiter");

  // 3. Setup Mock Identities (User Auth Context)
  const student = t.withIdentity({ subject: "student_a_subject" });
  const studentId = await student.mutation(api.users.storeUser, { username: "stud_a" });

  // 4. Perform direct database seeding (if needed) bypassing validation
  await t.run(async (ctx) => {
    await ctx.db.patch(studentId, { role: "student" });
  });

  // 5. Execute queries/mutations and assert output behavior
  const profile = await student.query(api.users.getCurrentUserProfile);
  expect(profile).not.toBeNull();
  expect(profile!.username).toBe("stud_a");
});
```

