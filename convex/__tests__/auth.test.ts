import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "../_generated/api";
import schema from "../schema";
import { register as registerRateLimiter } from "@convex-dev/rate-limiter/test";

test("Convex Auth Backend Security and Role Enforcement Tests", async () => {
  const t = convexTest(schema, import.meta.glob("../**/*.ts"));
  registerRateLimiter(t, "ratelimiter");

  // 1. Unauthenticated user cannot call requireUser / profile update
  const unauthedProfile = await t.query(api.users.getCurrentUserProfile);
  expect(unauthedProfile).toBeNull();

  await expect(
    t.mutation(api.users.updateProfile, { username: "hacker" })
  ).rejects.toThrow("Unauthenticated");

  // 2. New authenticated student registration via storeUser
  const studentAuth = t.withIdentity({
    subject: "auth_student_001",
    email: "student@example.com",
    name: "Architect Jane",
  });

  const studentId = await studentAuth.mutation(api.users.storeUser, {
    username: "arch_jane",
    firstName: "Jane",
    lastName: "Doe",
  });
  expect(studentId).toBeDefined();

  // Verify profile retrieval
  const studentProfile = await studentAuth.query(api.users.getCurrentUserProfile);
  expect(studentProfile).not.toBeNull();
  expect(studentProfile?.username).toBe("arch_jane");
  expect(studentProfile?.email).toBe("student@example.com");
  expect(studentProfile?.role).toBe("student");
  expect(studentProfile?.isActive).toBe(true);

  // 3. Role-based Access Control: Student cannot invoke admin mutations
  const adminAuth = t.withIdentity({
    subject: "auth_admin_001",
    email: "admin@example.com",
  });
  const adminId = await adminAuth.mutation(api.users.storeUser, {
    username: "super_admin",
  });
  await t.run(async (ctx) => {
    await ctx.db.patch(adminId, { role: "admin" });
  });

  // Student trying to elevate role should fail
  await expect(
    studentAuth.mutation(api.users.updateRole, {
      targetUserId: studentId,
      newRole: "admin",
    })
  ).rejects.toThrow("Forbidden: Insufficient privileges");

  // Admin elevating role succeeds
  const updateResult = await adminAuth.mutation(api.users.updateRole, {
    targetUserId: studentId,
    newRole: "content_manager",
  });
  expect(updateResult.success).toBe(true);

  const updatedRole = await studentAuth.query(api.users.getRole);
  expect(updatedRole).toBe("content_manager");

  // 4. Inactive/Suspended Account Lockout
  await t.run(async (ctx) => {
    await ctx.db.patch(studentId, { isActive: false });
  });

  // Suspended user should be blocked from protected actions
  await expect(
    studentAuth.mutation(api.users.updateProfile, { username: "new_name" })
  ).rejects.toThrow("Unauthorized: User account is suspended or inactive.");
});
