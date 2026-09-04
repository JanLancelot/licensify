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
 * Query to fetch current authenticated user profile document with resolved avatar URL.
 */
export const getCurrentUserProfile = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    let profileImageUrl: string | null = null;
    if (user.profileImageId) {
      profileImageUrl = await ctx.storage.getUrl(user.profileImageId);
    }

    return {
      ...user,
      profileImageUrl,
    };
  },
});

/**
 * Mutation: Generates short-lived upload URL for uploading a profile image to Convex Storage.
 */
export const generateProfileUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireUser(ctx);
    return await ctx.storage.generateUploadUrl();
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
    profileImageId: v.optional(v.union(v.id("_storage"), v.null())),
    soundEnabled: v.optional(v.boolean()),
    dailyReminder: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const now = Date.now();

    if (args.profileImageId !== undefined) {
      // If replacing or removing previous profile image, delete old file from storage
      if (user.profileImageId && user.profileImageId !== args.profileImageId) {
        try {
          await ctx.storage.delete(user.profileImageId);
        } catch (e) {
          console.warn("Failed to delete old profile image:", e);
        }
      }
    }

    await ctx.db.patch(user._id, {
      ...(args.username !== undefined && { username: args.username }),
      ...(args.firstName !== undefined && { firstName: args.firstName }),
      ...(args.lastName !== undefined && { lastName: args.lastName }),
      ...(args.profileImageId !== undefined && {
        profileImageId: args.profileImageId === null ? undefined : args.profileImageId,
      }),
      ...(args.soundEnabled !== undefined && { soundEnabled: args.soundEnabled }),
      ...(args.dailyReminder !== undefined && { dailyReminder: args.dailyReminder }),
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

/**
 * Public/Student query: Computes live user study stats in real time.
 */
export const getUserStats = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    const [allLessons, completedProgress, attempts, streaks] = await Promise.all([
      ctx.db
        .query("lessons")
        .filter((q) => q.neq(q.field("isPublished"), false))
        .collect(),
      user
        ? ctx.db
            .query("lessonProgress")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .filter((q) => q.eq(q.field("isCompleted"), true))
            .collect()
        : Promise.resolve([]),
      user
        ? ctx.db
            .query("quizAttempts")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .collect()
        : Promise.resolve([]),
      user
        ? ctx.db
            .query("userStreaks")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .collect()
        : Promise.resolve([]),
    ]);

    const totalLessons = allLessons.length;
    const completedCount = completedProgress.length;
    const progressPercentage =
      totalLessons > 0 ? Math.min(100, Math.round((completedCount / totalLessons) * 100)) : 0;

    const completedQuizzes = attempts.length;
    const totalScore = attempts.reduce((acc, curr) => acc + (curr.score || 0), 0);
    const averageScore = completedQuizzes > 0 ? Math.round(totalScore / completedQuizzes) : 0;

    let streakDays = 0;
    if (streaks.length > 0 && streaks[0].currentStreak > 0) {
      streakDays = streaks[0].currentStreak;
    } else if (attempts.length > 0 || completedProgress.length > 0) {
      streakDays = 1;
    }

    return {
      progressPercentage,
      completedQuizzes,
      averageScore,
      streakDays,
    };
  },
});

/**
 * Public/Student query: Fetches user study streak online.
 */
export const getUserStreakOnline = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return { currentStreak: 0, longestStreak: 0 };

    const streak = await ctx.db
      .query("userStreaks")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    return {
      currentStreak: streak?.currentStreak ?? 0,
      longestStreak: streak?.longestStreak ?? 0,
      lastActiveDate: streak?.lastActiveDate,
    };
  },
});

/**
 * Public/Student query: Fetches live achievements with real-time unlocked state.
 */
export const getUserAchievementsOnline = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    const [allAch, userAch, attempts, streaks] = await Promise.all([
      ctx.db
        .query("achievements")
        .filter((q) => q.neq(q.field("isPublished"), false))
        .collect(),
      user
        ? ctx.db
            .query("userAchievements")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .collect()
        : Promise.resolve([]),
      user
        ? ctx.db
            .query("quizAttempts")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .collect()
        : Promise.resolve([]),
      user
        ? ctx.db
            .query("userStreaks")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .collect()
        : Promise.resolve([]),
    ]);

    allAch.sort((a, b) => (a.order || 0) - (b.order || 0));
    const currentStreak = streaks.length > 0 ? streaks[0].currentStreak : (attempts.length > 0 ? 1 : 0);

    return allAch.map((ach) => {
      const uRec = userAch.find((ua: any) => ua.achievementId === ach._id);
      let isUnlocked = uRec?.isUnlocked || false;
      let currentVal = uRec?.progress || 0;

      if (!isUnlocked) {
        if (ach.criteriaType === "streak") {
          currentVal = currentStreak;
          if (currentVal >= ach.targetValue) isUnlocked = true;
        } else if (
          ach.criteriaType === "quiz_count" ||
          ach.criteriaType === "flashcard_decks"
        ) {
          currentVal = attempts.length;
          if (currentVal >= ach.targetValue) isUnlocked = true;
        } else if (ach.criteriaType === "perfect_score") {
          const hasPerfect = attempts.some((att) => (att.score || 0) >= 100);
          currentVal = hasPerfect ? 1 : 0;
          if (hasPerfect) isUnlocked = true;
        } else if (
          ach.criteriaType === "area1_exam" ||
          ach.criteriaType === "rule7_8"
        ) {
          const passed = attempts.some((att) => (att.score || 0) >= 75);
          currentVal = passed ? 1 : 0;
          if (passed) isUnlocked = true;
        }
      }

      const progressText = isUnlocked
        ? "Unlocked"
        : `${Math.min(currentVal, ach.targetValue)}/${ach.targetValue} Done`;

      return {
        id: ach._id,
        title: ach.title,
        category: ach.category,
        description: ach.description,
        iconName: ach.iconName,
        bg: ach.bg,
        darkBg: ach.darkBg,
        iconColor: ach.iconColor,
        criteriaType: ach.criteriaType,
        targetValue: ach.targetValue,
        order: ach.order,
        isUnlocked,
        progressText,
      };
    });
  },
});



