import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireContentManager, requireUser } from "./authHelpers";

/**
 * Public/Student query: List published quizzes filtered by type (practice or mock_exam).
 */
export const listQuizzes = query({
  args: {
    type: v.optional(v.union(v.literal("practice"), v.literal("mock_exam"))),
  },
  handler: async (ctx, args) => {
    let quizQuery = ctx.db.query("quizzes").filter((q) => q.eq(q.field("isPublished"), true));

    if (args.type) {
      return await ctx.db
        .query("quizzes")
        .withIndex("by_type", (q) => q.eq("type", args.type!))
        .filter((q) => q.eq(q.field("isPublished"), true))
        .collect();
    }

    return await quizQuery.collect();
  },
});

/**
 * Fetches a quiz along with all populated question objects.
 */
export const getQuizWithQuestions = query({
  args: { quizId: v.id("quizzes") },
  handler: async (ctx, args) => {
    const quiz = await ctx.db.get(args.quizId);
    if (!quiz) return null;

    // Fetch all question documents in parallel
    const questions = await Promise.all(
      quiz.questionIds.map(async (qId) => await ctx.db.get(qId))
    );

    // Filter out deleted/null questions
    const validQuestions = questions.filter((q) => q !== null && q.isPublished);

    return {
      ...quiz,
      questions: validQuestions,
    };
  },
});

/**
 * Mutation: Curate and create a fixed Quiz or Mock Exam (Content Manager or Admin).
 */
export const createQuiz = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    type: v.union(v.literal("practice"), v.literal("mock_exam")),
    subjectId: v.optional(v.id("subjects")),
    topicId: v.optional(v.id("topics")),
    questionIds: v.array(v.id("questions")),
    timeLimitSeconds: v.optional(v.number()),
    passingScore: v.optional(v.number()),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await requireContentManager(ctx);
    const now = Date.now();

    const quizId = await ctx.db.insert("quizzes", {
      title: args.title,
      description: args.description,
      type: args.type,
      subjectId: args.subjectId,
      topicId: args.topicId,
      questionIds: args.questionIds,
      timeLimitSeconds: args.timeLimitSeconds,
      passingScore: args.passingScore ?? 75, // Default passing score 75%
      isPublished: args.isPublished ?? true,
      createdBy: user._id,
      createdAt: now,
      updatedAt: now,
    });

    return quizId;
  },
});

/**
 * Mutation: Dynamically generate a practice quiz from question pool based on topic and count.
 */
export const generatePracticeQuiz = mutation({
  args: {
    title: v.string(),
    subjectId: v.id("subjects"),
    topicId: v.optional(v.id("topics")),
    questionCount: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const now = Date.now();

    // Query questions matching subject/topic
    let pool = await ctx.db
      .query("questions")
      .withIndex("by_subject", (q) => q.eq("subjectId", args.subjectId))
      .filter((q) => q.eq(q.field("isPublished"), true))
      .collect();

    if (args.topicId) {
      pool = pool.filter((q) => q.topicId === args.topicId);
    }

    if (pool.length === 0) {
      throw new Error("No questions available for selected subject/topic.");
    }

    // Pick random subset up to questionCount
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, args.questionCount);
    const selectedIds = selected.map((q) => q._id);

    const quizId = await ctx.db.insert("quizzes", {
      title: args.title,
      type: "practice",
      subjectId: args.subjectId,
      topicId: args.topicId,
      questionIds: selectedIds,
      isPublished: true,
      createdBy: user._id,
      createdAt: now,
      updatedAt: now,
    });

    return quizId;
  },
});
