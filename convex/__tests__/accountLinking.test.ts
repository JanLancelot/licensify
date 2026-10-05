import { convexTest } from "convex-test";
import { beforeAll, expect, test } from "vitest";
import { api } from "../_generated/api";
import schema from "../schema";
import { register as registerRateLimiter } from "@convex-dev/rate-limiter/test";
import { configureAuthEnv } from "./authTestEnv";

beforeAll(configureAuthEnv);

function setup() {
  const t = convexTest(schema, import.meta.glob("../**/*.ts"));
  registerRateLimiter(t, "ratelimiter");
  return t;
}

test("password sign-up cannot attach to an existing Google-verified admin", async () => {
  const t = setup();
  const adminId = await t.run(async (ctx) => {
    const now = Date.now();
    const id = await ctx.db.insert("users", {
      email: "owner@example.com",
      emailVerificationTime: now,
      username: "owner",
      role: "admin",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    await ctx.db.insert("authAccounts", {
      userId: id,
      provider: "google",
      providerAccountId: "google-sub-owner",
    });
    return id;
  });

  await expect(
    t.action(api.auth.signIn, {
      provider: "password",
      params: { email: "owner@example.com", password: "attacker-pass", flow: "signUp" },
    })
  ).rejects.toThrow("An account with this email already exists");

  const accounts = await t.run((ctx) =>
    ctx.db.query("authAccounts").filter((q) => q.eq(q.field("userId"), adminId)).collect()
  );
  expect(accounts.map((a) => a.provider)).toEqual(["google"]);
});

test("password sign-up leaves the email unverified", async () => {
  const t = setup();
  await t.action(api.auth.signIn, {
    provider: "password",
    params: { email: "new@example.com", password: "password123", flow: "signUp" },
  });
  const user = await t.run((ctx) =>
    ctx.db.query("users").withIndex("by_email", (q) => q.eq("email", "new@example.com")).first()
  );
  expect(user?.role).toBe("student");
  expect(user?.emailVerificationTime).toBeUndefined();
});
