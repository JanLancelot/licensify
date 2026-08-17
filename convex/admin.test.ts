import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";
import { register as registerRateLimiter } from "@convex-dev/rate-limiter/test";

test("Admin Dashboard & Content Management API Tests", async () => {
  const t = convexTest(schema, import.meta.glob("./**/*.ts"));
  registerRateLimiter(t, "ratelimiter");

  // 1. Create Admin & Student users
  const adminAuth = t.withIdentity({
    subject: "auth_admin_test",
    email: "admin_test@reapp.com",
    name: "Master Admin",
  });
  const adminId = await adminAuth.mutation(api.users.storeUser, {
    username: "admin_test",
  });
  await t.run(async (ctx) => {
    await ctx.db.patch(adminId, { role: "admin" });
  });

  const studentAuth = t.withIdentity({
    subject: "auth_student_test",
    email: "student_test@reapp.com",
  });
  await studentAuth.mutation(api.users.storeUser, {
    username: "student_test",
  });

  // 2. Student cannot access admin dashboard stats (returns null)
  const studentStats = await studentAuth.query(api.admin.getDashboardStats);
  expect(studentStats).toBeNull();


  // 3. Admin can retrieve dashboard stats
  const initialStats = await adminAuth.query(api.admin.getDashboardStats);
  expect(initialStats!.totals.subjects).toBe(0);
  expect(initialStats!.totals.questions).toBe(0);


  // 4. Admin Subject & Topic CRUD
  const subjectId = await adminAuth.mutation(api.subjects.createSubject, {
    name: "Architectural Design & Site Planning",
    description: "Area 3 board exam coverage",
    order: 1,
    isPublished: true,
  });
  expect(subjectId).toBeDefined();

  const topicId = await adminAuth.mutation(api.topics.createTopic, {
    subjectId,
    name: "Space Planning & Programming",
    description: "Core architectural concepts",
    order: 1,
    isPublished: true,
  });
  expect(topicId).toBeDefined();

  const topicsList = await adminAuth.query(api.topics.listAllTopicsAdmin, { subjectId });
  expect(topicsList.length).toBe(1);

  // 5. Admin Question Bank & Bulk Import
  const singleQId = await adminAuth.mutation(api.questions.createQuestion, {
    subjectId,
    topicId,
    question: "What is the standard clearance for an accessible corridor?",
    choices: [
      { id: "a", text: "900mm" },
      { id: "b", text: "1200mm" },
      { id: "c", text: "1500mm" },
      { id: "d", text: "1800mm" },
    ],
    correctChoiceId: "b",
    difficulty: "easy",
    explanation: "BP 344 recommends a minimum clear width of 1200mm.",
    isPublished: true,
  });
  expect(singleQId).toBeDefined();

  // Test Bulk Import
  const bulkResult = await adminAuth.mutation(api.questions.bulkCreateQuestions, {
    items: [
      {
        subjectId,
        topicId,
        question: "Bulk imported question 1",
        choices: [
          { id: "c1", text: "Choice 1" },
          { id: "c2", text: "Choice 2" },
        ],
        correctChoiceId: "c1",
        difficulty: "medium",
        isPublished: true,
      },
      {
        subjectId,
        topicId,
        question: "Bulk imported question 2",
        choices: [
          { id: "c1", text: "Choice A" },
          { id: "c2", text: "Choice B" },
        ],
        correctChoiceId: "c2",
        difficulty: "hard",
        isPublished: false,
      },
    ],
  });
  expect(bulkResult.count).toBe(2);

  // Filter questions
  const allQuestions = await adminAuth.query(api.questions.listAllQuestionsAdmin, {});
  expect(allQuestions.length).toBe(3);

  // Update question
  await adminAuth.mutation(api.questions.updateQuestion, {
    questionId: singleQId,
    difficulty: "medium",
  });
  const updatedQ = await adminAuth.query(api.questions.getQuestionByIdAdmin, { questionId: singleQId });
  expect(updatedQ?.difficulty).toBe("medium");

  // 6. Study Materials & Flashcards
  const matId = await adminAuth.mutation(api.materials.createMaterial, {
    subjectId,
    topicId,
    title: "BP 344 Accessibility Law Summary",
    type: "article",
    content: "# BP 344 Accessibility Law\nKey specifications and architectural dimensions.",
    isPublished: true,
  });
  expect(matId).toBeDefined();

  const flashcardId = await adminAuth.mutation(api.flashcards.createFlashcard, {
    subjectId,
    topicId,
    front: "Minimum stair width for occupant load > 50?",
    back: "1120 mm (NBCP)",
    isPublished: true,
  });
  expect(flashcardId).toBeDefined();

  // 7. Quizzes / Mock Exams
  const quizId = await adminAuth.mutation(api.quizzes.createQuiz, {
    title: "ALE Area 3 Mock Diagnostic",
    type: "mock_exam",
    subjectId,
    topicId,
    questionIds: [singleQId],
    timeLimitSeconds: 3600,
    passingScore: 70,
    isPublished: true,
  });
  expect(quizId).toBeDefined();

  const quizzesList = await adminAuth.query(api.quizzes.listAllQuizzesAdmin, {});
  expect(quizzesList.length).toBe(1);

  // 8. Re-check dashboard stats
  const finalStats = await adminAuth.query(api.admin.getDashboardStats);
  expect(finalStats!.totals.subjects).toBe(1);
  expect(finalStats!.totals.topics).toBe(1);
  expect(finalStats!.totals.questions).toBe(3);
  expect(finalStats!.totals.materials).toBe(1);
  expect(finalStats!.totals.flashcards).toBe(1);
  expect(finalStats!.totals.quizzes).toBe(1);
});

