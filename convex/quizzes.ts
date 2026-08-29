import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireContentManager, requireUser } from "./authHelpers";
import { paginationOptsValidator } from "convex/server";

/**
 * Public/Student query: Fetches all published quizzes for offline sync.
 */
export const listAllPublishedQuizzes = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("quizzes").collect();
  },
});

/**
 * Public/Student query: List published quizzes filtered by type (practice or mock_exam).
 */
export const listQuizzes = query({
  args: {
    type: v.optional(v.union(v.literal("practice"), v.literal("mock_exam"))),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    let quizQuery = ctx.db.query("quizzes").filter((q) => q.neq(q.field("isPublished"), false));

    if (args.type) {
      return await ctx.db
        .query("quizzes")
        .withIndex("by_type", (q) => q.eq("type", args.type!))
        .filter((q) => q.neq(q.field("isPublished"), false))
        .paginate(args.paginationOpts);
    }

    return await quizQuery.paginate(args.paginationOpts);
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

    // Filter out deleted/null questions and strip sensitive fields
    const validQuestions = questions
      .filter((q) => q !== null && q.isPublished)
      .map((q) => {
        // Remove correctChoiceId and explanation so they don't leak to the client
        const { correctChoiceId, explanation, ...safeQuestion } = q!;
        return safeQuestion;
      });

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
    lessonId: v.optional(v.id("lessons")),
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
      lessonId: args.lessonId,
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

    if (args.questionCount > 100) {
      throw new Error("Maximum 100 questions allowed per practice quiz.");
    }

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

/**
 * Admin query: Fetch all quizzes (practice & mock exams, drafts & published).
 */
export const listAllQuizzesAdmin = query({
  args: {
    type: v.optional(v.union(v.literal("practice"), v.literal("mock_exam"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    await requireContentManager(ctx);


    if (args.type) {
      return await ctx.db
        .query("quizzes")
        .withIndex("by_type", (q) => q.eq("type", args.type!))
        .collect();
    }

    return await ctx.db.query("quizzes").collect();
  },
});

/**
 * Admin query: Fetch a quiz with full question details including correctChoiceId & explanation for editing.
 */
export const getQuizWithQuestionsAdmin = query({
  args: { quizId: v.id("quizzes") },
  handler: async (ctx, args) => {
    await requireContentManager(ctx);
    const quiz = await ctx.db.get(args.quizId);
    if (!quiz) return null;

    const questions = await Promise.all(
      quiz.questionIds.map(async (qId) => await ctx.db.get(qId))
    );

    return {
      ...quiz,
      questions: questions.filter((q) => q !== null),
    };
  },
});

/**
 * Admin mutation: Update quiz.
 */
export const updateQuiz = mutation({
  args: {
    quizId: v.id("quizzes"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    type: v.optional(v.union(v.literal("practice"), v.literal("mock_exam"))),
    subjectId: v.optional(v.id("subjects")),
    topicId: v.optional(v.id("topics")),
    lessonId: v.optional(v.id("lessons")),
    questionIds: v.optional(v.array(v.id("questions"))),
    timeLimitSeconds: v.optional(v.number()),
    passingScore: v.optional(v.number()),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireContentManager(ctx);
    const now = Date.now();

    await ctx.db.patch(args.quizId, {
      ...(args.title !== undefined && { title: args.title }),
      ...(args.description !== undefined && { description: args.description }),
      ...(args.type !== undefined && { type: args.type }),
      ...(args.subjectId !== undefined && { subjectId: args.subjectId }),
      ...(args.topicId !== undefined && { topicId: args.topicId }),
      ...(args.lessonId !== undefined && { lessonId: args.lessonId }),
      ...(args.questionIds !== undefined && { questionIds: args.questionIds }),
      ...(args.timeLimitSeconds !== undefined && { timeLimitSeconds: args.timeLimitSeconds }),
      ...(args.passingScore !== undefined && { passingScore: args.passingScore }),
      ...(args.isPublished !== undefined && { isPublished: args.isPublished }),
      updatedAt: now,
    });

    return { success: true };
  },
});

/**
 * Admin mutation: Delete a quiz.
 */
export const deleteQuiz = mutation({
  args: { quizId: v.id("quizzes") },
  handler: async (ctx, args) => {
    await requireContentManager(ctx);
    await ctx.db.delete(args.quizId);
    return { success: true };
  },
});

