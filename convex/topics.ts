import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireContentManager } from "./_helpers/auth";

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
    branchId: v.optional(v.id("branches")),
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
      branchId: args.branchId,
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
    subjectId: v.optional(v.id("subjects")),
    branchId: v.optional(v.union(v.id("branches"), v.null())),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    order: v.optional(v.number()),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireContentManager(ctx);
    const now = Date.now();

    const targetBranchId = args.branchId === null ? undefined : args.branchId;

    await ctx.db.patch(args.topicId, {
      ...(args.subjectId !== undefined && { subjectId: args.subjectId }),
      ...(args.branchId !== undefined && { branchId: targetBranchId }),
      ...(args.name !== undefined && { name: args.name }),
      ...(args.description !== undefined && { description: args.description }),
      ...(args.order !== undefined && { order: args.order }),
      ...(args.isPublished !== undefined && { isPublished: args.isPublished }),
      updatedAt: now,
    });

    // Cascade update subjectId and branchId to all lessons under this topic
    if (args.subjectId !== undefined || args.branchId !== undefined) {
      const topicLessons = await ctx.db
        .query("lessons")
        .withIndex("by_topic", (q) => q.eq("topicId", args.topicId))
        .collect();

      for (const les of topicLessons) {
        await ctx.db.patch(les._id, {
          ...(args.subjectId !== undefined && { subjectId: args.subjectId }),
          ...(args.branchId !== undefined && { branchId: targetBranchId }),
          updatedAt: now,
        });
      }
    }

    return { success: true };
  },
});

/**
 * Admin/Content Manager query: Fetches all topics, optionally filtered by subjectId.
 */
export const listAllTopicsAdmin = query({
  args: { subjectId: v.optional(v.id("subjects")) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    await requireContentManager(ctx);

    if (args.subjectId) {
      return await ctx.db
        .query("topics")
        .withIndex("by_subject", (q) => q.eq("subjectId", args.subjectId!))
        .collect();
    }

    return await ctx.db.query("topics").collect();
  },
});


/**
 * Mutation: Delete a Topic (Requires content_manager or admin).
 */
export const deleteTopic = mutation({
  args: { topicId: v.id("topics") },
  handler: async (ctx, args) => {
    await requireContentManager(ctx);
    await ctx.db.delete(args.topicId);
    return { success: true };
  },
});

