import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser, requireUser } from "./_helpers/auth";

/**
 * Public/Student query: Fetches notifications for the logged-in user.
 */
export const getUserNotifications = query({
  args: { unreadOnly: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

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

/**
 * Mutation: Send a study room invite notification to another user.
 */
export const inviteUserToStudyRoom = mutation({
  args: {
    targetUserId: v.id("users"),
    roomId: v.id("studyRooms"),
  },
  handler: async (ctx, args) => {
    const sender = await requireUser(ctx);
    const room = await ctx.db.get(args.roomId);

    if (!room || room.status !== "active") {
      throw new Error("Study room is not active.");
    }

    const now = Date.now();
    const title = "Study Room Invite";
    const body = `${sender.username} invited you to join "${room.name}" study session!`;

    const notificationId = await ctx.db.insert("notifications", {
      userId: args.targetUserId,
      type: "study_room",
      title,
      body,
      data: {
        type: "study_room",
        roomId: args.roomId,
        inviterName: sender.username,
      },
      isRead: false,
      createdAt: now,
    });

    return { success: true, notificationId };
  },
});

/**
 * Background / Admin Mutation: Triggers automated study reminders to active users.
 */
export const triggerStudyReminders = mutation({
  args: {},
  handler: async (ctx) => {
    const activeUsers = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const now = Date.now();
    let sentCount = 0;

    for (const user of activeUsers) {
      await ctx.db.insert("notifications", {
        userId: user._id,
        type: "exam",
        title: "Daily ALE Board Exam Study Reminder",
        body: "Time for your daily practice quiz! Keep your streak alive.",
        data: { type: "exam" },
        isRead: false,
        createdAt: now,
      });
      sentCount++;
    }

    return { success: true, count: sentCount };
  },
});

