import { cronJobs } from "convex/server";
import { api } from "./_generated/api";

const crons = cronJobs();

// Trigger automated daily study reminders every day at 8:00 AM UTC
crons.daily(
  "daily-study-reminder",
  { hourUTC: 8, minuteUTC: 0 },
  api.notifications.triggerStudyReminders
);

export default crons;
