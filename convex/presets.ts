import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser, requireUser } from "./_helpers/auth";

/**
 * Public/Student query: Fetches user presets by type (flashcard, quiz, or exam).
 */
export const getUserPresets = query({
  args: {
    type: v.union(v.literal("flashcard"), v.literal("quiz"), v.literal("exam")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const presets = await ctx.db
      .query("userPresets")
      .withIndex("by_user_and_type", (q) =>
        q.eq("userId", user._id).eq("type", args.type)
      )
      .order("desc")
      .collect();

    return presets.map((p) => ({
      id: p._id,
      userId: p.userId,
      type: p.type,
      title: p.title,
      iconName: p.iconName,
      lessonIds: p.lessonIds,
      subjectNames: p.subjectNames,
      questionCount: p.questionCount,
      timeLimitSeconds: p.timeLimitSeconds,
      isShuffled: p.isShuffled,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
  },
});

/**
 * Mutation: Create or update a student preset online in real time.
 */
export const saveUserPreset = mutation({
  args: {
    id: v.optional(v.string()),
    type: v.union(v.literal("flashcard"), v.literal("quiz"), v.literal("exam")),
    title: v.string(),
    iconName: v.optional(v.string()),
    lessonIds: v.array(v.string()),
    subjectNames: v.optional(v.array(v.string())),
    questionCount: v.optional(v.number()),
    timeLimitSeconds: v.optional(v.number()),
    isShuffled: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const now = Date.now();

    if (args.id) {
      try {
        const existing = (await ctx.db.get(args.id as any)) as any;
        if (existing && existing.userId === user._id) {
          await ctx.db.patch(existing._id, {
            title: args.title,
            iconName: args.iconName,
            lessonIds: args.lessonIds,
            subjectNames: args.subjectNames,
            questionCount: args.questionCount,
            timeLimitSeconds: args.timeLimitSeconds,
            isShuffled: args.isShuffled,
            updatedAt: now,
          });
          return existing._id;
        }
      } catch {
        // Not a valid convex ID, fall through to insert
      }
    }

    const presetId = await ctx.db.insert("userPresets", {
      userId: user._id,
      type: args.type,
      title: args.title,
      iconName: args.iconName,
      lessonIds: args.lessonIds,
      subjectNames: args.subjectNames,
      questionCount: args.questionCount,
      timeLimitSeconds: args.timeLimitSeconds,
      isShuffled: args.isShuffled,
      createdAt: now,
      updatedAt: now,
    });

    return presetId;
  },
});

/**
 * Mutation: Delete a student preset by document ID.
 */
export const deleteUserPreset = mutation({
  args: { presetId: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    try {
      const preset = (await ctx.db.get(args.presetId as any)) as any;
      if (preset && preset.userId === user._id) {
        await ctx.db.delete(preset._id);
        return { success: true };
      }
    } catch {
      // not a convex ID
    }

    // fallback: find by title or search
    const allPresets = await ctx.db
      .query("userPresets")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    const found = allPresets.find((p) => p._id === args.presetId);
    if (found) {
      await ctx.db.delete(found._id);
      return { success: true };
    }

    return { success: false };
  },
});
