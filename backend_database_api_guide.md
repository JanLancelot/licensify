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
| `api.quizzes.listQuizzes` | Query | `{ type?: "practice" \| "mock_exam" }` | List practice quizzes or mock exams |
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

### 🔔 Domain 5: System Notifications (`convex/notifications.ts`)

| Function | Type | Parameters | Description |
|---|---|---|---|
| `api.notifications.getUserNotifications` | Query | `{ unreadOnly?: boolean }` | User notifications list |
| `api.notifications.markAsRead` | Mutation | `{ notificationId }` | Mark notification as read |

---

## 4. Seeding Initial ALE Exam Data

To seed default Architecture Board Exam subjects, topics, flashcards, and questions:

```bash
npx convex run seed:seedDatabase
```
