import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUser } from "./authHelpers";

/**
 * Public/Student query: Fetches all currently active study rooms.
 */
export const listActiveRooms = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("studyRooms")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();
  },
});

/**
 * Fetches study room details along with active participant roster.
 */
export const getRoomDetails = query({
  args: { roomId: v.id("studyRooms") },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) return null;

    const members = await ctx.db
      .query("studyRoomMembers")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Populate user profile info for members
    const populatedMembers = await Promise.all(
      members.map(async (m) => {
        const u = await ctx.db.get(m.userId);
        return {
          ...m,
          username: u?.username ?? "Student",
          profileImageId: u?.profileImageId,
        };
      })
    );

    return {
      ...room,
      activeMemberCount: populatedMembers.length,
      members: populatedMembers,
    };
  },
});

/**
 * Mutation: Create a new collaborative study room.
 */
export const createStudyRoom = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    subjectId: v.optional(v.id("subjects")),
    maxParticipants: v.optional(v.number()),
    isPrivate: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const now = Date.now();

    // Unique LiveKit RTC provider room name
    const providerRoomName = `ale_room_${now}_${Math.random().toString(36).substring(2, 7)}`;

    const roomId = await ctx.db.insert("studyRooms", {
      name: args.name,
      description: args.description,
      createdBy: user._id,
      subjectId: args.subjectId,
      providerRoomName,
      status: "active",
      maxParticipants: args.maxParticipants ?? 10,
      isPrivate: args.isPrivate ?? false,
      createdAt: now,
    });

    // Automatically add creator as host member
    await ctx.db.insert("studyRoomMembers", {
      roomId,
      userId: user._id,
      role: "host",
      joinedAt: now,
      isActive: true,
    });

    return { roomId, providerRoomName };
  },
});

/**
 * Mutation: Join an active study room.
 */
export const joinRoom = mutation({
  args: { roomId: v.id("studyRooms") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const room = await ctx.db.get(args.roomId);

    if (!room || room.status !== "active") {
      throw new Error("Study room is no longer active or does not exist.");
    }

    const now = Date.now();

    // Check existing membership record
    const existing = await ctx.db
      .query("studyRoomMembers")
      .withIndex("by_room_and_user", (q) =>
        q.eq("roomId", args.roomId).eq("userId", user._id)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        isActive: true,
        joinedAt: now,
        leftAt: undefined,
      });
    } else {
      await ctx.db.insert("studyRoomMembers", {
        roomId: args.roomId,
        userId: user._id,
        role: "participant",
        joinedAt: now,
        isActive: true,
      });
    }

    return { providerRoomName: room.providerRoomName };
  },
});

/**
 * Mutation: Leave a study room.
 */
export const leaveRoom = mutation({
  args: { roomId: v.id("studyRooms") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const existing = await ctx.db
      .query("studyRoomMembers")
      .withIndex("by_room_and_user", (q) =>
        q.eq("roomId", args.roomId).eq("userId", user._id)
      )
      .first();

    if (existing && existing.isActive) {
      await ctx.db.patch(existing._id, {
        isActive: false,
        leftAt: Date.now(),
      });
    }

    return { success: true };
  },
});
