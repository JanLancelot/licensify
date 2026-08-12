import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireContentManager } from "./authHelpers";

/**
 * Public/Student query: Fetches published reviewer materials for a subject.
 */
export const listMaterialsBySubject = query({
  args: { subjectId: v.id("subjects") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("materials")
      .withIndex("by_subject", (q) => q.eq("subjectId", args.subjectId))
      .filter((q) => q.eq(q.field("isPublished"), true))
      .collect();
  },
});

/**
 * Public/Student query: Fetches published reviewer materials for a specific topic.
 */
export const listMaterialsByTopic = query({
  args: { topicId: v.id("topics") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("materials")
      .withIndex("by_topic", (q) => q.eq("topicId", args.topicId))
      .filter((q) => q.eq(q.field("isPublished"), true))
      .collect();
  },
});

/**
 * Fetches single material document and resolves Convex Storage download URL if file attached.
 */
export const getMaterialById = query({
  args: { materialId: v.id("materials") },
  handler: async (ctx, args) => {
    const material = await ctx.db.get(args.materialId);
    if (!material) return null;

    let fileUrl: string | null = null;
    if (material.storageId) {
      fileUrl = await ctx.storage.getUrl(material.storageId);
    }

    return {
      ...material,
      fileUrl,
    };
  },
});

/**
 * Mutation: Generates short-lived upload URL for uploading PDFs/images to Convex Storage.
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireContentManager(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Mutation: Create a new Reviewer Material document.
 */
export const createMaterial = mutation({
  args: {
    subjectId: v.id("subjects"),
    topicId: v.optional(v.id("topics")),
    title: v.string(),
    description: v.optional(v.string()),
    type: v.union(
      v.literal("article"),
      v.literal("pdf"),
      v.literal("image"),
      v.literal("document")
    ),
    content: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await requireContentManager(ctx);
    const now = Date.now();

    const materialId = await ctx.db.insert("materials", {
      subjectId: args.subjectId,
      topicId: args.topicId,
      title: args.title,
      description: args.description,
      type: args.type,
      content: args.content,
      storageId: args.storageId,
      isPublished: args.isPublished ?? false,
      createdBy: user._id,
      createdAt: now,
      updatedAt: now,
    });

    return materialId;
  },
});
