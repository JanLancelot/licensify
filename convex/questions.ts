import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
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
