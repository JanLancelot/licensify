import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "../_generated/api";
import schema from "../schema";

import { register as registerRateLimiter } from "@convex-dev/rate-limiter/test";

test("Backend Security and Robustness Tests", async () => {
  const t = convexTest(schema, import.meta.glob("../**/*.ts"));
  registerRateLimiter(t, "ratelimiter");

  // --------------------------------------------------------
  // Setup: Create users and seed subjects/quizzes/questions
  // --------------------------------------------------------
  const admin = t.withIdentity({ subject: "admin_user" });
  const adminId = await admin.mutation(api.users.storeUser, {
    username: "admin_dev",
  });
  // Manually update role to admin in database to allow creating quizzes/questions
  await t.run(async (ctx) => {
    await ctx.db.patch(adminId, { role: "admin" });
  });

  const studentA = t.withIdentity({ subject: "student_a" });
  const studentAId = await studentA.mutation(api.users.storeUser, {
    username: "student_a",
  });

  const studentB = t.withIdentity({ subject: "student_b" });
  const studentBId = await studentB.mutation(api.users.storeUser, {
    username: "student_b",
  });

  // Create a subject
  const subjectId = await admin.mutation(api.subjects.createSubject, {
    name: "Architectural Practice",
    description: "ALE Practice questions",
    order: 1,
    isPublished: true,
  });

  // Create questions
  const questionId = await admin.mutation(api.questions.createQuestion, {
    subjectId,
    question: "What is the maximum height of a building under Zone R-1?",
    choices: [
      { id: "choice_1", text: "9 meters" },
      { id: "choice_2", text: "10 meters" },
    ],
    correctChoiceId: "choice_1",
    difficulty: "medium",
    isPublished: true,
  });

  // Create a quiz
  const quizId = await admin.mutation(api.quizzes.createQuiz, {
    title: "Practice Exam 1",
    type: "practice",
    subjectId,
    questionIds: [questionId],
    isPublished: true,
  });

  // --------------------------------------------------------
  // Test 1: Data Sanitization (Anti-Cheating)
  // --------------------------------------------------------
  const quizData = await studentA.query(api.quizzes.getQuizWithQuestions, {
    quizId,
  });
  expect(quizData).not.toBeNull();
  expect(quizData!.questions[0]).not.toHaveProperty("correctChoiceId");
  expect(quizData!.questions[0]).not.toHaveProperty("explanation");
  expect(quizData!.questions[0].choices.length).toBe(2);

  // --------------------------------------------------------
  // Test 2: IDOR Protection
  // --------------------------------------------------------
  const attemptId = await studentA.mutation(api.attempts.startQuizAttempt, {
    quizId,
  });

  // Student B attempts to query Student A's quiz attempt details
  await expect(
    studentB.query(api.attempts.getAttemptWithAnswers, { attemptId })
  ).rejects.toThrow("Unauthorized to view this attempt");

  // Student A can view their own attempt successfully
  const myAttempt = await studentA.query(api.attempts.getAttemptWithAnswers, {
    attemptId,
  });
  expect(myAttempt).not.toBeNull();
  expect(myAttempt!.userId).toBe(studentAId);

  // --------------------------------------------------------
  // Test 3: Invalid Data Injection (Choice Validation)
  // --------------------------------------------------------
  await expect(
    studentA.mutation(api.attempts.recordAnswer, {
      attemptId,
      questionId,
      selectedChoiceId: "choice_fake", // Invalid choice
    })
  ).rejects.toThrow("Invalid answer choice ID.");

  // Recording a valid answer choice succeeds
  const answerId = await studentA.mutation(api.attempts.recordAnswer, {
    attemptId,
    questionId,
    selectedChoiceId: "choice_1",
  });
  expect(answerId).not.toBeNull();

  // --------------------------------------------------------
  // Test 4: Rate Limiting
  // --------------------------------------------------------
  // Trigger attempts repeatedly.
  // The startQuizAttempt rate-limiter capacity is 5.
  // 1st request was done above (attemptId).
  // Perform 4 more successful starts.
  for (let i = 0; i < 4; i++) {
    await studentA.mutation(api.attempts.startQuizAttempt, { quizId });
  }

  // The 6th request must trigger the rate limit error
  await expect(
    studentA.mutation(api.attempts.startQuizAttempt, { quizId })
  ).rejects.toThrow(/Too many quiz attempts/);

  // --------------------------------------------------------
  // Test 5: Practice Quiz Generation Bounds Check
  // --------------------------------------------------------
  await expect(
    admin.mutation(api.quizzes.generatePracticeQuiz, {
      title: "Oversized Quiz",
      subjectId,
      questionCount: 150, // Exceeds 100 limit
    })
  ).rejects.toThrow("Maximum 100 questions allowed per practice quiz.");

  // --------------------------------------------------------
  // Test 6: Answer Submission Rate Limiter
  // --------------------------------------------------------
  // The capacity for recordAnswer is 20.
  // Student B starts an attempt so they can answer.
  const studentBAttempt = await studentB.mutation(api.attempts.startQuizAttempt, { quizId });
  
  // Record 20 valid answers (this drains the token bucket)
  for (let i = 0; i < 20; i++) {
    await studentB.mutation(api.attempts.recordAnswer, {
      attemptId: studentBAttempt,
      questionId,
      selectedChoiceId: "choice_1"
    });
  }

  // The 21st answer must trigger the rate limit error
  await expect(
    studentB.mutation(api.attempts.recordAnswer, {
      attemptId: studentBAttempt,
      questionId,
      selectedChoiceId: "choice_1"
    })
  ).rejects.toThrow(/Rate limit exceeded/);

  // --------------------------------------------------------
  // Test 7: Embedded Answers Atomic Storage
  // --------------------------------------------------------
  const directSubmission = await studentA.mutation(api.attempts.submitAttemptDirect, {
    quizId: "comprehensive-set-1",
    answers: [
      { questionId: questionId as string, selectedChoiceId: "choice_1" },
    ],
  });
  expect(directSubmission.score).toBe(100);
  expect(directSubmission.correctAnswers).toBe(1);

  // Verify attempt has answers embedded directly in the attempt document
  const directAttemptDoc = await t.run(async (ctx) => {
    return await ctx.db.get(directSubmission.attemptId);
  });
  expect(directAttemptDoc).not.toBeNull();
  expect(directAttemptDoc!.answers).toBeDefined();
  expect(directAttemptDoc!.answers!.length).toBe(1);
  expect(directAttemptDoc!.answers![0].isCorrect).toBe(true);

  // --------------------------------------------------------
  // Test 8: Sanitization in Online Quiz Queries (Anti-Cheat)
  // --------------------------------------------------------
  const onlineQuizData = await studentA.query(api.quizzes.getQuizWithQuestionsOnline, {
    quizId,
  });
  expect(onlineQuizData).not.toBeNull();
  expect(onlineQuizData!.questions.length).toBeGreaterThan(0);
  expect(onlineQuizData!.questions[0]).not.toHaveProperty("correctChoiceId");
  expect(onlineQuizData!.questions[0]).toHaveProperty("correctChoiceHash");
});
