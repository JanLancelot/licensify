import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "../_generated/api";
import schema from "../schema";
import { register as registerRateLimiter } from "@convex-dev/rate-limiter/test";

async function setup() {
  const t = convexTest(schema, import.meta.glob("../**/*.ts"));
  registerRateLimiter(t, "ratelimiter");
  const staff = t.withIdentity({ subject: "auth_staff", email: "staff@example.com" });
  const staffId = await staff.mutation(api.users.storeUser, { username: "staff" });
  await t.run((ctx) => ctx.db.patch(staffId, { role: "content_manager" }));
  const student = t.withIdentity({ subject: "auth_student", email: "student@example.com" });
  await student.mutation(api.users.storeUser, { username: "student" });

  const now = Date.now();
  const ids = await t.run(async (ctx) => {
    const base = { createdBy: staffId, createdAt: now, updatedAt: now };
    const subjectId = await ctx.db.insert("subjects", { name: "Design", isPublished: true, order: 1, ...base });
    const draftSubjectId = await ctx.db.insert("subjects", { name: "Draft subject", isPublished: false, order: 2, ...base });
    const draftMaterialId = await ctx.db.insert("materials", {
      subjectId, title: "Draft note", type: "article", content: "unreleased", isPublished: false, ...base,
    });
    const draftQuizId = await ctx.db.insert("quizzes", {
      title: "Draft quiz", type: "practice", questionIds: [], isPublished: false, ...base,
    });
    return { subjectId, draftSubjectId, draftMaterialId, draftQuizId };
  });
  return { t, staff, student, staffId, ...ids };
}

test("draft materials are hidden from students and anonymous callers", async () => {
  const { t, staff, student, draftMaterialId } = await setup();
  expect(await t.query(api.materials.getMaterialById, { materialId: draftMaterialId })).toBeNull();
  expect(await student.query(api.materials.getMaterialById, { materialId: draftMaterialId })).toBeNull();
  expect((await staff.query(api.materials.getMaterialById, { materialId: draftMaterialId }))?.title).toBe("Draft note");
});

test("draft quizzes are hidden from students", async () => {
  const { staff, student, draftQuizId } = await setup();
  expect(await student.query(api.quizzes.getQuizWithQuestions, { quizId: draftQuizId })).toBeNull();
  expect((await staff.query(api.quizzes.getQuizWithQuestions, { quizId: draftQuizId }))?.title).toBe("Draft quiz");

  const online = await student.query(api.quizzes.getQuizWithQuestionsOnline, { quizId: draftQuizId });
  expect(online?.quiz.title).not.toBe("Draft quiz");
  const staffOnline = await staff.query(api.quizzes.getQuizWithQuestionsOnline, { quizId: draftQuizId });
  expect(staffOnline?.quiz.title).toBe("Draft quiz");
});

test("the online quiz lookup never loads documents from other tables", async () => {
  const { student, staffId } = await setup();
  const result = await student.query(api.quizzes.getQuizWithQuestionsOnline, { quizId: staffId });
  expect(result?.quiz).toEqual(expect.objectContaining({ id: staffId, title: "Architecture Board Exam Drill" }));
});

test("draft subjects are hidden from students", async () => {
  const { staff, student, subjectId, draftSubjectId } = await setup();
  expect(await student.query(api.subjects.getSubjectWithHierarchy, { subjectId: draftSubjectId })).toBeNull();
  expect((await student.query(api.subjects.getSubjectWithHierarchy, { subjectId }))?.name).toBe("Design");
  expect(
    (await staff.query(api.subjects.getSubjectWithHierarchy, { subjectId: draftSubjectId }))?.name
  ).toBe("Draft subject");
});

test("draft subjects are hidden from the topic listing", async () => {
  const { staff, student, draftSubjectId } = await setup();
  expect(await student.query(api.subjects.getSubjectWithTopics, { subjectId: draftSubjectId })).toBeNull();
  expect(
    (await staff.query(api.subjects.getSubjectWithTopics, { subjectId: draftSubjectId }))?.name
  ).toBe("Draft subject");
});

test("draft branches, topics and lessons are hidden from students", async () => {
  const { t, staff, student, subjectId } = await setup();
  const ids = await t.run(async (ctx) => {
    const base = { subjectId, order: 1, isPublished: false, createdAt: 0, updatedAt: 0 };
    const branchId = await ctx.db.insert("branches", { ...base, name: "Draft branch" });
    const topicId = await ctx.db.insert("topics", { ...base, name: "Draft topic" });
    const lessonId = await ctx.db.insert("lessons", { ...base, topicId, name: "Draft lesson" });
    return { branchId, topicId, lessonId };
  });

  for (const [caller, visible] of [[student, false], [staff, true]] as const) {
    expect(!!(await caller.query(api.branches.getBranchById, { branchId: ids.branchId }))).toBe(visible);
    expect(!!(await caller.query(api.topics.getTopicById, { topicId: ids.topicId }))).toBe(visible);
    expect(!!(await caller.query(api.lessons.getLessonById, { lessonId: ids.lessonId }))).toBe(visible);
  }
});
