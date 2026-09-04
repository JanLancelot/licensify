import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./authHelpers";

/**
 * Deterministic SHA-256 hash using standard Web Crypto API.
 */
async function hashAnswer(questionId: string, choiceId: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${questionId}:${choiceId}`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const bytes = new Uint8Array(hashBuffer);
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    hex += (bytes[i] < 16 ? "0" : "") + bytes[i].toString(16);
  }
  return hex;
}

/**
 * High-performance bulk and delta sync endpoint.
 * Fetches all published curriculum entities in a single atomic database pass.
 */
export const getSyncBundle = query({
  args: {
    sinceTimestamp: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const user = await getCurrentUser(ctx);

    // 1. Fetch all published entities across tables concurrently
    const [
      rawSubjects,
      rawBranches,
      rawTopics,
      rawLessons,
      rawMaterials,
      rawFlashcards,
      rawQuestions,
      rawQuizzes,
      rawAchievements,
      rawUserPresets,
      rawUserAchievements,
      rawUserStreaks,
      rawLessonProgress,
    ] = await Promise.all([
      ctx.db.query("subjects").filter((q) => q.neq(q.field("isPublished"), false)).collect(),
      ctx.db.query("branches").filter((q) => q.neq(q.field("isPublished"), false)).collect(),
      ctx.db.query("topics").filter((q) => q.neq(q.field("isPublished"), false)).collect(),
      ctx.db.query("lessons").filter((q) => q.neq(q.field("isPublished"), false)).collect(),
      ctx.db.query("materials").filter((q) => q.neq(q.field("isPublished"), false)).collect(),
      ctx.db.query("flashcards").filter((q) => q.neq(q.field("isPublished"), false)).collect(),
      ctx.db.query("questions").filter((q) => q.neq(q.field("isPublished"), false)).collect(),
      ctx.db.query("quizzes").filter((q) => q.neq(q.field("isPublished"), false)).collect(),
      ctx.db.query("achievements").filter((q) => q.neq(q.field("isPublished"), false)).collect(),
      user
        ? ctx.db.query("userPresets").withIndex("by_user", (q) => q.eq("userId", user._id)).collect()
        : Promise.resolve([]),
      user
        ? ctx.db.query("userAchievements").withIndex("by_user", (q) => q.eq("userId", user._id)).collect()
        : Promise.resolve([]),
      user
        ? ctx.db.query("userStreaks").withIndex("by_user", (q) => q.eq("userId", user._id)).collect()
        : Promise.resolve([]),
      user
        ? ctx.db.query("lessonProgress").withIndex("by_user", (q) => q.eq("userId", user._id)).collect()
        : Promise.resolve([]),
    ]);

    // 2. Check for Delta Sync: If sinceTimestamp is provided and nothing was modified, return early
    if (args.sinceTimestamp && args.sinceTimestamp > 0) {
      const since = args.sinceTimestamp;
      const isEntityUpdated = (item: { updatedAt?: number; _creationTime: number }) =>
        (item.updatedAt ?? item._creationTime) > since;

      const hasUpdates =
        rawSubjects.some(isEntityUpdated) ||
        rawBranches.some(isEntityUpdated) ||
        rawTopics.some(isEntityUpdated) ||
        rawLessons.some(isEntityUpdated) ||
        rawMaterials.some(isEntityUpdated) ||
        rawFlashcards.some(isEntityUpdated) ||
        rawQuestions.some(isEntityUpdated) ||
        rawQuizzes.some(isEntityUpdated) ||
        rawLessonProgress.some((lp: any) => (lp.updatedAt ?? lp._creationTime) > since);

      if (!hasUpdates) {
        return {
          upToDate: true,
          timestamp: now,
          subjects: [],
          branches: [],
          topics: [],
          lessons: [],
          materials: [],
          flashcards: [],
          questions: [],
          quizzes: [],
          lessonProgress: [],
        };
      }
    }

    // 3. Pre-compute SHA-256 question hashes on server (so client never leaks plain answers or runs slow crypto loops)
    const questions = await Promise.all(
      rawQuestions.map(async (q) => {
        const correctChoiceHash = q.correctChoiceId
          ? await hashAnswer(q._id, q.correctChoiceId)
          : undefined;

        return {
          id: q._id,
          subjectId: q.subjectId,
          branchId: q.branchId,
          topicId: q.topicId,
          lessonId: q.lessonId,
          question: q.question,
          choices: q.choices,
          correctChoiceHash,
          explanation: q.explanation,
          difficulty: q.difficulty,
          specializedType: q.specializedType,
          isPublished: q.isPublished ?? true,
        };
      })
    );

    const subjects = rawSubjects.map((s) => ({
      id: s._id,
      name: s.name,
      description: s.description,
      isPublished: s.isPublished ?? true,
      order: s.order || 0,
    }));

    const branches = rawBranches.map((b) => ({
      id: b._id,
      subjectId: b.subjectId,
      name: b.name,
      description: b.description,
      order: b.order || 0,
      isPublished: b.isPublished ?? true,
    }));

    const topics = rawTopics.map((t) => ({
      id: t._id,
      subjectId: t.subjectId,
      branchId: t.branchId,
      name: t.name,
      description: t.description,
      order: t.order || 0,
      isPublished: t.isPublished ?? true,
    }));

    const lessons = rawLessons.map((l) => ({
      id: l._id,
      subjectId: l.subjectId,
      branchId: l.branchId,
      topicId: l.topicId,
      name: l.name,
      description: l.description,
      order: l.order || 0,
      isPublished: l.isPublished ?? true,
    }));

    const materials = rawMaterials.map((m) => ({
      id: m._id,
      subjectId: m.subjectId,
      branchId: m.branchId,
      topicId: m.topicId,
      lessonId: m.lessonId,
      title: m.title,
      description: m.description,
      type: m.type || "article",
      content: m.content,
    }));

    const flashcards = rawFlashcards.map((f) => ({
      id: f._id,
      subjectId: f.subjectId,
      branchId: f.branchId,
      topicId: f.topicId,
      lessonId: f.lessonId,
      front: f.front,
      back: f.back,
    }));

    const quizzes = rawQuizzes.map((qz) => ({
      id: qz._id,
      title: qz.title,
      description: qz.description,
      type: qz.type || "practice",
      subjectId: qz.subjectId,
      branchId: qz.branchId,
      topicId: qz.topicId,
      lessonId: qz.lessonId,
      questionIds: qz.questionIds || [],
      timeLimitSeconds: qz.timeLimitSeconds,
      passingScore: qz.passingScore,
      specializedType: qz.specializedType,
    }));

    const achievements = rawAchievements.map((a) => ({
      id: a._id,
      title: a.title,
      category: a.category,
      description: a.description,
      iconName: a.iconName,
      bg: a.bg,
      darkBg: a.darkBg,
      iconColor: a.iconColor,
      criteriaType: a.criteriaType,
      targetValue: a.targetValue,
      order: a.order || 0,
      isPublished: a.isPublished ?? true,
    }));

    const userPresets = rawUserPresets.map((up: any) => ({
      id: up._id,
      userId: up.userId,
      type: up.type,
      title: up.title,
      iconName: up.iconName,
      lessonIds: up.lessonIds || [],
      subjectNames: up.subjectNames || [],
      questionCount: up.questionCount,
      timeLimitSeconds: up.timeLimitSeconds,
      isShuffled: up.isShuffled ?? false,
      createdAt: up.createdAt,
      updatedAt: up.updatedAt,
    }));

    const userAchievements = rawUserAchievements.map((ua: any) => ({
      id: ua._id,
      userId: ua.userId,
      achievementId: ua.achievementId,
      progress: ua.progress || 0,
      isUnlocked: ua.isUnlocked ?? false,
      unlockedAt: ua.unlockedAt,
    }));

    const userStreaks = rawUserStreaks.map((us: any) => ({
      id: us._id,
      userId: us.userId,
      currentStreak: us.currentStreak || 0,
      longestStreak: us.longestStreak || 0,
      lastActiveDate: us.lastActiveDate || "",
    }));

    const lessonProgress = rawLessonProgress.map((lp) => ({
      id: lp._id,
      lessonId: lp.lessonId,
      isCompleted: lp.isCompleted,
      completedAt: lp.completedAt,
    }));

    return {
      upToDate: false,
      timestamp: now,
      subjects,
      branches,
      topics,
      lessons,
      materials,
      flashcards,
      questions,
      quizzes,
      achievements,
      userPresets,
      userAchievements,
      userStreaks,
      lessonProgress,
    };
  },
});

/**
 * High-performance batch up-sync mutation.
 * Accepts multiple offline attempts and their answers in a single call.
 */
export const syncAttemptsBatch = mutation({
  args: {
    attempts: v.array(
      v.object({
        localId: v.string(),
        quizId: v.string(),
        status: v.union(v.literal("in_progress"), v.literal("submitted"), v.literal("expired")),
        score: v.optional(v.number()),
        correctAnswers: v.optional(v.number()),
        totalQuestions: v.number(),
        startedAt: v.number(),
        submittedAt: v.optional(v.number()),
        answers: v.array(
          v.object({
            questionId: v.id("questions"),
            selectedChoiceId: v.optional(v.string()),
            answeredAt: v.optional(v.number()),
          })
        ),
      })
    ),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return { synced: [] };
    }

    // Safety guard against exceeding Convex write limit (16k writes)
    const attemptsToProcess = args.attempts.slice(0, 50);
    const synced: Array<{ localId: string; serverId: string }> = [];

    // 1. Pre-fetch all referenced questions across all attempts in parallel to avoid slow sequential DB round-trips
    const questionIdSet = new Set<string>();
    for (const attempt of attemptsToProcess) {
      for (const ans of attempt.answers) {
        if (ans.selectedChoiceId) {
          questionIdSet.add(ans.questionId);
        }
      }
    }

    const questionDocs = await Promise.all(
      Array.from(questionIdSet).map(async (qId) => {
        const doc = await ctx.db.get(qId as import("./_generated/dataModel").Id<"questions">);
        return [qId, doc] as const;
      })
    );
    const questionMap = new Map(questionDocs);

    for (const attempt of attemptsToProcess) {
      // 2. Check for an existing attempt to prevent infinite duplicate loops
      const existingAttempt = await ctx.db
        .query("quizAttempts")
        .withIndex("by_user_and_quiz", (q) =>
          q.eq("userId", user._id).eq("quizId", attempt.quizId)
        )
        .filter((q) => q.eq(q.field("startedAt"), attempt.startedAt))
        .first();

      let attemptId;

      if (existingAttempt) {
        attemptId = existingAttempt._id;
        if (existingAttempt.status !== attempt.status) {
          await ctx.db.patch(attemptId, {
            status: attempt.status,
            score: attempt.score,
            correctAnswers: attempt.correctAnswers,
            submittedAt: attempt.submittedAt,
          });
        }
      } else {
        // Insert Attempt
        attemptId = await ctx.db.insert("quizAttempts", {
          userId: user._id,
          quizId: attempt.quizId,
          status: attempt.status,
          score: attempt.score,
          correctAnswers: attempt.correctAnswers,
          totalQuestions: attempt.totalQuestions,
          startedAt: attempt.startedAt,
          submittedAt: attempt.submittedAt,
        });

        // 3. Insert and grade answers with instant in-memory lookup
        let calculatedCorrect = 0;
        for (const ans of attempt.answers) {
          let isCorrect: boolean | undefined = undefined;
          if (ans.selectedChoiceId) {
            const qDoc = questionMap.get(ans.questionId);
            if (qDoc) {
              isCorrect = qDoc.correctChoiceId === ans.selectedChoiceId;
              if (isCorrect) calculatedCorrect++;
            }
          }

          await ctx.db.insert("quizAnswers", {
            attemptId,
            questionId: ans.questionId,
            selectedChoiceId: ans.selectedChoiceId,
            isCorrect,
            answeredAt: ans.answeredAt ?? Date.now(),
          });
        }

        // 4. Finalize score on server if submitted
        if (attempt.status === "submitted") {
          const total = attempt.totalQuestions > 0 ? attempt.totalQuestions : 1;
          const finalScore = Math.round((calculatedCorrect / total) * 100);
          await ctx.db.patch(attemptId, {
            correctAnswers: calculatedCorrect,
            score: finalScore,
          });
        }
      }

      synced.push({
        localId: attempt.localId,
        serverId: attemptId,
      });
    }

    return { synced };
  },
});

/**
 * Batch up-sync mutation for lesson progress.
 */
export const syncLessonProgressBatch = mutation({
  args: {
    progress: v.array(
      v.object({
        lessonId: v.string(),
        isCompleted: v.boolean(),
        completedAt: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return { synced: [] };
    }

    const synced = [];

    for (const p of args.progress) {
      // Find existing progress record
      const existing = await ctx.db
        .query("lessonProgress")
        .withIndex("by_user_and_lesson", (q) =>
          q.eq("userId", user._id).eq("lessonId", p.lessonId)
        )
        .first();

      let serverId;
      if (existing) {
        serverId = existing._id;
        await ctx.db.patch(existing._id, {
          isCompleted: p.isCompleted,
          completedAt: p.completedAt,
          updatedAt: Date.now(),
        });
      } else {
        serverId = await ctx.db.insert("lessonProgress", {
          userId: user._id,
          lessonId: p.lessonId,
          isCompleted: p.isCompleted,
          completedAt: p.completedAt,
          updatedAt: Date.now(),
        });
      }

      synced.push({
        lessonId: p.lessonId,
        serverId,
      });
    }

    return { synced };
  },
});

/**
 * Batch up-sync mutation for student-created presets.
 */
export const syncUserPresetsBatch = mutation({
  args: {
    presets: v.array(
      v.object({
        localId: v.string(),
        type: v.union(v.literal("flashcard"), v.literal("quiz"), v.literal("exam")),
        title: v.string(),
        iconName: v.optional(v.string()),
        lessonIds: v.array(v.string()),
        subjectNames: v.optional(v.array(v.string())),
        questionCount: v.optional(v.number()),
        timeLimitSeconds: v.optional(v.number()),
        isShuffled: v.optional(v.boolean()),
        createdAt: v.number(),
        updatedAt: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return { synced: [] };
    }

    const synced = [];

    for (const p of args.presets) {
      const existing = await ctx.db
        .query("userPresets")
        .withIndex("by_user_and_type", (q) => q.eq("userId", user._id).eq("type", p.type))
        .filter((q) => q.eq(q.field("title"), p.title))
        .first();

      let serverId;
      if (existing) {
        serverId = existing._id;
        await ctx.db.patch(existing._id, {
          title: p.title,
          iconName: p.iconName,
          lessonIds: p.lessonIds,
          subjectNames: p.subjectNames,
          questionCount: p.questionCount,
          timeLimitSeconds: p.timeLimitSeconds,
          isShuffled: p.isShuffled,
          updatedAt: p.updatedAt,
        });
      } else {
        serverId = await ctx.db.insert("userPresets", {
          userId: user._id,
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
        });
      }

      synced.push({
        localId: p.localId,
        serverId,
      });
    }

    return { synced };
  },
});

/**
 * Up-sync mutation for user study streak.
 */
export const syncUserStreak = mutation({
  args: {
    currentStreak: v.number(),
    longestStreak: v.number(),
    lastActiveDate: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const existing = await ctx.db
      .query("userStreaks")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, {
        currentStreak: Math.max(existing.currentStreak, args.currentStreak),
        longestStreak: Math.max(existing.longestStreak, args.longestStreak),
        lastActiveDate: args.lastActiveDate,
        updatedAt: now,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("userStreaks", {
        userId: user._id,
        currentStreak: args.currentStreak,
        longestStreak: args.longestStreak,
        lastActiveDate: args.lastActiveDate,
        updatedAt: now,
      });
    }
  },
});
