"use client";

import { AuthErrorAlert, AuthErrorInfo, parseAuthError } from "@/components/auth/AuthErrorAlert";
import { BrandMark } from "@/components/brand/BrandMark";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "@convex/_generated/api";
import { useConvexAuth, useQuery } from "convex/react";
import { Eye, EyeOff, KeyRound, Loader2, Lock, Mail, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function LoginPage() {
  const { signIn } = useAuthActions();
  const { isAuthenticated } = useConvexAuth();
  const user = useQuery(api.users.getCurrentUserProfile);
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<AuthErrorInfo | null>(null);

  // If already authenticated and has staff clearance, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "admin" || user.role === "content_manager") {
        router.push("/");
      }
    }
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setAuthError({
        type: "server_error",
        title: "Required Fields",
        message: "Please enter both your staff email address and password.",
      });
      return;
    }

    setLoading(true);
    setAuthError(null);

    try {
      await signIn("password", {
        email: email.trim().toLowerCase(),
        password,
        flow: "signIn",
      });
      router.push("/");
    } catch (err: any) {
      // Fallback: If user doesn't exist yet, attempt registration
      try {
        await signIn("password", {
          email: email.trim().toLowerCase(),
          password,
          flow: "signUp",
        });
        router.push("/");
      } catch (signUpErr: any) {
        console.error("Staff sign-in error:", err);
        setAuthError(parseAuthError(err));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-10 bg-studio-50 dark:bg-studio-950">
      <div className="w-full max-w-md">
        {/* Brand Banner */}
        <div className="text-center mb-8">
          <BrandMark className="h-20 w-20 mx-auto mb-5 border border-studio-200" />
          <p className="text-[10px] uppercase tracking-[0.24em] font-semibold text-brand-700 dark:text-brand-400 mb-2">Architecture • Licensure • Excellence</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-studio-900 dark:text-studio-50 tracking-tight">
            P App
          </h1>
          <p className="text-sm text-studio-500 dark:text-studio-400 mt-1.5">
            Architecture Licensure Exam (ALE) Admin Portal
          </p>
        </div>

        {/* Auth Card */}
        <div className="surface-panel brand-banner relative overflow-hidden rounded-xl p-6 sm:p-8">
          <div className="flex items-center justify-between gap-2 mb-6 pb-4 border-b border-studio-200 dark:border-studio-800">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              <h2 className="font-semibold text-base text-studio-900 dark:text-studio-100">
                Staff Authentication
              </h2>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-studio-200 dark:bg-studio-800 text-studio-600 dark:text-studio-400 border border-studio-300 dark:border-studio-700">
              Restricted
            </span>
          </div>

          {/* Dedicated Error Component */}
          <AuthErrorAlert error={authError} onDismiss={() => setAuthError(null)} />

          <form onSubmit={handleSubmit} className="relative z-10 space-y-5">
            <div>
              <label htmlFor="staff-email" className="block text-xs font-semibold text-studio-700 dark:text-studio-300 uppercase tracking-wider mb-1.5">
                Staff Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-studio-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="staff-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (authError) setAuthError(null);
                  }}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-studio-100/70 dark:bg-studio-800/70 border border-studio-200 dark:border-studio-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-brand-400 transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="staff-password" className="block text-xs font-semibold text-studio-700 dark:text-studio-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-studio-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  id="staff-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (authError) setAuthError(null);
                  }}
                  placeholder="••••••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-studio-100/70 dark:bg-studio-800/70 border border-studio-200 dark:border-studio-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-brand-400 transition-all"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-studio-400 hover:text-studio-600 dark:hover:text-studio-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-lg btn-primary active:scale-[0.99] text-sm font-semibold shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Sign in to P App</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Security Notice */}
        <div className="text-center mt-6 space-y-1">
          <p className="text-xs text-studio-500 dark:text-studio-400">
            Internal administrative portal for authorized reviewers and faculty only.
          </p>
          <p className="text-[11px] text-studio-500 dark:text-studio-400">
            To request reviewer access, contact your Lead Administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
