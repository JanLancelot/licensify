# Architectural & Database Changes Documentation

This document provides a comprehensive technical reference for the curriculum hierarchy restructuring across `feat/add-lessons-db` and `feat/update-admin-and-db-with-lessons-and-branches`.

---

## 1. 📐 Curriculum Structure Evolution

### Initial State (2-Tier)
```
Subject (Level 1) ──► Topic (Level 2)
```

### Upgrade 1: `feat/add-lessons-db` (3-Tier)
```
Subject (Level 1) ──► Topic (Level 2) ──► Lesson (Level 3)
```

### Upgrade 2: `feat/update-admin-and-db-with-lessons-and-branches` (Hybrid 4-Level)
```
Subject (Level 1, Required)
  ├── Branch (Level 1.5, Optional e.g., "Laws & Regulations" under Professional Practice)
  │     └── Topic (Level 2)
  │           └── Lesson (Level 3)
  └── Topic (Level 2, for subjects without branches)
        └── Lesson (Level 3)
```

---

## 2. 🗄️ Database & Schema Specifications

### Convex Cloud Schema ([`convex/schema.ts`](file:///g:/Codes/RedStartup/react-native-repo/convex/schema.ts))

1. **`branches` Table**:
   - `subjectId`: `v.id("subjects")`
   - `name`: `v.string()`
   - `description`: `v.optional(v.string())`
   - `order`: `v.number()`
   - `isPublished`: `v.boolean()`
   - `createdAt`: `v.number()`, `updatedAt`: `v.number()`
   - **Indexes**: `by_subject` (`["subjectId"]`), `by_subject_and_order` (`["subjectId", "order"]`)

2. **`lessons` Table**:
   - `subjectId`: `v.id("subjects")`
   - `branchId`: `v.optional(v.id("branches"))`
   - `topicId`: `v.id("topics")`
   - `name`: `v.string()`
   - `description`: `v.optional(v.string())`
   - `order`: `v.number()`
   - `isPublished`: `v.boolean()`
   - `createdAt`: `v.number()`, `updatedAt`: `v.number()`
   - **Indexes**: `by_topic` (`["topicId"]`), `by_branch` (`["branchId"]`), `by_topic_and_order` (`["topicId", "order"]`), `by_subject` (`["subjectId"]`)

3. **Optional `branchId` & `lessonId` Foreign Keys**:
   - Added `branchId: v.optional(v.id("branches"))` and `.index("by_branch", ["branchId"])` to: `topics`, `lessons`, `materials`, `flashcards`, `questions`, `quizzes`.
   - Added `lessonId: v.optional(v.id("lessons"))` and `.index("by_lesson", ["lessonId"])` to: `materials`, `flashcards`, `questions`, `quizzes`.

### Offline SQLite Schema ([`src/db/schema.ts`](file:///g:/Codes/RedStartup/react-native-repo/src/db/schema.ts))
- Mirrored `branches` table with Drizzle ORM `sqliteTable`.
- Added `branchId` and `lessonId` columns across all content tables (`topics`, `lessons`, `materials`, `flashcards`, `questions`, `quizzes`).

---

## 3. ⚙️ Convex Backend API Modules

### `convex/branches.ts`
- `listBranchesBySubject`: Public query for published branches of a subject.
- `listAllBranchesAdmin`: Admin query for branch list (uses system auth helper).
- `getBranchById`: Get single branch details.
- `createBranch`: Mutation to insert a new branch under a subject.
- `updateBranch`: Mutation to modify branch metadata.
- `deleteBranch`: Mutation to delete branch and cascade-delete child topics/lessons.

### `convex/lessons.ts`
- `listLessonsByTopic`: Query lessons under a specific topic.
- `listLessonsBySubject`: Query lessons under a subject.
- `listAllLessonsAdmin`: Admin query for all lessons.
- `createLesson`, `updateLesson`, `deleteLesson`: Full CRUD management.

### `convex/topics.ts`
- Updated `createTopic` and `updateTopic` to accept `branchId` and `subjectId`.
- **Re-assignment & Cascade**: When `subjectId` or `branchId` is updated on a topic, `updateTopic` automatically cascades the new `subjectId` and `branchId` down to all child lessons belonging to that topic.

### `convex/subjects.ts`
- `getSubjectWithHierarchy`: Fetches subject metadata with nested published branches, topics, and lessons.

### `convex/seed.ts`
- `seedDatabase` / `seedCurriculumFromExcel`: Seeding mutation supporting admin user lookup (`system_admin_seed`), required `createdBy: admin._id` on subjects, and complete ALE curriculum data.
- `promoteUserToAdmin`: Utility mutation for staff role promotion.

---

## 4. 🖥️ Next.js Admin Web Dashboard (`admin/src/app/`)

### 1. Curriculum Management ([`curriculum/page.tsx`](file:///g:/Codes/RedStartup/react-native-repo/admin/src/app/curriculum/page.tsx))
- **Hybrid Accordion UI**: Renders Subjects (Level 1), optional Branches (Level 1.5), Topics (Level 2), and Lessons (Level 3).
- **Topic Edit Modal**:
  - `Parent Subject Area` dropdown.
  - `Branch (Optional)` dropdown dynamically filtered based on selected subject.
- **Branch Modal**: Dedicated dialog to create/edit subject branches.
- **Cascade Deletion Modal**: Prompt confirming deletion of Subjects, Branches, Topics, or Lessons.

### 2. Content Management Pages
- **Materials ([`materials/page.tsx`](file:///g:/Codes/RedStartup/react-native-repo/admin/src/app/materials/page.tsx))**: Filter & tag selection with Subject, Branch, Topic, and Lesson selectors.
- **Questions ([`questions/page.tsx`](file:///g:/Codes/RedStartup/react-native-repo/admin/src/app/questions/page.tsx))**: Question bank tagging down to specific lesson & branch level.
- **Flashcards ([`flashcards/page.tsx`](file:///g:/Codes/RedStartup/react-native-repo/admin/src/app/flashcards/page.tsx))**: Flashcard tagging down to specific lesson & branch level.
- **Quizzes ([`quizzes/page.tsx`](file:///g:/Codes/RedStartup/react-native-repo/admin/src/app/quizzes/page.tsx))**: Practice exam builder with Subject, Branch, Topic, and Lesson targeting.

---

## 5. 🛠️ Client Sync & High-Performance Offline Engine

### 1. High-Performance Sync Backend ([`convex/sync.ts`](file:///c:/Users/Adrian/Desktop/Folders/websites/archiapp/react-native-repo/convex/sync.ts))
- `getSyncBundle`: In 1 atomic database query, fetches all published `subjects`, `branches`, `topics`, `lessons`, `materials`, `flashcards`, `questions`, and `quizzes`.
- Precomputes SHA-256 answer choices via Web Crypto API for zero-trust client answer verification.
- Implements Delta Syncing via `sinceTimestamp` to return `{ upToDate: true }` instantly (<50ms) when unchanged.
- `syncAttemptsBatch`: Accepts and authoritatively grades multiple offline quiz attempts and answers in 1 batch mutation.

### 2. Client Offline Sync Service ([`src/services/useSyncService.ts`](file:///c:/Users/Adrian/Desktop/Folders/websites/archiapp/react-native-repo/src/services/useSyncService.ts))
- Ingests data using chunked Drizzle batch operations (`db.insert().values(chunk).onConflictDoUpdate()`) across SQLite tables in milliseconds.
- Replaces 100+ nested sequential network roundtrips with a single fast query.
- Tracks `lastSyncedAt` in SQLite `sync_metadata` table.
