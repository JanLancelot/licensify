import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { requireContentManager } from "./authHelpers";

/**
 * Public query: Fetch published branches for a specific subject area, sorted by order.
 */
export const listBranchesBySubject = query({
  args: { subjectId: v.id("subjects") },
  handler: async (ctx, args) => {
    const branches = await ctx.db
      .query("branches")
      .withIndex("by_subject", (q) => q.eq("subjectId", args.subjectId))
      .collect();

    return branches
      .filter((b) => b.isPublished)
      .sort((a, b) => a.order - b.order);
  },
});

/**
 * Admin query: Fetch all branches for admin dashboard, optionally filtered by subject area.
 */
export const listAllBranchesAdmin = query({
  args: { subjectId: v.optional(v.id("subjects")) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    await requireContentManager(ctx);

    let branches;
    if (args.subjectId) {
      branches = await ctx.db
        .query("branches")
        .withIndex("by_subject", (q) => q.eq("subjectId", args.subjectId!))
        .collect();
    } else {
      branches = await ctx.db.query("branches").collect();
    }

    return branches.sort((a, b) => a.order - b.order);
  },
});

/**
 * Query: Get single branch by ID.
 */
export const getBranchById = query({
  args: { branchId: v.id("branches") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.branchId);
  },
});

/**
 * Mutation: Create a new Branch under a Subject (Requires content_manager or admin).
 */
export const createBranch = mutation({
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

    const branchId = await ctx.db.insert("branches", {
      subjectId: args.subjectId,
      name: args.name,
      description: args.description,
      order: args.order,
      isPublished: args.isPublished ?? true,
      createdAt: now,
      updatedAt: now,
    });

    return branchId;
  },
});

/**
 * Mutation: Update branch metadata.
 */
export const updateBranch = mutation({
  args: {
    branchId: v.id("branches"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    order: v.optional(v.number()),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireContentManager(ctx);
    const now = Date.now();

    await ctx.db.patch(args.branchId, {
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
 * Mutation: Delete a branch (and associated topics/lessons).
 */
export const deleteBranch = mutation({
  args: { branchId: v.id("branches") },
  handler: async (ctx, args) => {
    await requireContentManager(ctx);

    // Delete topics under this branch
    const topics = await ctx.db
      .query("topics")
      .withIndex("by_branch", (q) => q.eq("branchId", args.branchId))
      .collect();

    for (const t of topics) {
      // Delete lessons under topic
      const lessons = await ctx.db
        .query("lessons")
        .withIndex("by_topic", (q) => q.eq("topicId", t._id))
        .collect();
      for (const l of lessons) {
        await ctx.db.delete(l._id);
      }
      await ctx.db.delete(t._id);
    }

    await ctx.db.delete(args.branchId);
    return { success: true };
  },
});
