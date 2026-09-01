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

    const existingUser = await getCurrentUser(ctx);
    const now = Date.now();

    if (existingUser !== null) {
      // Update existing user timestamp & optional fields
      await ctx.db.patch(existingUser._id, {
        updatedAt: now,
        lastActiveAt: now,
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
      (identity.email ? identity.email.split("@")[0] : `student_${identity.subject.slice(0, 6)}`);

    const newUserId = await ctx.db.insert("users", {
      userId: identity.subject,
      email: identity.email,
      username: fallbackUsername,
      firstName: args.firstName ?? identity.givenName,
      lastName: args.lastName ?? identity.familyName,
      role: "student", // Default role
      isActive: true,
      createdAt: now,
      updatedAt: now,
      lastActiveAt: now,
    });

    return newUserId;
  },
});

/**
 * Query to fetch current authenticated user's role.
 */
export const getRole = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    return user ? user.role : null;
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
 * Mutation for users to update their theme settings.
 */
export const updateThemeSettings = mutation({
  args: {
    themeMode: v.optional(v.string()),
    accentTheme: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return { success: false };

    const now = Date.now();
    await ctx.db.patch(user._id, {
      ...(args.themeMode !== undefined && { themeMode: args.themeMode }),
      ...(args.accentTheme !== undefined && { accentTheme: args.accentTheme }),
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

/**
 * Mutation to store or refresh FCM Push Notification token for user.
 */
export const updateFcmToken = mutation({
  args: { fcmToken: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const now = Date.now();

    await ctx.db.patch(user._id, {
      fcmToken: args.fcmToken,
      lastActiveAt: now,
      updatedAt: now,
    });

    return { success: true };
  },
});

/**
 * Admin query: List all users with optional role filtering and search.
 */
export const listAllUsersAdmin = query({
  args: {
    role: v.optional(
      v.union(
        v.literal("student"),
        v.literal("admin"),
        v.literal("content_manager")
      )
    ),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    await requireAdmin(ctx);


    let users;
    if (args.role) {
      users = await ctx.db
        .query("users")
        .withIndex("by_role", (q) => q.eq("role", args.role!))
        .collect();
    } else {
      users = await ctx.db.query("users").collect();
    }

    if (args.search && args.search.trim().length > 0) {
      const lower = args.search.trim().toLowerCase();
      users = users.filter(
        (u) =>
          u.username.toLowerCase().includes(lower) ||
          u.email?.toLowerCase().includes(lower) ||
          u.firstName?.toLowerCase().includes(lower) ||
          u.lastName?.toLowerCase().includes(lower)
      );
    }

    return users.sort((a, b) => b.createdAt - a.createdAt);
  },
});

/**
 * Admin mutation: Toggle user active/suspended status.
 */
export const toggleUserActive = mutation({
  args: {
    targetUserId: v.id("users"),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const currentUser = await requireAdmin(ctx);

    if (currentUser._id === args.targetUserId && !args.isActive) {
      throw new Error("Admins cannot suspend their own account.");
    }

    const target = await ctx.db.get(args.targetUserId);
    if (!target) {
      throw new Error("Target user not found.");
    }

    await ctx.db.patch(args.targetUserId, {
      isActive: args.isActive,
      updatedAt: Date.now(),
    });

    return { success: true, isActive: args.isActive };
  },
});


