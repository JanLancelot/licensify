import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "../_generated/api";
import schema from "../schema";
import { register as registerRateLimiter } from "@convex-dev/rate-limiter/test";

test("admins cannot remove their own admin role", async () => {
  const t = convexTest(schema, import.meta.glob("../**/*.ts"));
  registerRateLimiter(t, "ratelimiter");
  const alice = t.withIdentity({ subject: "auth_alice", email: "alice@example.com" });
  const aliceId = await alice.mutation(api.users.storeUser, { username: "alice" });
  await t.run((ctx) => ctx.db.patch(aliceId, { role: "admin" }));

  for (const newRole of ["student", "content_manager"] as const) {
    await expect(
      alice.mutation(api.users.updateRole, { targetUserId: aliceId, newRole })
    ).rejects.toThrow("Admins cannot remove their own admin role.");
  }
  expect(await alice.query(api.users.getRole)).toBe("admin");
});

test("role and status changes are recorded in the audit log", async () => {
  const t = convexTest(schema, import.meta.glob("../**/*.ts"));
  registerRateLimiter(t, "ratelimiter");
  const admin = t.withIdentity({ subject: "auth_admin", email: "admin@example.com" });
  const adminId = await admin.mutation(api.users.storeUser, { username: "admin" });
  await t.run((ctx) => ctx.db.patch(adminId, { role: "admin" }));
  const student = t.withIdentity({ subject: "auth_student", email: "student@example.com" });
  const studentId = await student.mutation(api.users.storeUser, { username: "student" });

  await admin.mutation(api.users.updateRole, { targetUserId: studentId, newRole: "content_manager" });
  await admin.mutation(api.users.toggleUserActive, { targetUserId: studentId, isActive: false });

  const entries = await t.run((ctx) =>
    ctx.db
      .query("userAuditLog")
      .withIndex("by_targetUserId", (q) => q.eq("targetUserId", studentId))
      .collect()
  );
  expect(
    entries.map(({ actorId, action, previousValue, newValue }) => ({ actorId, action, previousValue, newValue }))
  ).toEqual([
    { actorId: adminId, action: "role_changed", previousValue: "student", newValue: "content_manager" },
    { actorId: adminId, action: "status_changed", previousValue: "active", newValue: "suspended" },
  ]);
});
