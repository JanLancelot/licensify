import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { requireContentManager } from "./authHelpers";

/**
 * Public/Student query: Fetches questions by Subject.
 */
export const listQuestionsBySubject = query({
  args: { subjectId: v.id("subjects") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("questions")
      .withIndex("by_subject", (q) => q.eq("subjectId", args.subjectId))
      .filter((q) => q.eq(q.field("isPublished"), true))
      .collect();
  },
});

/**
 * Public/Student query: Fetches questions by Topic.
 */
export const listQuestionsByTopic = query({
  args: { topicId: v.id("topics") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("questions")
      .withIndex("by_topic", (q) => q.eq("topicId", args.topicId))
      .filter((q) => q.eq(q.field("isPublished"), true))
      .collect();
  },
});

/**
 * Mutation: Create a new Board Exam Question document (Requires content_manager or admin).
 */
export const createQuestion = mutation({
  args: {
    subjectId: v.id("subjects"),
    topicId: v.optional(v.id("topics")),
    question: v.string(),
    questionImageId: v.optional(v.id("_storage")),
    choices: v.array(
      v.object({
        id: v.string(),
        text: v.string(),
        imageId: v.optional(v.id("_storage")),
      })
    ),
    correctChoiceId: v.string(),
    explanation: v.optional(v.string()),
    difficulty: v.union(
      v.literal("easy"),
      v.literal("medium"),
      v.literal("hard")
    ),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await requireContentManager(ctx);
    const now = Date.now();

    // Validate that correctChoiceId matches one of the choices
    const isValidChoice = args.choices.some((c) => c.id === args.correctChoiceId);
    if (!isValidChoice) {
      throw new Error("Invalid correctChoiceId: must match one of the choices' IDs.");
    }

    const questionId = await ctx.db.insert("questions", {
      subjectId: args.subjectId,
      topicId: args.topicId,
      question: args.question,
      questionImageId: args.questionImageId,
      choices: args.choices,
      correctChoiceId: args.correctChoiceId,
      explanation: args.explanation,
      difficulty: args.difficulty,
      isPublished: args.isPublished ?? true,
      createdBy: user._id,
      createdAt: now,
      updatedAt: now,
    });

    return questionId;
  },
});

/**
 * Admin query: List questions with optional filtering by subject, topic, difficulty, or search text.
 */
export const listAllQuestionsAdmin = query({
  args: {
    subjectId: v.optional(v.id("subjects")),
    topicId: v.optional(v.id("topics")),
    difficulty: v.optional(v.union(v.literal("easy"), v.literal("medium"), v.literal("hard"))),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    await requireContentManager(ctx);


    let questionsQuery = ctx.db.query("questions");

    let questions;
    if (args.subjectId) {
      questions = await questionsQuery
        .withIndex("by_subject", (q) => q.eq("subjectId", args.subjectId!))
        .collect();
    } else if (args.topicId) {
      questions = await questionsQuery
        .withIndex("by_topic", (q) => q.eq("topicId", args.topicId!))
        .collect();
    } else if (args.difficulty) {
      questions = await questionsQuery
        .withIndex("by_difficulty", (q) => q.eq("difficulty", args.difficulty!))
        .collect();
    } else {
      questions = await questionsQuery.collect();
    }

    if (args.topicId && args.subjectId) {
      questions = questions.filter((q) => q.topicId === args.topicId);
    }
    if (args.difficulty && (args.subjectId || args.topicId)) {
      questions = questions.filter((q) => q.difficulty === args.difficulty);
    }
    if (args.search && args.search.trim().length > 0) {
      const lower = args.search.trim().toLowerCase();
      questions = questions.filter(
        (q) =>
          q.question.toLowerCase().includes(lower) ||
          q.explanation?.toLowerCase().includes(lower) ||
          q.choices.some((c) => c.text.toLowerCase().includes(lower))
      );
    }

    return questions.sort((a, b) => b.createdAt - a.createdAt);
  },
});

/**
 * Admin query: Get question by ID with full details (including correctChoiceId & explanation).
 */
export const getQuestionByIdAdmin = query({
  args: { questionId: v.id("questions") },
  handler: async (ctx, args) => {
    await requireContentManager(ctx);
    return await ctx.db.get(args.questionId);
  },
});

/**
 * Admin mutation: Update question.
 */
export const updateQuestion = mutation({
  args: {
    questionId: v.id("questions"),
    subjectId: v.optional(v.id("subjects")),
    topicId: v.optional(v.id("topics")),
    question: v.optional(v.string()),
    questionImageId: v.optional(v.id("_storage")),
    choices: v.optional(
      v.array(
        v.object({
          id: v.string(),
          text: v.string(),
          imageId: v.optional(v.id("_storage")),
        })
      )
    ),
    correctChoiceId: v.optional(v.string()),
    explanation: v.optional(v.string()),
    difficulty: v.optional(
      v.union(v.literal("easy"), v.literal("medium"), v.literal("hard"))
    ),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireContentManager(ctx);
    const now = Date.now();

    const existing = await ctx.db.get(args.questionId);
    if (!existing) {
      throw new Error("Question not found.");
    }

    const currentChoices = args.choices ?? existing.choices;
    const correctId = args.correctChoiceId ?? existing.correctChoiceId;

    if (args.choices || args.correctChoiceId) {
      const isValid = currentChoices.some((c) => c.id === correctId);
      if (!isValid) {
        throw new Error("Invalid correctChoiceId: must match one of the choices' IDs.");
      }
    }

    await ctx.db.patch(args.questionId, {
      ...(args.subjectId !== undefined && { subjectId: args.subjectId }),
      ...(args.topicId !== undefined && { topicId: args.topicId }),
      ...(args.question !== undefined && { question: args.question }),
      ...(args.questionImageId !== undefined && { questionImageId: args.questionImageId }),
      ...(args.choices !== undefined && { choices: args.choices }),
      ...(args.correctChoiceId !== undefined && { correctChoiceId: args.correctChoiceId }),
      ...(args.explanation !== undefined && { explanation: args.explanation }),
      ...(args.difficulty !== undefined && { difficulty: args.difficulty }),
      ...(args.isPublished !== undefined && { isPublished: args.isPublished }),
      updatedAt: now,
    });

    return { success: true };
  },
});

/**
 * Admin mutation: Delete question.
 */
export const deleteQuestion = mutation({
  args: { questionId: v.id("questions") },
  handler: async (ctx, args) => {
    await requireContentManager(ctx);
    await ctx.db.delete(args.questionId);
    return { success: true };
  },
});

/**
 * Admin mutation: Bulk create questions from imported data (JSON/CSV parsed array).
 */
export const bulkCreateQuestions = mutation({
  args: {
    items: v.array(
      v.object({
        subjectId: v.id("subjects"),
        topicId: v.optional(v.id("topics")),
        question: v.string(),
        choices: v.array(
          v.object({
            id: v.string(),
            text: v.string(),
          })
        ),
        correctChoiceId: v.string(),
        explanation: v.optional(v.string()),
        difficulty: v.union(
          v.literal("easy"),
          v.literal("medium"),
          v.literal("hard")
        ),
        isPublished: v.optional(v.boolean()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const user = await requireContentManager(ctx);
    const now = Date.now();

    const createdIds: Id<"questions">[] = [];
    for (const item of args.items) {
      const isValidChoice = item.choices.some((c) => c.id === item.correctChoiceId);
      if (!isValidChoice) {
        throw new Error(
          `Validation failed for question "${item.question.slice(0, 30)}...": correctChoiceId "${item.correctChoiceId}" not found in choices.`
        );
      }

      const qId = await ctx.db.insert("questions", {
        subjectId: item.subjectId,
        topicId: item.topicId,
        question: item.question,
        choices: item.choices.map((c) => ({ id: c.id, text: c.text })),
        correctChoiceId: item.correctChoiceId,
        explanation: item.explanation,
        difficulty: item.difficulty,
        isPublished: item.isPublished ?? true,
        createdBy: user._id,
        createdAt: now,
        updatedAt: now,
      });
      createdIds.push(qId);
    }

    return { success: true, count: createdIds.length, ids: createdIds };
  },
});

