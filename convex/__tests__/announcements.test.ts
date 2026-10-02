import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "../_generated/api";
import schema from "../schema";

const paginationOpts = { numItems: 20, cursor: null };
async function setup() {
  const t = convexTest(schema, import.meta.glob("../**/*.ts"));
  const ids = await t.run(async ctx => {
    const add = (role: "admin" | "student" | "content_manager", isActive = true) => ctx.db.insert("users", {
      username: `${role}-${isActive}`, userId: `${role}-${isActive}`, role, isActive, createdAt: 1, updatedAt: 1,
    });
    return { admin: await add("admin"), manager: await add("content_manager"), student: await add("student"), suspended: await add("admin", false) };
  });
  return {
    t, ids,
    admin: t.withIdentity({ subject: "admin-true" }),
    manager: t.withIdentity({ subject: "content_manager-true" }),
    student: t.withIdentity({ subject: "student-true" }),
    suspended: t.withIdentity({ subject: "admin-false" }),
  };
}

test("drafts stay private through edit, publish, unpublish, archive and restore", async () => {
  const { t, manager, student, ids } = await setup();
  expect((await student.query(api.announcements.listPublished, { paginationOpts })).page).toEqual([]);
  const id = await manager.mutation(api.announcements.saveDraft, { title: "  Welcome  ", body: "  First update  " });
  let row = (await manager.query(api.announcements.listAdmin, { paginationOpts })).page[0];
  expect(row).toMatchObject({ title: "Welcome", body: "First update", status: "draft", createdBy: ids.manager });
  expect(await student.query(api.announcements.getPublished, { id })).toBeNull();
  await manager.mutation(api.announcements.saveDraft, { id, expectedUpdatedAt: row.updatedAt, title: "Updated", body: "Updated message" });
  row = (await manager.query(api.announcements.listAdmin, { paginationOpts })).page[0];
  await manager.mutation(api.announcements.setStatus, { id, expectedUpdatedAt: row.updatedAt, status: "published" });
  const published = await student.query(api.announcements.getPublished, { id });
  expect(published).toMatchObject({ title: "Updated", body: "Updated message", publishedAt: expect.any(Number) });
  expect(published).not.toHaveProperty("createdBy");
  expect((await student.query(api.announcements.listPublished, { paginationOpts })).page).toEqual([published]);
  row = (await manager.query(api.announcements.listAdmin, { paginationOpts })).page[0];
  await expect(manager.mutation(api.announcements.saveDraft, { id, expectedUpdatedAt: row.updatedAt, title: "Oops", body: "Oops" })).rejects.toThrow("Unpublish");
  await manager.mutation(api.announcements.setStatus, { id, expectedUpdatedAt: row.updatedAt, status: "draft" });
  expect(await student.query(api.announcements.getPublished, { id })).toBeNull();
  expect((await student.query(api.announcements.listPublished, { paginationOpts })).page).toEqual([]);
  row = (await manager.query(api.announcements.listAdmin, { paginationOpts })).page[0];
  await manager.mutation(api.announcements.setStatus, { id, expectedUpdatedAt: row.updatedAt, status: "archived" });
  row = (await manager.query(api.announcements.listAdmin, { paginationOpts })).page[0];
  await expect(manager.mutation(api.announcements.setStatus, { id, expectedUpdatedAt: row.updatedAt, status: "published" })).rejects.toThrow("Restore");
  await manager.mutation(api.announcements.saveDraft, { id, expectedUpdatedAt: row.updatedAt, title: row.title, body: row.body });
  expect((await t.run(ctx => ctx.db.get(id)))?.status).toBe("draft");
});

test("rejects unauthorized readers and writers, including suspended staff", async () => {
  const { t, admin, student, suspended } = await setup();
  const id = await admin.mutation(api.announcements.saveDraft, { title: "Staff draft", body: "Private" });
  const row = (await admin.query(api.announcements.listAdmin, { paginationOpts })).page[0];
  for (const caller of [t, student, suspended]) {
    await expect(caller.query(api.announcements.listAdmin, { paginationOpts })).rejects.toThrow();
    await expect(caller.mutation(api.announcements.saveDraft, { title: "Unauthorized", body: "Write" })).rejects.toThrow();
    await expect(caller.mutation(api.announcements.saveDraft, { id, expectedUpdatedAt: row.updatedAt, title: "Unauthorized", body: "Edit" })).rejects.toThrow();
    await expect(caller.mutation(api.announcements.setStatus, { id, expectedUpdatedAt: row.updatedAt, status: "published" })).rejects.toThrow();
  }
  for (const caller of [t, suspended]) {
    await expect(caller.query(api.announcements.listPublished, { paginationOpts })).rejects.toThrow();
    await expect(caller.query(api.announcements.getPublished, { id })).rejects.toThrow();
  }
});

test("validates content and rejects stale edits or publishing an outdated preview", async () => {
  const { admin } = await setup();
  for (const values of [{title:" ",body:"ok"},{title:"ok",body:" "},{title:"x".repeat(121),body:"ok"},{title:"ok",body:"x".repeat(5001)}]) {
    await expect(admin.mutation(api.announcements.saveDraft, values)).rejects.toThrow();
  }
  const id = await admin.mutation(api.announcements.saveDraft, { title: "Initial", body: "Initial" });
  const row = (await admin.query(api.announcements.listAdmin, { paginationOpts })).page[0];
  await admin.mutation(api.announcements.saveDraft, { id, expectedUpdatedAt: row.updatedAt, title: "Newer", body: "Newer" });
  await expect(admin.mutation(api.announcements.saveDraft, { id, expectedUpdatedAt: row.updatedAt, title: "Stale", body: "Stale" })).rejects.toThrow("changed");
  await expect(admin.mutation(api.announcements.setStatus, { id, expectedUpdatedAt: row.updatedAt, status: "published" })).rejects.toThrow("changed");
});

test("published pagination is newest first and never includes drafts or archives", async () => {
  const { admin, student, t } = await setup();
  const ids = [];
  for (let index = 0; index < 3; index++) {
    const id = await admin.mutation(api.announcements.saveDraft, { title: `Update ${index}`, body: "Message" });
    ids.push(id);
    await t.run(ctx => ctx.db.patch(id, { status: "published", publishedAt: index + 1 }));
  }
  await admin.mutation(api.announcements.saveDraft, { title: "Private", body: "Draft" });
  const first = await student.query(api.announcements.listPublished, { paginationOpts: { numItems: 2, cursor: null } });
  expect(first.page.map(row => row._id)).toEqual([ids[2], ids[1]]);
  const last = await student.query(api.announcements.listPublished, { paginationOpts: { numItems: 2, cursor: first.continueCursor } });
  expect(last.page.map(row => row._id)).toEqual([ids[0]]);
  expect(last.isDone).toBe(true);
});
