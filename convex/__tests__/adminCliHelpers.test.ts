import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api, internal } from "../_generated/api";
import schema from "../schema";
import { register as registerRateLimiter } from "@convex-dev/rate-limiter/test";
import * as admin from "../admin";

test("role promotion is only reachable as an internal function", async () => {
  const t = convexTest(schema, import.meta.glob("../**/*.ts"));
  registerRateLimiter(t, "ratelimiter");

  const student = t.withIdentity({ subject: "auth_cli_student", email: "student@example.com" });
  const studentId = await student.mutation(api.users.storeUser, { username: "student" });

  // convex-test does not enforce visibility, so assert the registration itself.
  for (const fn of [admin.promoteUserToAdmin, admin.createAdminUser]) {
    expect((fn as any).isInternal).toBe(true);
    expect((fn as any).isPublic).toBeFalsy();
  }

  // Operators can still promote from the dashboard or CLI.
  await t.mutation(internal.admin.promoteUserToAdmin, {
    email: "student@example.com",
    role: "content_manager",
  });
  expect((await t.run((ctx) => ctx.db.get(studentId)))?.role).toBe("content_manager");
});
