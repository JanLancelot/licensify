import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireContentManager, requireUser } from "./_helpers/auth";
import type { Doc } from "./_generated/dataModel";

function content(title: string, body: string) {
  title = title.trim();
  body = body.trim();
  if (!title || title.length > 120) throw new Error("Title must contain 1–120 characters.");
  if (!body || body.length > 5000) throw new Error("Message must contain 1–5,000 characters.");
  return { title, body };
}

function checkVersion(row: Doc<"announcements"> | null, expectedUpdatedAt?: number) {
  if (!row) throw new Error("Announcement not found.");
  if (expectedUpdatedAt !== row.updatedAt) {
    throw new Error("This announcement changed. Close the editor and reopen it before trying again.");
  }
  return row;
}

// Readers receive content only, never staff identities or draft metadata.
function publicContent(row: Doc<"announcements">) {
  return { _id: row._id, title: row.title, body: row.body, publishedAt: row.publishedAt! };
}

export const listAdmin = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    await requireContentManager(ctx);
    return ctx.db.query("announcements").withIndex("by_updatedAt").order("desc").paginate(args.paginationOpts);
  },
});

export const listPublished = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    await requireUser(ctx);
    const result = await ctx.db.query("announcements")
      .withIndex("by_status_and_publishedAt", q => q.eq("status", "published"))
      .order("desc").paginate(args.paginationOpts);
    return { ...result, page: result.page.map(publicContent) };
  },
});

export const getPublished = query({
  args: { id: v.id("announcements") },
  handler: async (ctx, { id }) => {
    await requireUser(ctx);
    const row = await ctx.db.get(id);
    return row?.status === "published" ? publicContent(row) : null;
  },
});

export const saveDraft = mutation({
  args: {
    id: v.optional(v.id("announcements")),
    expectedUpdatedAt: v.optional(v.number()),
    title: v.string(),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireContentManager(ctx);
    const values = content(args.title, args.body);
    if (args.id) {
      const row = checkVersion(await ctx.db.get(args.id), args.expectedUpdatedAt);
      if (row.status === "published") throw new Error("Unpublish this announcement before editing it.");
      await ctx.db.patch(row._id, {
        ...values, status: "draft", publishedAt: undefined,
        updatedBy: user._id, updatedAt: Math.max(Date.now(), row.updatedAt + 1),
      });
      return row._id;
    }
    const now = Date.now();
    return ctx.db.insert("announcements", {
      ...values, status: "draft", createdBy: user._id, updatedBy: user._id,
      createdAt: now, updatedAt: now,
    });
  },
});

export const setStatus = mutation({
  args: {
    id: v.id("announcements"),
    expectedUpdatedAt: v.number(),
    status: v.union(v.literal("draft"), v.literal("published"), v.literal("archived")),
  },
  handler: async (ctx, args) => {
    const user = await requireContentManager(ctx);
    const row = checkVersion(await ctx.db.get(args.id), args.expectedUpdatedAt);
    if (row.status === args.status) return;
    if (args.status === "published") {
      if (row.status !== "draft") throw new Error("Restore this announcement to a draft before publishing.");
      content(row.title, row.body);
    }
    const now = Math.max(Date.now(), row.updatedAt + 1);
    await ctx.db.patch(row._id, {
      status: args.status, updatedAt: now, updatedBy: user._id,
      publishedAt: args.status === "published" ? now : undefined,
    });
  },
});
