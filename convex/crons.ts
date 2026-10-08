import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Trigger automated daily study reminders every day at 8:00 AM UTC
crons.daily(
  "daily-study-reminder",
  { hourUTC: 8, minuteUTC: 0 },
  internal.notifications.triggerStudyReminders
);

export default crons;
