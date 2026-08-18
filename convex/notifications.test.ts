import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";
import { register as registerRateLimiter } from "@convex-dev/rate-limiter/test";

test("Notification & Study Room Invite System Tests", async () => {
  const t = convexTest(schema, import.meta.glob("./**/*.ts"));
  registerRateLimiter(t, "ratelimiter");

  // Create user identities
  const userA = t.withIdentity({ subject: "user_a_sub" });
  const userAId = await userA.mutation(api.auth.users.storeUser, {
    username: "alice",
  });

  const userB = t.withIdentity({ subject: "user_b_sub" });
  const userBId = await userB.mutation(api.auth.users.storeUser, {
    username: "bob",
  });

  // User A creates a study room
  const roomRes = await userA.mutation(api.collaboration.rooms.createStudyRoom, {
    name: "Architectural History Review",
    description: "Group discussion on Classical and Renaissance Architecture",
  });

  expect(roomRes.roomId).toBeDefined();

  // Test 1: User A invites User B to the study room
  const inviteRes = await userA.mutation(api.system.notifications.inviteUserToStudyRoom, {
    targetUserId: userBId,
    roomId: roomRes.roomId,
  });

  expect(inviteRes.success).toBe(true);

  // User B checks their notifications
  const userBNotifications = await userB.query(api.system.notifications.getUserNotifications, {
    unreadOnly: true,
  });

  expect(userBNotifications.length).toBe(1);
  expect(userBNotifications[0].type).toBe("study_room");
  expect(userBNotifications[0].title).toBe("Study Room Invite");
  expect(userBNotifications[0].data?.roomId).toBe(roomRes.roomId);
  expect(userBNotifications[0].data?.inviterName).toBe("alice");

  // Test 2: User B marks the notification as read
  const markRes = await userB.mutation(api.system.notifications.markAsRead, {
    notificationId: userBNotifications[0]._id,
  });

  expect(markRes.success).toBe(true);

  const remainingUnread = await userB.query(api.system.notifications.getUserNotifications, {
    unreadOnly: true,
  });
  expect(remainingUnread.length).toBe(0);

  // Test 3: Trigger automated study reminders
  const reminderRes = await userA.mutation(api.system.notifications.triggerStudyReminders, {});
  expect(reminderRes.success).toBe(true);
  expect(reminderRes.count).toBeGreaterThanOrEqual(2);

  // Check that User A received a daily study reminder notification
  const userANotifications = await userA.query(api.system.notifications.getUserNotifications, {
    unreadOnly: true,
  });
  expect(userANotifications.some((n) => n.title === "Daily ALE Board Exam Study Reminder")).toBe(true);
});
