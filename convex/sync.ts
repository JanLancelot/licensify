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
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
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
    ] = await Promise.all([
      ctx.db.query("subjects").filter((q) => q.neq(q.field("isPublished"), false)).collect(),
      ctx.db.query("branches").filter((q) => q.neq(q.field("isPublished"), false)).collect(),
      ctx.db.query("topics").filter((q) => q.neq(q.field("isPublished"), false)).collect(),
      ctx.db.query("lessons").filter((q) => q.neq(q.field("isPublished"), false)).collect(),
      ctx.db.query("materials").filter((q) => q.neq(q.field("isPublished"), false)).collect(),
      ctx.db.query("flashcards").filter((q) => q.neq(q.field("isPublished"), false)).collect(),
      ctx.db.query("questions").filter((q) => q.neq(q.field("isPublished"), false)).collect(),
      ctx.db.query("quizzes").filter((q) => q.neq(q.field("isPublished"), false)).collect(),
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
        rawQuizzes.some(isEntityUpdated);

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
        quizId: v.id("quizzes"),
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

    const synced: Array<{ localId: string; serverId: string }> = [];

    for (const attempt of args.attempts) {
      // 1. Insert Attempt
      const attemptId = await ctx.db.insert("quizAttempts", {
        userId: user._id,
        quizId: attempt.quizId,
        status: attempt.status,
        score: attempt.score,
        correctAnswers: attempt.correctAnswers,
        totalQuestions: attempt.totalQuestions,
        startedAt: attempt.startedAt,
        submittedAt: attempt.submittedAt,
      });

      // 2. Insert and grade answers
      let calculatedCorrect = 0;
      for (const ans of attempt.answers) {
        let isCorrect: boolean | undefined = undefined;
        if (ans.selectedChoiceId) {
          const qDoc = await ctx.db.get(ans.questionId);
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

      // 3. Finalize score on server if submitted
      if (attempt.status === "submitted") {
        const total = attempt.totalQuestions > 0 ? attempt.totalQuestions : 1;
        const finalScore = Math.round((calculatedCorrect / total) * 100);
        await ctx.db.patch(attemptId, {
          correctAnswers: calculatedCorrect,
          score: finalScore,
        });
      }

      synced.push({
        localId: attempt.localId,
        serverId: attemptId,
      });
    }

    return { synced };
  },
});
