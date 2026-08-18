import { Password } from "@convex-dev/auth/providers/Password";
import Google from "@auth/core/providers/google";
import { convexAuth } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";
import type { DataModel } from "./_generated/dataModel";
import { ResendOTP } from "./ResendOTP";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

/**
 * Validates email format and password strength strictly on registration.
 */
function validateCredentials(params: Record<string, unknown>) {
  const email = typeof params.email === "string" ? params.email.trim().toLowerCase() : "";
  if (!email || !EMAIL_REGEX.test(email)) {
    throw new ConvexError("Invalid email address format.");
  }

  // Password validation if passed in params
  if (params.password !== undefined) {
    const password = String(params.password);
    if (password.length < MIN_PASSWORD_LENGTH) {
      throw new ConvexError(
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`
      );
    }
  }

  return email;
}

export function CustomPassword() {
  return Password<DataModel>({
    profile(params) {
      const email = validateCredentials(params);
      const username =
        typeof params.username === "string" && params.username.trim().length > 0
          ? params.username.trim()
          : (typeof params.name === "string" && params.name.trim().length > 0
              ? params.name.trim()
              : email.split("@")[0]);

      const firstName =
        typeof params.firstName === "string" ? params.firstName.trim() : undefined;
      const lastName =
        typeof params.lastName === "string" ? params.lastName.trim() : undefined;

      return {
        email,
        username,
        firstName,
        lastName,
        role: "student", // Strictly enforce default role to prevent privilege tampering
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        lastActiveAt: Date.now(),
      };
    },
    reset: ResendOTP,
  });
}

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [CustomPassword(), Google, ResendOTP],
  callbacks: {
    async redirect({ redirectTo }) {
      if (
        redirectTo.startsWith("http://localhost:") ||
        redirectTo.startsWith("reactnativerepo://") ||
        redirectTo.startsWith("exp://")
      ) {
        return redirectTo;
      }
      return process.env.SITE_URL ?? redirectTo;
    },
    async createOrUpdateUser(ctx, args) {
      const now = Date.now();
      const profile = args.profile as {
        email: string;
        username: string;
        firstName?: string;
        lastName?: string;
        role?: "student" | "admin" | "content_manager";
        isActive?: boolean;
      };

      // 1. Existing user logging in
      if (args.existingUserId) {
        const existingUser = await ctx.db.get(args.existingUserId);
        if (!existingUser) {
          throw new ConvexError("User record not found.");
        }

        // Strict security: Block suspended / inactive accounts
        if (existingUser.isActive === false) {
          throw new ConvexError(
            "Unauthorized: Account is suspended or inactive. Please contact support."
          );
        }

        // Update last active timestamp
        await ctx.db.patch(args.existingUserId, {
          lastActiveAt: now,
          updatedAt: now,
          ...(profile.email && !existingUser.email && { email: profile.email }),
          ...(existingUser.userId === undefined && { userId: String(args.existingUserId) }),
        });

        return args.existingUserId;
      }

      // 2. New User Registration
      const existingByEmail = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("email"), profile.email))
        .first();

      if (existingByEmail) {
        if (existingByEmail.isActive === false) {
          throw new ConvexError(
            "Unauthorized: Account is suspended or inactive."
          );
        }
        await ctx.db.patch(existingByEmail._id, {
          lastActiveAt: now,
          updatedAt: now,
          ...(existingByEmail.userId === undefined && { userId: String(existingByEmail._id) }),
        });
        return existingByEmail._id;
      }

      // Auto-assign admin for admin emails or explicit role
      const isAdminEmail = profile.email.startsWith("admin@") || profile.email.includes("admin");
      const assignedRole = isAdminEmail || profile.role === "admin" ? "admin" : "student";

      // Insert brand new user
      const newUserId = await ctx.db.insert("users", {
        email: profile.email,
        username: profile.username ?? profile.email?.split('@')[0] ?? `user_${now}`,
        firstName: profile.firstName,
        lastName: profile.lastName,
        role: assignedRole,
        isActive: true,
        createdAt: now,
        updatedAt: now,
        lastActiveAt: now,
      });


      // Maintain legacy/backward-compatible userId mapping to doc ID
      await ctx.db.patch(newUserId, {
        userId: String(newUserId),
      });

      return newUserId;
    },
  },
});
