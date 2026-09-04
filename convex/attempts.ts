import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUser } from "./authHelpers";
import { RateLimiter, MINUTE } from "@convex-dev/rate-limiter";
import { components } from "./_generated/api";

const rateLimiter = new RateLimiter((components as any).ratelimiter, {
  startQuizAttempt: { kind: "token bucket", rate: 5, period: MINUTE, capacity: 5 },
  recordAnswer: { kind: "token bucket", rate: 60, period: MINUTE, capacity: 20 },
});

/**
 * Mutation: Start a new attempt for a quiz or mock exam.
 */
export const startQuizAttempt = mutation({
  args: { quizId: v.id("quizzes") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const { ok, retryAfter } = await rateLimiter.limit(ctx, "startQuizAttempt", {
      key: user._id,
    });
    if (!ok) {
      throw new Error(`Too many quiz attempts. Please try again in ${Math.round(retryAfter / 1000)}s.`);
    }

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

    const { ok, retryAfter } = await rateLimiter.limit(ctx, "recordAnswer", {
      key: user._id,
    });
    if (!ok) {
      throw new Error(`Rate limit exceeded. Please wait ${Math.round(retryAfter / 1000)}s before submitting another answer.`);
    }

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

    const validChoice = question.choices.find(c => c.id === args.selectedChoiceId);
    if (!validChoice) {
      throw new Error("Invalid answer choice ID.");
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
    const user = await requireUser(ctx);
    const attempt = await ctx.db.get(args.attemptId);
    if (!attempt) return null;

    if (attempt.userId !== user._id) {
      throw new Error("Unauthorized to view this attempt");
    }

    const quiz = await getQuizDoc(ctx, attempt.quizId);
    const answers = await ctx.db
      .query("quizAnswers")
      .withIndex("by_attempt", (q) => q.eq("attemptId", args.attemptId))
      .collect();

    return {
      ...attempt,
      quizTitle: quiz?.title ?? (typeof attempt.quizId === "string" ? attempt.quizId : "Practice Quiz"),
      answers,
    };
  },
});

/**
 * Safe helper: fetches quiz doc if valid Convex ID, otherwise returns null.
 */
async function getQuizDoc(ctx: any, quizId: string) {
  try {
    return (await ctx.db.get(quizId as any)) as any;
  } catch {
    return null;
  }
}

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
        const quiz = await getQuizDoc(ctx, att.quizId);
        return {
          ...att,
          quizTitle: quiz?.title ?? (typeof att.quizId === "string" ? att.quizId : "Practice Quiz"),
          quizType: quiz?.type ?? "practice",
        };
      })
    );
  },
});

/**
 * Direct Online Attempt Submission:
 * Receives answers, calculates score on server, records attempt and answers,
 * and updates user study streak in real time.
 */
export const submitAttemptDirect = mutation({
  args: {
    quizId: v.string(),
    answers: v.array(
      v.object({
        questionId: v.string(),
        selectedChoiceId: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const now = Date.now();

    // 1. Fetch questions to grade
    const questionIds = args.answers.map((a) => a.questionId);
    const questions = await Promise.all(
      questionIds.map(async (qId) => {
        try {
          return await ctx.db.get(qId as any);
        } catch {
          return null;
        }
      })
    );
    const questionMap = new Map<string, any>();
    questions.forEach((q) => {
      if (q) questionMap.set(q._id, q);
    });

    let correctAnswers = 0;
    for (const ans of args.answers) {
      const qDoc = questionMap.get(ans.questionId);
      if (qDoc && qDoc.correctChoiceId === ans.selectedChoiceId) {
        correctAnswers++;
      }
    }

    const totalQuestions = args.answers.length > 0 ? args.answers.length : 1;
    const score = Math.round((correctAnswers / totalQuestions) * 100);

    // 2. Insert attempt record
    const attemptId = await ctx.db.insert("quizAttempts", {
      userId: user._id,
      quizId: args.quizId,
      status: "submitted",
      score,
      correctAnswers,
      totalQuestions: args.answers.length,
      startedAt: now,
      submittedAt: now,
    });

    // 3. Insert individual answer records
    for (const ans of args.answers) {
      const qDoc = questionMap.get(ans.questionId);
      const isCorrect = qDoc ? qDoc.correctChoiceId === ans.selectedChoiceId : false;
      try {
        await ctx.db.insert("quizAnswers", {
          attemptId,
          questionId: ans.questionId as any,
          selectedChoiceId: ans.selectedChoiceId,
          isCorrect,
          answeredAt: now,
        });
      } catch {
        // ignore malformed questionId reference
      }
    }

    // 4. Update or create user streak
    const todayStr = new Date().toISOString().split("T")[0];
    const existingStreak = await ctx.db
      .query("userStreaks")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (existingStreak) {
      let newStreak = existingStreak.currentStreak;
      if (existingStreak.lastActiveDate !== todayStr) {
        newStreak = existingStreak.currentStreak + 1;
      }
      await ctx.db.patch(existingStreak._id, {
        currentStreak: newStreak,
        longestStreak: Math.max(existingStreak.longestStreak, newStreak),
        lastActiveDate: todayStr,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("userStreaks", {
        userId: user._id,
        currentStreak: 1,
        longestStreak: 1,
        lastActiveDate: todayStr,
        updatedAt: now,
      });
    }

    return {
      attemptId,
      score,
      correctAnswers,
      totalQuestions: args.answers.length,
    };
  },
});

