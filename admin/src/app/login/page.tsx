"use client";

import React, { useState, useEffect } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useRouter } from "next/navigation";
import { Compass, KeyRound, Mail, Eye, EyeOff, Loader2, ShieldCheck, AlertCircle, Lock } from "lucide-react";

export default function LoginPage() {
  const { signIn } = useAuthActions();
  const { isAuthenticated } = useConvexAuth();
  const user = useQuery(api.users.getCurrentUserProfile);
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already authenticated and has proper role, redirect to dashboard
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
      setError("Please provide your staff email and password.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await signIn("password", {
        email: email.trim().toLowerCase(),
        password,
        flow: "signIn",
      });
      router.push("/");
    } catch (err: any) {
      console.error("Staff auth error:", err);
      setError(
        err?.message?.includes("Invalid")
          ? "Invalid email or password credentials."
          : err?.message || "Authentication failed. Please verify your staff credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-studio-50 dark:bg-studio-950 bg-blueprint-grid">
      <div className="w-full max-w-md">
        {/* Brand Banner */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blueprint-600 to-blueprint-400 text-white shadow-glow mb-4">
            <Compass className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-studio-900 dark:text-studio-50 tracking-tight">
            Curriculum Studio
          </h1>
          <p className="text-sm text-studio-500 dark:text-studio-400 mt-1.5">
            Architecture Licensure Exam (ALE) Admin Portal
          </p>
        </div>

        {/* Auth Card */}
        <div className="glass-modal rounded-3xl p-6 sm:p-8">
          <div className="flex items-center justify-between gap-2 mb-6 pb-4 border-b border-studio-200 dark:border-studio-800">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blueprint-500" />
              <h2 className="font-semibold text-base text-studio-900 dark:text-studio-100">
                Staff Authentication
              </h2>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-studio-200 dark:bg-studio-800 text-studio-600 dark:text-studio-400 border border-studio-300 dark:border-studio-700">
              Restricted
            </span>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-studio-700 dark:text-studio-300 uppercase tracking-wider mb-1.5">
                Staff Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-studio-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="faculty@reapp.com"
                  required
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-studio-100/70 dark:bg-studio-800/70 border border-studio-200 dark:border-studio-700 text-sm focus:outline-none focus:ring-2 focus:ring-blueprint-500 dark:focus:ring-blueprint-400 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-studio-700 dark:text-studio-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-studio-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-studio-100/70 dark:bg-studio-800/70 border border-studio-200 dark:border-studio-700 text-sm focus:outline-none focus:ring-2 focus:ring-blueprint-500 dark:focus:ring-blueprint-400 transition-all"
                />
                <button
                  type="button"
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
              className="w-full mt-2 py-3 px-4 rounded-xl bg-blueprint-600 hover:bg-blueprint-700 active:scale-[0.99] text-white text-sm font-semibold shadow-md shadow-blueprint-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Authenticate & Enter Studio</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Security Notice */}
        <div className="text-center mt-6 space-y-1">
          <p className="text-xs text-studio-400 dark:text-studio-500">
            Internal administrative portal for authorized reviewers and faculty only.
          </p>
          <p className="text-[11px] text-studio-500 dark:text-studio-600">
            To request reviewer access, contact your Lead Administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
