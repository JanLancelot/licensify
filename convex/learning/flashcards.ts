import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { requireContentManager } from "../_helpers/authHelpers";

/**
 * Public/Student query: Fetches published flashcards by Subject.
 */
export const getFlashcardsBySubject = query({
  args: { subjectId: v.id("subjects") },
  handler: async (ctx, args) => {
    const cards = await ctx.db
      .query("flashcards")
      .withIndex("by_subject", (q) => q.eq("subjectId", args.subjectId))
      .filter((q) => q.eq(q.field("isPublished"), true))
      .collect();

    // Resolve optional image URLs
    return await Promise.all(
      cards.map(async (card) => {
        let imageUrl: string | null = null;
        if (card.imageId) {
          imageUrl = await ctx.storage.getUrl(card.imageId);
        }
        return { ...card, imageUrl };
      })
    );
  },
});

/**
 * Public/Student query: Fetches published flashcards by Topic.
 */
export const getFlashcardsByTopic = query({
  args: { topicId: v.id("topics") },
  handler: async (ctx, args) => {
    const cards = await ctx.db
      .query("flashcards")
      .withIndex("by_topic", (q) => q.eq("topicId", args.topicId))
      .filter((q) => q.eq(q.field("isPublished"), true))
      .collect();

    return await Promise.all(
      cards.map(async (card) => {
        let imageUrl: string | null = null;
        if (card.imageId) {
          imageUrl = await ctx.storage.getUrl(card.imageId);
        }
        return { ...card, imageUrl };
      })
    );
  },
});

/**
 * Mutation: Create a new Flashcard (Requires content_manager or admin).
 */
export const createFlashcard = mutation({
  args: {
    subjectId: v.id("subjects"),
    topicId: v.optional(v.id("topics")),
    front: v.string(),
    back: v.string(),
    imageId: v.optional(v.id("_storage")),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await requireContentManager(ctx);
    const now = Date.now();

    const flashcardId = await ctx.db.insert("flashcards", {
      subjectId: args.subjectId,
      topicId: args.topicId,
      front: args.front,
      back: args.back,
      imageId: args.imageId,
      isPublished: args.isPublished ?? true,
      createdBy: user._id,
      createdAt: now,
      updatedAt: now,
    });

    return flashcardId;
  },
});

/**
 * Mutation: Delete a Flashcard.
 */
export const deleteFlashcard = mutation({
  args: { flashcardId: v.id("flashcards") },
  handler: async (ctx, args) => {
    await requireContentManager(ctx);
    await ctx.db.delete(args.flashcardId);
    return { success: true };
  },
});

/**
 * Admin query: Fetch all flashcards (drafts & published) with optional subject/topic filters.
 */
export const listAllFlashcardsAdmin = query({
  args: {
    subjectId: v.optional(v.id("subjects")),
    topicId: v.optional(v.id("topics")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    await requireContentManager(ctx);


    let cards;
    if (args.subjectId) {
      cards = await ctx.db
        .query("flashcards")
        .withIndex("by_subject", (q) => q.eq("subjectId", args.subjectId!))
        .collect();
    } else if (args.topicId) {
      cards = await ctx.db
        .query("flashcards")
        .withIndex("by_topic", (q) => q.eq("topicId", args.topicId!))
        .collect();
    } else {
      cards = await ctx.db.query("flashcards").collect();
    }

    if (args.subjectId && args.topicId) {
      cards = cards.filter((c) => c.topicId === args.topicId);
    }

    return await Promise.all(
      cards.map(async (card) => {
        let imageUrl: string | null = null;
        if (card.imageId) {
          imageUrl = await ctx.storage.getUrl(card.imageId);
        }
        return { ...card, imageUrl };
      })
    );
  },
});

/**
 * Admin mutation: Update flashcard.
 */
export const updateFlashcard = mutation({
  args: {
    flashcardId: v.id("flashcards"),
    subjectId: v.optional(v.id("subjects")),
    topicId: v.optional(v.id("topics")),
    front: v.optional(v.string()),
    back: v.optional(v.string()),
    imageId: v.optional(v.id("_storage")),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireContentManager(ctx);
    const now = Date.now();

    await ctx.db.patch(args.flashcardId, {
      ...(args.subjectId !== undefined && { subjectId: args.subjectId }),
      ...(args.topicId !== undefined && { topicId: args.topicId }),
      ...(args.front !== undefined && { front: args.front }),
      ...(args.back !== undefined && { back: args.back }),
      ...(args.imageId !== undefined && { imageId: args.imageId }),
      ...(args.isPublished !== undefined && { isPublished: args.isPublished }),
      updatedAt: now,
    });

    return { success: true };
  },
});

