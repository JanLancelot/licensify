import { convexTest } from "convex-test";
import { afterEach, expect, test, vi } from "vitest";
import { api } from "../_generated/api";
import schema from "../schema";
import { register as registerRateLimiter } from "@convex-dev/rate-limiter/test";

afterEach(() => vi.useRealTimers());

async function setup() {
  const t = convexTest(schema, import.meta.glob("../**/*.ts"));
  registerRateLimiter(t, "ratelimiter");
  const alice = t.withIdentity({ subject: "auth_alice", email: "alice@example.com" });
  await alice.mutation(api.users.storeUser, { username: "alice" });
  const store = () => t.run((ctx) => ctx.storage.store(new Blob(["file"])));
  const exists = async (id: string) => (await t.run((ctx) => ctx.db.system.get(id as any))) !== null;
  return { t, alice, store, exists };
}

test("replacing a claimed profile image deletes the old file", async () => {
  const { alice, store, exists } = await setup();
  const first = await store();
  await alice.mutation(api.users.updateProfile, { profileImageId: first });
  const second = await store();
  await alice.mutation(api.users.updateProfile, { profileImageId: second });

  expect(await exists(first)).toBe(false);
  expect(await exists(second)).toBe(true);
});

test("a user cannot adopt and then delete a file they did not upload", async () => {
  const { alice, store, exists } = await setup();
  vi.useFakeTimers({ toFake: ["Date"] });
  const materialFile = await store();
  const otherAvatar = await store();
  vi.setSystemTime(Date.now() + 11 * 60 * 1000);

  // Old files (study materials, other users' avatars) cannot be claimed.
  await expect(
    alice.mutation(api.users.updateProfile, { profileImageId: otherAvatar })
  ).rejects.toThrow("Upload the profile image again");

  // Legacy references without a claim are never deleted on replacement.
  const aliceId = (await alice.query(api.users.getCurrentUserProfile))!._id;
  await alice.run((ctx) => ctx.db.patch(aliceId, { profileImageId: materialFile }));
  await alice.mutation(api.users.updateProfile, { profileImageId: null });
  expect(await exists(materialFile)).toBe(true);
});

test("a file already claimed by another user cannot be claimed again", async () => {
  const { t, alice, store, exists } = await setup();
  const bob = t.withIdentity({ subject: "auth_bob", email: "bob@example.com" });
  await bob.mutation(api.users.storeUser, { username: "bob" });

  const bobsAvatar = await store();
  await bob.mutation(api.users.updateProfile, { profileImageId: bobsAvatar });
  await expect(
    alice.mutation(api.users.updateProfile, { profileImageId: bobsAvatar })
  ).rejects.toThrow("Upload the profile image again");
  expect(await exists(bobsAvatar)).toBe(true);
});

