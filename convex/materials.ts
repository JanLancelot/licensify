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
    lessonId: v.optional(v.id("lessons")),
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
      lessonId: args.lessonId,
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

/**
 * Admin query: Fetch all materials (including drafts), optionally filtered by subject, topic, or lesson.
 */
export const listAllMaterialsAdmin = query({
  args: {
    subjectId: v.optional(v.id("subjects")),
    topicId: v.optional(v.id("topics")),
    lessonId: v.optional(v.id("lessons")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    await requireContentManager(ctx);

    let materials;
    if (args.lessonId) {
      materials = await ctx.db
        .query("materials")
        .withIndex("by_lesson", (q) => q.eq("lessonId", args.lessonId!))
        .collect();
    } else if (args.subjectId) {
      materials = await ctx.db
        .query("materials")
        .withIndex("by_subject", (q) => q.eq("subjectId", args.subjectId!))
        .collect();
    } else if (args.topicId) {
      materials = await ctx.db
        .query("materials")
        .withIndex("by_topic", (q) => q.eq("topicId", args.topicId!))
        .collect();
    } else {
      materials = await ctx.db.query("materials").collect();
    }

    if (args.subjectId && args.topicId) {
      materials = materials.filter((m) => m.topicId === args.topicId);
    }
    if (args.lessonId) {
      materials = materials.filter((m) => m.lessonId === args.lessonId);
    }

    return await Promise.all(
      materials.map(async (m) => {
        let fileUrl: string | null = null;
        if (m.storageId) {
          fileUrl = await ctx.storage.getUrl(m.storageId);
        }
        return { ...m, fileUrl };
      })
    );
  },
});

/**
 * Admin mutation: Update material metadata or content.
 */
export const updateMaterial = mutation({
  args: {
    materialId: v.id("materials"),
    subjectId: v.optional(v.id("subjects")),
    topicId: v.optional(v.id("topics")),
    lessonId: v.optional(v.id("lessons")),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    type: v.optional(
      v.union(
        v.literal("article"),
        v.literal("pdf"),
        v.literal("image"),
        v.literal("document")
      )
    ),
    content: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireContentManager(ctx);
    const now = Date.now();

    await ctx.db.patch(args.materialId, {
      ...(args.subjectId !== undefined && { subjectId: args.subjectId }),
      ...(args.topicId !== undefined && { topicId: args.topicId }),
      ...(args.lessonId !== undefined && { lessonId: args.lessonId }),
      ...(args.title !== undefined && { title: args.title }),
      ...(args.description !== undefined && { description: args.description }),
      ...(args.type !== undefined && { type: args.type }),
      ...(args.content !== undefined && { content: args.content }),
      ...(args.storageId !== undefined && { storageId: args.storageId }),
      ...(args.isPublished !== undefined && { isPublished: args.isPublished }),
      updatedAt: now,
    });

    return { success: true };
  },
});

/**
 * Admin mutation: Delete a material document.
 */
export const deleteMaterial = mutation({
  args: { materialId: v.id("materials") },
  handler: async (ctx, args) => {
    await requireContentManager(ctx);
    await ctx.db.delete(args.materialId);
    return { success: true };
  },
});

