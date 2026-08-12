import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser, requireUser, requireAdmin } from "./authHelpers";

/**
 * Upserts the authenticated user into the `users` table upon login.
 * Sets default role to "student" for new accounts.
 */
export const storeUser = mutation({
  args: {
    username: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated call to storeUser");
    }

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();

    const now = Date.now();

    if (existingUser !== null) {
      // Update existing user timestamp & optional fields
      await ctx.db.patch(existingUser._id, {
        updatedAt: now,
        ...(args.username && { username: args.username }),
        ...(args.firstName && { firstName: args.firstName }),
        ...(args.lastName && { lastName: args.lastName }),
      });
      return existingUser._id;
    }

    // Insert new user
    const fallbackUsername =
      args.username ??
      identity.nickname ??
      identity.name ??
      `student_${identity.subject.slice(0, 6)}`;

    const newUserId = await ctx.db.insert("users", {
      userId: identity.subject,
      username: fallbackUsername,
      firstName: args.firstName ?? identity.givenName,
      lastName: args.lastName ?? identity.familyName,
      role: "student", // Default role
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    return newUserId;
  },
});

/**
 * Query to fetch current authenticated user profile document.
 */
export const getCurrentUserProfile = query({
  args: {},
  handler: async (ctx) => {
    return await getCurrentUser(ctx);
  },
});

/**
 * Mutation for users to update their profile info.
 */
export const updateProfile = mutation({
  args: {
    username: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    profileImageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const now = Date.now();

    await ctx.db.patch(user._id, {
      ...(args.username !== undefined && { username: args.username }),
      ...(args.firstName !== undefined && { firstName: args.firstName }),
      ...(args.lastName !== undefined && { lastName: args.lastName }),
      ...(args.profileImageId !== undefined && { profileImageId: args.profileImageId }),
      updatedAt: now,
    });

    return { success: true };
  },
});

/**
 * Admin-only mutation to update a user's RBAC role.
 */
export const updateRole = mutation({
  args: {
    targetUserId: v.id("users"),
    newRole: v.union(
      v.literal("student"),
      v.literal("admin"),
      v.literal("content_manager")
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const targetUser = await ctx.db.get(args.targetUserId);
    if (!targetUser) {
      throw new Error("Target user not found.");
    }

    await ctx.db.patch(args.targetUserId, {
      role: args.newRole,
      updatedAt: Date.now(),
    });

    return { success: true, userId: args.targetUserId, role: args.newRole };
  },
});

/**
 * Query to fetch a user profile by ID.
 */
export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});
