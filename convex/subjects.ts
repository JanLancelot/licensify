import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireContentManager } from "./authHelpers";

/**
 * Public/Student query: Fetches all published subjects sorted by display order.
 */
export const listPublishedSubjects = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("subjects")
      .withIndex("by_published", (q) => q.eq("isPublished", true))
      .order("asc")
      .collect();
  },
});

/**
 * Admin/Content Manager query: Fetches all subjects (including drafts).
 */
export const listAllSubjects = query({
  args: {},
  handler: async (ctx) => {
    await requireContentManager(ctx);
    return await ctx.db.query("subjects").collect();
  },
});

/**
 * Fetches a single subject by document ID, with its nested published topics.
 */
export const getSubjectWithTopics = query({
  args: { subjectId: v.id("subjects") },
  handler: async (ctx, args) => {
    const subject = await ctx.db.get(args.subjectId);
    if (!subject) return null;

    const topics = await ctx.db
      .query("topics")
      .withIndex("by_subject", (q) => q.eq("subjectId", args.subjectId))
      .filter((q) => q.eq(q.field("isPublished"), true))
      .collect();

    return {
      ...subject,
      topics,
    };
  },
});

/**
 * Mutation: Create a new Board Exam Subject (Requires content_manager or admin role).
 */
export const createSubject = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    imageId: v.optional(v.id("_storage")),
    order: v.number(),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await requireContentManager(ctx);
    const now = Date.now();

    const subjectId = await ctx.db.insert("subjects", {
      name: args.name,
      description: args.description,
      imageId: args.imageId,
      isPublished: args.isPublished ?? false,
      order: args.order,
      createdBy: user._id,
      createdAt: now,
      updatedAt: now,
    });

    return subjectId;
  },
});

/**
 * Mutation: Update existing Subject metadata or publication status.
 */
export const updateSubject = mutation({
  args: {
    subjectId: v.id("subjects"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    imageId: v.optional(v.id("_storage")),
    isPublished: v.optional(v.boolean()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireContentManager(ctx);
    const now = Date.now();

    await ctx.db.patch(args.subjectId, {
      ...(args.name !== undefined && { name: args.name }),
      ...(args.description !== undefined && { description: args.description }),
      ...(args.imageId !== undefined && { imageId: args.imageId }),
      ...(args.isPublished !== undefined && { isPublished: args.isPublished }),
      ...(args.order !== undefined && { order: args.order }),
      updatedAt: now,
    });

    return { success: true };
  },
});

/**
 * Mutation: Delete a Subject (Requires content_manager or admin).
 */
export const deleteSubject = mutation({
  args: { subjectId: v.id("subjects") },
  handler: async (ctx, args) => {
    await requireContentManager(ctx);

    // Check for associated topics
    const topics = await ctx.db
      .query("topics")
      .withIndex("by_subject", (q) => q.eq("subjectId", args.subjectId))
      .collect();

    // Delete associated topics
    for (const topic of topics) {
      await ctx.db.delete(topic._id);
    }

    await ctx.db.delete(args.subjectId);
    return { success: true };
  },
});

