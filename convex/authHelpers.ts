import { QueryCtx, MutationCtx } from "./_generated/server";
import { Doc } from "./_generated/dataModel";

export type Role = "student" | "admin" | "content_manager";

/**
 * Retrieves the logged in user's document from the database using identity mapping.
 * Returns null if the user is unauthenticated or not yet registered in the users table.
 */
export async function getCurrentUser(
  ctx: QueryCtx | MutationCtx
): Promise<Doc<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }

  // Look up user by Convex Auth userId string index
  const user = await ctx.db
    .query("users")
    .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
    .first();

  return user;
}

/**
 * Asserts that the caller is authenticated and exists in the database.
 * Throws an Error if not authenticated.
 */
export async function requireUser(
  ctx: QueryCtx | MutationCtx
): Promise<Doc<"users">> {
  const user = await getCurrentUser(ctx);
  if (!user) {
    throw new Error("Unauthenticated: User identity not found or active in system.");
  }
  if (!user.isActive) {
    throw new Error("Unauthorized: User account is suspended or inactive.");
  }
  return user;
}

/**
 * Asserts that the caller has one of the allowed RBAC roles.
 * Throws an Error if authorization fails.
 */
export async function requireRole(
  ctx: QueryCtx | MutationCtx,
  allowedRoles: Role[]
): Promise<Doc<"users">> {
  const user = await requireUser(ctx);
  if (!allowedRoles.includes(user.role as Role)) {
    throw new Error(
      `Forbidden: Insufficient privileges. Allowed roles: ${allowedRoles.join(", ")}`
    );
  }
  return user;
}

/**
 * Asserts that the caller is an Administrator.
 */
export async function requireAdmin(
  ctx: QueryCtx | MutationCtx
): Promise<Doc<"users">> {
  return requireRole(ctx, ["admin"]);
}

/**
 * Asserts that the caller is a Content Manager or Admin.
 */
export async function requireContentManager(
  ctx: QueryCtx | MutationCtx
): Promise<Doc<"users">> {
  return requireRole(ctx, ["content_manager", "admin"]);
}
