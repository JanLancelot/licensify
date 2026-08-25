import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireContentManager } from "./authHelpers";

/**
 * Fetches published lessons for a given topic sorted by order.
 */
export const listLessonsByTopic = query({
  args: { topicId: v.id("topics") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("lessons")
      .withIndex("by_topic_and_order", (q) => q.eq("topicId", args.topicId))
      .filter((q) => q.eq(q.field("isPublished"), true))
      .collect();
  },
});

/**
 * Fetches published lessons for a given subject.
 */
export const listLessonsBySubject = query({
  args: { subjectId: v.id("subjects") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("lessons")
      .withIndex("by_subject", (q) => q.eq("subjectId", args.subjectId))
      .filter((q) => q.eq(q.field("isPublished"), true))
      .collect();
  },
});

/**
 * Fetches lesson details by ID.
 */
export const getLessonById = query({
  args: { lessonId: v.id("lessons") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.lessonId);
  },
});

/**
 * Mutation: Create a new Lesson under a Topic (Requires content_manager or admin).
 */
export const createLesson = mutation({
  args: {
    subjectId: v.id("subjects"),
    topicId: v.id("topics"),
    name: v.string(),
    description: v.optional(v.string()),
    order: v.number(),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireContentManager(ctx);
    const now = Date.now();

    const lessonId = await ctx.db.insert("lessons", {
      subjectId: args.subjectId,
      topicId: args.topicId,
      name: args.name,
      description: args.description,
      order: args.order,
      isPublished: args.isPublished ?? true,
      createdAt: now,
      updatedAt: now,
    });

    return lessonId;
  },
});

/**
 * Mutation: Update existing lesson metadata or visibility.
 */
export const updateLesson = mutation({
  args: {
    lessonId: v.id("lessons"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    order: v.optional(v.number()),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireContentManager(ctx);
    const now = Date.now();

    await ctx.db.patch(args.lessonId, {
      ...(args.name !== undefined && { name: args.name }),
      ...(args.description !== undefined && { description: args.description }),
      ...(args.order !== undefined && { order: args.order }),
      ...(args.isPublished !== undefined && { isPublished: args.isPublished }),
      updatedAt: now,
    });

    return { success: true };
  },
});

/**
 * Admin/Content Manager query: Fetches all lessons, optionally filtered by topicId or subjectId.
 */
export const listAllLessonsAdmin = query({
  args: {
    topicId: v.optional(v.id("topics")),
    subjectId: v.optional(v.id("subjects")),
  },
  handler: async (ctx, args) => {
    await requireContentManager(ctx);

    if (args.topicId) {
      return await ctx.db
        .query("lessons")
        .withIndex("by_topic", (q) => q.eq("topicId", args.topicId!))
        .collect();
    }

    if (args.subjectId) {
      return await ctx.db
        .query("lessons")
        .withIndex("by_subject", (q) => q.eq("subjectId", args.subjectId!))
        .collect();
    }

    return await ctx.db.query("lessons").collect();
  },
});

/**
 * Mutation: Delete a Lesson (Requires content_manager or admin).
 */
export const deleteLesson = mutation({
  args: { lessonId: v.id("lessons") },
  handler: async (ctx, args) => {
    await requireContentManager(ctx);
    await ctx.db.delete(args.lessonId);
    return { success: true };
  },
});
