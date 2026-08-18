/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as _helpers_ResendOTP from "../_helpers/ResendOTP.js";
import type * as _helpers_authHelpers from "../_helpers/authHelpers.js";
import type * as admin_admin from "../admin/admin.js";
import type * as assessments_attempts from "../assessments/attempts.js";
import type * as assessments_questions from "../assessments/questions.js";
import type * as assessments_quizzes from "../assessments/quizzes.js";
import type * as auth from "../auth.js";
import type * as auth_users from "../auth/users.js";
import type * as collaboration_rooms from "../collaboration/rooms.js";
import type * as crons from "../crons.js";
import type * as http from "../http.js";
import type * as learning_flashcards from "../learning/flashcards.js";
import type * as learning_materials from "../learning/materials.js";
import type * as learning_subjects from "../learning/subjects.js";
import type * as learning_topics from "../learning/topics.js";
import type * as seed from "../seed.js";
import type * as system_notifications from "../system/notifications.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "_helpers/ResendOTP": typeof _helpers_ResendOTP;
  "_helpers/authHelpers": typeof _helpers_authHelpers;
  "admin/admin": typeof admin_admin;
  "assessments/attempts": typeof assessments_attempts;
  "assessments/questions": typeof assessments_questions;
  "assessments/quizzes": typeof assessments_quizzes;
  auth: typeof auth;
  "auth/users": typeof auth_users;
  "collaboration/rooms": typeof collaboration_rooms;
  crons: typeof crons;
  http: typeof http;
  "learning/flashcards": typeof learning_flashcards;
  "learning/materials": typeof learning_materials;
  "learning/subjects": typeof learning_subjects;
  "learning/topics": typeof learning_topics;
  seed: typeof seed;
  "system/notifications": typeof system_notifications;
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
