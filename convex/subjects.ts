import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireContentManager } from "./authHelpers";

/**
 * Public/Student query: Fetches all published subjects sorted by display order.
 */
export const listPublishedSubjects = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("subjects")
      .withIndex("by_published", (q) => q.eq("isPublished", true))
      .order("asc")
      .collect();
  },
});

/**
 * Admin/Content Manager query: Fetches all subjects (including drafts).
 */
export const listAllSubjects = query({
  args: {},
  handler: async (ctx) => {
    await requireContentManager(ctx);
    return await ctx.db.query("subjects").collect();
  },
});

/**
 * Fetches a single subject by document ID, with its nested published topics.
 */
export const getSubjectWithTopics = query({
  args: { subjectId: v.id("subjects") },
  handler: async (ctx, args) => {
    const subject = await ctx.db.get(args.subjectId);
    if (!subject) return null;

    const topics = await ctx.db
      .query("topics")
      .withIndex("by_subject", (q) => q.eq("subjectId", args.subjectId))
      .filter((q) => q.eq(q.field("isPublished"), true))
      .collect();

    return {
      ...subject,
      topics,
    };
  },
});

/**
 * Fetches a single subject by document ID, with its nested published topics and lessons.
 */
export const getSubjectWithHierarchy = query({
  args: { subjectId: v.id("subjects") },
  handler: async (ctx, args) => {
    const subject = await ctx.db.get(args.subjectId);
    if (!subject) return null;

    const branches = await ctx.db
      .query("branches")
      .withIndex("by_subject", (q) => q.eq("subjectId", args.subjectId))
      .filter((q) => q.eq(q.field("isPublished"), true))
      .collect();

    const topics = await ctx.db
      .query("topics")
      .withIndex("by_subject", (q) => q.eq("subjectId", args.subjectId))
      .filter((q) => q.eq(q.field("isPublished"), true))
      .collect();

    const topicsWithLessons = await Promise.all(
      topics.map(async (topic) => {
        const lessons = await ctx.db
          .query("lessons")
          .withIndex("by_topic_and_order", (q) => q.eq("topicId", topic._id))
          .filter((q) => q.eq(q.field("isPublished"), true))
          .collect();

        return {
          ...topic,
          lessons,
        };
      })
    );

    return {
      ...subject,
      branches,
      topics: topicsWithLessons,
    };
  },
});

/**
 * Public/Student query: Fetches full curriculum hierarchy (subjects, topics, lessons, materials)
 * formatted for the mobile application.
 */
export const getFullCurriculum = query({
  args: {},
  handler: async (ctx) => {
    const subjects = await ctx.db
      .query("subjects")
      .filter((q) => q.neq(q.field("isPublished"), false))
      .collect();
    subjects.sort((a, b) => (a.order || 0) - (b.order || 0));

    const topics = await ctx.db
      .query("topics")
      .filter((q) => q.neq(q.field("isPublished"), false))
      .collect();
    topics.sort((a, b) => (a.order || 0) - (b.order || 0));

    const lessons = await ctx.db
      .query("lessons")
      .filter((q) => q.neq(q.field("isPublished"), false))
      .collect();
    lessons.sort((a, b) => (a.order || 0) - (b.order || 0));

    const materials = await ctx.db.query("materials").collect();

    return subjects.map((sub, sIdx) => {
      const subTopics = topics.filter((t) => t.subjectId === sub._id);
      const mappedTopics = subTopics.map((top, tIdx) => {
        const topLessons = lessons.filter((l) => l.topicId === top._id);
        const mappedLessons = topLessons.map((les, lIdx) => {
          const mat = materials.find((m) => m.lessonId === les._id || m.topicId === top._id);
          const summary = mat?.description || les.description || "Core syllabus competencies and architectural provisions.";
          let keyPoints: string[] = [];
          if (mat?.content) {
            const bulletLines = mat.content
              .split("\n")
              .filter((l) => l.trim().startsWith("* ") || l.trim().startsWith("- "));
            if (bulletLines.length > 0) {
              keyPoints = bulletLines
                .slice(0, 4)
                .map((l) => l.replace(/^[\*\-]\s*/, "").replace(/\*\*/g, "").trim());
            }
          }
          if (keyPoints.length === 0) {
            keyPoints = [
              `Definition & Scope: ${les.name}`,
              `Regulatory Standard: Applicable architectural board guidelines & provisions.`,
              `Practice Application: Professional architectural practice & code compliance.`,
            ];
          }

          return {
            id: les._id,
            lessonId: les._id,
            topicId: top._id,
            subjectId: sub._id,
            lessonNumber: les.order || (lIdx + 1),
            title: les.name,
            duration: "10 min",
            summary,
            keyPoints,
          };
        });

        return {
          id: top._id,
          topicId: top._id,
          subjectId: sub._id,
          topicNumber: top.order || (tIdx + 1),
          title: top.name,
          lessons: mappedLessons,
        };
      });

      return {
        id: sub._id,
        subjectId: sub._id,
        subjectNumber: sub.order || (sIdx + 1),
        title: sub.name,
        area: `Area ${sIdx + 1}`,
        weight: sIdx === 0 ? "30%" : sIdx === 1 ? "30%" : "40%",
        iconIndex: sIdx,
        topics: mappedTopics,
      };
    });
  },
});

/**
 * Mutation: Create a new Board Exam Subject (Requires content_manager or admin role).
 */
export const createSubject = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    imageId: v.optional(v.id("_storage")),
    order: v.number(),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await requireContentManager(ctx);
    const now = Date.now();

    const subjectId = await ctx.db.insert("subjects", {
      name: args.name,
      description: args.description,
      imageId: args.imageId,
      isPublished: args.isPublished ?? false,
      order: args.order,
      createdBy: user._id,
      createdAt: now,
      updatedAt: now,
    });

    return subjectId;
  },
});

/**
 * Mutation: Update existing Subject metadata or publication status.
 */
export const updateSubject = mutation({
  args: {
    subjectId: v.id("subjects"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    imageId: v.optional(v.id("_storage")),
    isPublished: v.optional(v.boolean()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireContentManager(ctx);
    const now = Date.now();

    await ctx.db.patch(args.subjectId, {
      ...(args.name !== undefined && { name: args.name }),
      ...(args.description !== undefined && { description: args.description }),
      ...(args.imageId !== undefined && { imageId: args.imageId }),
      ...(args.isPublished !== undefined && { isPublished: args.isPublished }),
      ...(args.order !== undefined && { order: args.order }),
      updatedAt: now,
    });

    return { success: true };
  },
});

/**
 * Mutation: Delete a Subject (Requires content_manager or admin).
 */
export const deleteSubject = mutation({
  args: { subjectId: v.id("subjects") },
  handler: async (ctx, args) => {
    await requireContentManager(ctx);

    // Check for associated topics
    const topics = await ctx.db
      .query("topics")
      .withIndex("by_subject", (q) => q.eq("subjectId", args.subjectId))
      .collect();

    // Delete associated topics
    for (const topic of topics) {
      await ctx.db.delete(topic._id);
    }

    await ctx.db.delete(args.subjectId);
    return { success: true };
  },
});

