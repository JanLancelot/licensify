import { QueryCtx, MutationCtx } from "../_generated/server";
import { Doc, Id } from "../_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";

export type Role = "student" | "admin" | "content_manager";

/**
 * Retrieves the logged in user's document from the database using identity mapping.
 * Returns null if the user is unauthenticated or not yet registered in the users table.
 */
export async function getCurrentUser(
  ctx: QueryCtx | MutationCtx
): Promise<Doc<"users"> | null> {
  // 1. Official Convex Auth user resolution
  try {
    const authUserId = await getAuthUserId(ctx);
    if (authUserId) {
      const user = await ctx.db.get(authUserId as Id<"users">);
      if (user) {
        return user;
      }
    }
  } catch {
    // Continue to fallback lookups
  }

  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }

  // 2. Look up user by Convex Auth userId string index
  let user = await ctx.db
    .query("users")
    .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
    .first();

  if (user) {
    return user;
  }

  // 3. Direct document ID lookup if identity.subject is the user _id
  try {
    const candidate = await ctx.db.get(identity.subject as any);
    if (candidate && "role" in candidate && "isActive" in candidate) {
      return candidate as Doc<"users">;
    }
  } catch {
    // Subject string might not be a valid Id<"users"> format
  }

  // 4. Lookup by email if available in identity token
  if (identity.email) {
    user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();
    if (user) {
      return user;
    }
  }

  return null;
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
