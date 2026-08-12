import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUser } from "./authHelpers";

/**
 * Mutation: Start a new attempt for a quiz or mock exam.
 */
export const startQuizAttempt = mutation({
  args: { quizId: v.id("quizzes") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const quiz = await ctx.db.get(args.quizId);

    if (!quiz) {
      throw new Error("Quiz not found.");
    }

    const now = Date.now();

    const attemptId = await ctx.db.insert("quizAttempts", {
      userId: user._id,
      quizId: args.quizId,
      status: "in_progress",
      totalQuestions: quiz.questionIds.length,
      startedAt: now,
    });

    return attemptId;
  },
});

/**
 * Mutation: Record or update an answer choice selected by the student.
 */
export const recordAnswer = mutation({
  args: {
    attemptId: v.id("quizAttempts"),
    questionId: v.id("questions"),
    selectedChoiceId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const attempt = await ctx.db.get(args.attemptId);

    if (!attempt || attempt.userId !== user._id) {
      throw new Error("Unauthorized or invalid quiz attempt.");
    }

    if (attempt.status !== "in_progress") {
      throw new Error("Cannot record answer: Quiz attempt is already submitted or expired.");
    }

    const question = await ctx.db.get(args.questionId);
    if (!question) {
      throw new Error("Question not found.");
    }

    // Check correctness against question's correctChoiceId
    const isCorrect = question.correctChoiceId === args.selectedChoiceId;
    const now = Date.now();

    // Look for existing answer in this attempt
    const existingAnswer = await ctx.db
      .query("quizAnswers")
      .withIndex("by_attempt", (q) => q.eq("attemptId", args.attemptId))
      .filter((q) => q.eq(q.field("questionId"), args.questionId))
      .first();

    if (existingAnswer) {
      await ctx.db.patch(existingAnswer._id, {
        selectedChoiceId: args.selectedChoiceId,
        isCorrect,
        answeredAt: now,
      });
      return existingAnswer._id;
    } else {
      const answerId = await ctx.db.insert("quizAnswers", {
        attemptId: args.attemptId,
        questionId: args.questionId,
        selectedChoiceId: args.selectedChoiceId,
        isCorrect,
        answeredAt: now,
      });
      return answerId;
    }
  },
});

/**
 * Mutation: Submit quiz attempt, calculate score, and finalize attempt record.
 */
export const submitQuizAttempt = mutation({
  args: { attemptId: v.id("quizAttempts") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const attempt = await ctx.db.get(args.attemptId);

    if (!attempt || attempt.userId !== user._id) {
      throw new Error("Unauthorized or invalid attempt.");
    }

    if (attempt.status !== "in_progress") {
      return { status: attempt.status, score: attempt.score };
    }

    // Fetch all recorded answers for this attempt
    const answers = await ctx.db
      .query("quizAnswers")
      .withIndex("by_attempt", (q) => q.eq("attemptId", args.attemptId))
      .collect();

    const correctAnswers = answers.filter((a) => a.isCorrect === true).length;
    const totalQuestions = attempt.totalQuestions > 0 ? attempt.totalQuestions : 1;
    const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100);

    const now = Date.now();

    await ctx.db.patch(args.attemptId, {
      status: "submitted",
      correctAnswers,
      score: scorePercentage,
      submittedAt: now,
    });

    return {
      attemptId: args.attemptId,
      status: "submitted",
      correctAnswers,
      totalQuestions: attempt.totalQuestions,
      score: scorePercentage,
    };
  },
});

/**
 * Query: Get full details of an attempt, including score breakdown and graded question list.
 */
export const getAttemptWithAnswers = query({
  args: { attemptId: v.id("quizAttempts") },
  handler: async (ctx, args) => {
    const attempt = await ctx.db.get(args.attemptId);
    if (!attempt) return null;

    const quiz = await ctx.db.get(attempt.quizId);
    const answers = await ctx.db
      .query("quizAnswers")
      .withIndex("by_attempt", (q) => q.eq("attemptId", args.attemptId))
      .collect();

    return {
      ...attempt,
      quizTitle: quiz?.title ?? "Practice Quiz",
      answers,
    };
  },
});

/**
 * Query: Fetch history of all quiz attempts for the logged-in student.
 */
export const getUserQuizHistory = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    const attempts = await ctx.db
      .query("quizAttempts")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    return await Promise.all(
      attempts.map(async (att) => {
        const quiz = await ctx.db.get(att.quizId);
        return {
          ...att,
          quizTitle: quiz?.title ?? "Practice Quiz",
          quizType: quiz?.type ?? "practice",
        };
      })
    );
  },
});
