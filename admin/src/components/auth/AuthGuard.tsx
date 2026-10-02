"use client";

import React, { useEffect } from "react";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useRouter, usePathname } from "next/navigation";
import { ShieldAlert, Loader2, RotateCcw } from "lucide-react";
import { BrandMark } from "@/components/brand/BrandMark";
import { useAuthActions } from "@convex-dev/auth/react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoading: authLoading, isAuthenticated } = useConvexAuth();
  const user = useQuery(api.users.getCurrentUserProfile);
  const router = useRouter();
  const pathname = usePathname();
  const { signOut } = useAuthActions();

  const isLoginPage = pathname === "/login";

  // Redirect unauthenticated or orphan sessions to login immediately
  useEffect(() => {
    if (!authLoading && !isAuthenticated && !isLoginPage) {
      router.replace("/login");
    } else if (!authLoading && isAuthenticated && user === null && !isLoginPage) {
      // Stale or deleted session in local storage
      signOut().then(() => router.replace("/login"));
    }
  }, [authLoading, isAuthenticated, user, isLoginPage, router, signOut]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  // 1. Session is loading or unauthenticated
  if (authLoading || (isAuthenticated && user === undefined)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-studio-50 dark:bg-studio-950 p-4">
        <div className="flex flex-col items-center gap-4 p-8 surface-panel rounded-xl border shadow-xl max-w-sm w-full text-center">
          <BrandMark className="w-16 h-16" />
          <div>
            <h3 className="font-bold text-base text-studio-900 dark:text-studio-100">
              P App
            </h3>
            <p className="text-xs text-studio-500 dark:text-studio-400 mt-1 flex items-center gap-1.5 justify-center">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Authenticating admin session...
            </p>
          </div>

          <div className="pt-3 border-t border-studio-200 dark:border-studio-800 w-full space-y-2">
            <button
              onClick={() => {
                signOut().finally(() => router.replace("/login"));
              }}
              className="w-full py-2 px-3 rounded-lg bg-studio-200 dark:bg-studio-800 hover:bg-studio-300 dark:hover:bg-studio-700 text-studio-900 dark:text-studio-100 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Go to Staff Login</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated or invalid user record
  if (!isAuthenticated || !user) {
    return null;
  }

  // 3. Check RBAC permission (only admin and content_manager)
  if (user.role !== "admin" && user.role !== "content_manager") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-studio-50 dark:bg-studio-950">
        <div className="max-w-md w-full surface-panel rounded-xl p-8 border border-rose-500/20 text-center shadow-2xl">
          <div className="w-14 h-14 mx-auto rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-studio-900 dark:text-studio-50">
            Access Restricted
          </h2>
          <p className="text-sm text-studio-600 dark:text-studio-400 mt-2 mb-6">
            Your account (<span className="font-mono text-xs font-semibold">{user.email || user.username}</span>) is assigned the <strong className="capitalize">{user.role}</strong> role. Admin privileges are required to access this portal.
          </p>
          <button
            onClick={() => signOut().then(() => router.push("/login"))}
            className="w-full py-2.5 px-4 rounded-lg bg-studio-800 hover:bg-studio-700 text-white text-sm font-semibold transition-colors shadow-sm"
          >
            Sign Out & Switch Account
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
