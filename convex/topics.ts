import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireContentManager } from "./authHelpers";

/**
 * Fetches published topics for a given subject sorted by order.
 */
export const listTopicsBySubject = query({
  args: { subjectId: v.id("subjects") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("topics")
      .withIndex("by_subject_and_order", (q) => q.eq("subjectId", args.subjectId))
      .filter((q) => q.eq(q.field("isPublished"), true))
      .collect();
  },
});

/**
 * Fetches topic details by ID.
 */
export const getTopicById = query({
  args: { topicId: v.id("topics") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.topicId);
  },
});

/**
 * Mutation: Create a new Topic under a Subject (Requires content_manager or admin).
 */
export const createTopic = mutation({
  args: {
    subjectId: v.id("subjects"),
    name: v.string(),
    description: v.optional(v.string()),
    order: v.number(),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireContentManager(ctx);
    const now = Date.now();

    const topicId = await ctx.db.insert("topics", {
      subjectId: args.subjectId,
      name: args.name,
      description: args.description,
      order: args.order,
      isPublished: args.isPublished ?? false,
      createdAt: now,
      updatedAt: now,
    });

    return topicId;
  },
});

/**
 * Mutation: Update existing topic metadata or visibility.
 */
export const updateTopic = mutation({
  args: {
    topicId: v.id("topics"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    order: v.optional(v.number()),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireContentManager(ctx);
    const now = Date.now();

    await ctx.db.patch(args.topicId, {
      ...(args.name !== undefined && { name: args.name }),
      ...(args.description !== undefined && { description: args.description }),
      ...(args.order !== undefined && { order: args.order }),
      ...(args.isPublished !== undefined && { isPublished: args.isPublished }),
      updatedAt: now,
    });

    return { success: true };
  },
});
