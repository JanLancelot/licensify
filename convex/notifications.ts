import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUser } from "./authHelpers";

/**
 * Public/Student query: Fetches notifications for the logged-in user.
 */
export const getUserNotifications = query({
  args: { unreadOnly: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    if (args.unreadOnly) {
      return await ctx.db
        .query("notifications")
        .withIndex("by_user_and_read", (q) =>
          q.eq("userId", user._id).eq("isRead", false)
        )
        .order("desc")
        .collect();
    }

    return await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

/**
 * Mutation: Mark a notification as read.
 */
export const markAsRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const notification = await ctx.db.get(args.notificationId);

    if (!notification || notification.userId !== user._id) {
      throw new Error("Unauthorized or notification not found.");
    }

    await ctx.db.patch(args.notificationId, { isRead: true });
    return { success: true };
  },
});

/**
 * System/Admin mutation: Dispatch a notification to a specific user.
 */
export const sendNotification = mutation({
  args: {
    userId: v.id("users"),
    type: v.union(
      v.literal("announcement"),
      v.literal("study_room"),
      v.literal("exam"),
      v.literal("system")
    ),
    title: v.string(),
    body: v.string(),
    data: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const notificationId = await ctx.db.insert("notifications", {
      userId: args.userId,
      type: args.type,
      title: args.title,
      body: args.body,
      data: args.data,
      isRead: false,
      createdAt: now,
    });

    return notificationId;
  },
});
