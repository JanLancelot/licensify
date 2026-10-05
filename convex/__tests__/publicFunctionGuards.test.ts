import { expect, test } from "vitest";

/**
 * Every public query, mutation and action must check the caller through an
 * auth helper, unless it is listed here as intentionally open. Adding a
 * function to this list requires stating why anonymous access is safe.
 */
const PUBLIC_WITHOUT_AUTH: Record<string, string> = {
  // Published learning content readable before sign-in. Each filters on isPublished.
  "branches:listBranchesBySubject": "published content",
  "flashcards:getFlashcardsBySubject": "published content",
  "flashcards:getFlashcardsByTopic": "published content",
  "flashcards:listPublishedFlashcards": "published content",
  "lessons:listLessonsByTopic": "published content",
  "lessons:listLessonsBySubject": "published content",
  "materials:listMaterialsBySubject": "published content",
  "materials:listMaterialsByTopic": "published content",
  "questions:listAllPublishedQuestions": "published content",
  "questions:listQuestionsBySubject": "published content",
  "questions:listQuestionsByTopic": "published content",
  "questions:getQuestionsForPractice": "published content",
  "quizzes:listAllPublishedQuizzes": "published content",
  "quizzes:listQuizzes": "published content",
  "quizzes:listPublishedQuizzesOnline": "published content",
  "subjects:listPublishedSubjects": "published content",
  "subjects:getFullCurriculum": "published content",
  "topics:listTopicsBySubject": "published content",
  // Study rooms are discoverable by design; responses carry usernames only.
  "rooms:listActiveRooms": "public study room directory",
  "rooms:getRoomDetails": "public study room directory",
};

const AUTH_CHECK =
  /\b(requireUser|requireAdmin|requireContentManager|requireRole|getCurrentUser|canViewDrafts|getAuthUserId)\(/;

const sources = import.meta.glob("../*.ts", { query: "?raw", import: "default", eager: true }) as Record<
  string,
  string
>;

function unguardedPublicFunctions() {
  const found: string[] = [];
  for (const [path, source] of Object.entries(sources)) {
    const module = path.replace("../", "").replace(/\.ts$/, "");
    if (module === "schema" || module === "auth") continue;
    for (const match of source.matchAll(/^export const (\w+) = (query|mutation|action)\(\{/gm)) {
      const end = source.indexOf("\n});", match.index);
      const body = source.slice(match.index, end === -1 ? undefined : end);
      if (!AUTH_CHECK.test(body)) found.push(`${module}:${match[1]}`);
    }
  }
  return found.sort();
}

test("public Convex functions check the caller or are explicitly allowlisted", () => {
  const unexpected = unguardedPublicFunctions().filter((name) => !(name in PUBLIC_WITHOUT_AUTH));
  expect(unexpected).toEqual([]);
});

test("the allowlist has no stale entries", () => {
  const unguarded = new Set(unguardedPublicFunctions());
  expect(Object.keys(PUBLIC_WITHOUT_AUTH).filter((name) => !unguarded.has(name))).toEqual([]);
});
