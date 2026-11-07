import { convexTest } from "convex-test";
import { beforeAll, expect, test } from "vitest";
import { api, internal } from "../_generated/api";
import schema from "../schema";
import { register as registerRateLimiter } from "@convex-dev/rate-limiter/test";
import { configureAuthEnv } from "./authTestEnv";

beforeAll(configureAuthEnv);

function setup() {
  const t = convexTest(schema, import.meta.glob("../**/*.ts"));
  registerRateLimiter(t, "ratelimiter");
  return t;
}

async function roleOf(t: ReturnType<typeof setup>, email: string) {
  const user = await t.run((ctx) =>
    ctx.db.query("users").withIndex("by_email", (q) => q.eq("email", email)).first()
  );
  return user?.role;
}

test.each(["admin@example.com", "notanadmin@example.com", "sysadmin.fan@example.com"])(
  "self sign-up with %s creates a student",
  async (email) => {
    const t = setup();
    await t.action(api.auth.signIn, {
      provider: "password",
      params: { email, password: "password123", flow: "signUp", role: "admin" },
    });
    expect(await roleOf(t, email)).toBe("student");
  }
);

test("operator createAdminUser still provisions an admin without returning tokens", async () => {
  const t = setup();
  const result = await t.action(internal.admin.createAdminUser, {
    email: "Staff@Example.com",
    password: "password123",
  });
  expect(result).not.toHaveProperty("result");
  expect(await roleOf(t, "staff@example.com")).toBe("admin");
});
