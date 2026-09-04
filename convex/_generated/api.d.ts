/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ResendOTP from "../ResendOTP.js";
import type * as admin from "../admin.js";
import type * as attempts from "../attempts.js";
import type * as auth from "../auth.js";
import type * as authHelpers from "../authHelpers.js";
import type * as branches from "../branches.js";
import type * as crons from "../crons.js";
import type * as flashcards from "../flashcards.js";
import type * as http from "../http.js";
import type * as lessons from "../lessons.js";
import type * as materials from "../materials.js";
import type * as notifications from "../notifications.js";
import type * as questions from "../questions.js";
import type * as quizzes from "../quizzes.js";
import type * as rooms from "../rooms.js";
import type * as seed from "../seed.js";
import type * as seedAssessments from "../seedAssessments.js";
import type * as subjects from "../subjects.js";
import type * as sync from "../sync.js";
import type * as topics from "../topics.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  ResendOTP: typeof ResendOTP;
  admin: typeof admin;
  attempts: typeof attempts;
  auth: typeof auth;
  authHelpers: typeof authHelpers;
  branches: typeof branches;
  crons: typeof crons;
  flashcards: typeof flashcards;
  http: typeof http;
  lessons: typeof lessons;
  materials: typeof materials;
  notifications: typeof notifications;
  questions: typeof questions;
  quizzes: typeof quizzes;
  rooms: typeof rooms;
  seed: typeof seed;
  seedAssessments: typeof seedAssessments;
  subjects: typeof subjects;
  sync: typeof sync;
  topics: typeof topics;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  ratelimiter: import("@convex-dev/rate-limiter/_generated/component.js").ComponentApi<"ratelimiter">;
};
