import { defineApp } from "convex/server";
import ratelimiter from "@convex-dev/rate-limiter/convex.config";

const app = defineApp();
app.use(ratelimiter, { name: "ratelimiter" });

export default app;

