"use client";

import React from "react";
import { AlertCircle, Lock, ShieldAlert, KeyRound, X } from "lucide-react";

export interface AuthErrorInfo {
  type: "not_found" | "invalid_password" | "unauthorized" | "server_error";
  title: string;
  message: string;
}

interface AuthErrorAlertProps {
  error: string | AuthErrorInfo | null;
  onDismiss?: () => void;
}

export function parseAuthError(err: any): AuthErrorInfo {
  const errStr = (err?.message || err?.toString() || "").toLowerCase();

  if (
    errStr.includes("invalidaccountid") ||
    errStr.includes("account not found") ||
    errStr.includes("no account") ||
    errStr.includes("user record not found")
  ) {
    return {
      type: "not_found",
      title: "Staff Account Not Found",
      message: "No staff account exists with this email address. Please check your spelling or contact your lead administrator.",
    };
  }

  if (
    errStr.includes("invalidsecret") ||
    errStr.includes("invalid password") ||
    errStr.includes("password")
  ) {
    return {
      type: "invalid_password",
      title: "Incorrect Password",
      message: "The password entered does not match this staff account. Please verify your credentials and try again.",
    };
  }

  if (
    errStr.includes("suspended") ||
    errStr.includes("inactive") ||
    errStr.includes("unauthorized") ||
    errStr.includes("role")
  ) {
    return {
      type: "unauthorized",
      title: "Access Restricted",
      message: "Your account is not authorized for staff access or is currently inactive. Contact system administration for clearance.",
    };
  }

  return {
    type: "server_error",
    title: "Authentication Error",
    message: typeof err === "string" ? err : err?.message || "Unable to complete sign-in. Please verify your internet connection and try again.",
  };
}

export function AuthErrorAlert({ error, onDismiss }: AuthErrorAlertProps) {
  if (!error) return null;

  const info: AuthErrorInfo = typeof error === "string" ? parseAuthError(error) : error;

  const getIcon = () => {
    switch (info.type) {
      case "not_found":
        return <ShieldAlert className="w-5 h-5 text-amber-500 flex-shrink-0" />;
      case "invalid_password":
        return <KeyRound className="w-5 h-5 text-rose-500 flex-shrink-0" />;
      case "unauthorized":
        return <Lock className="w-5 h-5 text-rose-600 flex-shrink-0" />;
      default:
        return <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />;
    }
  };

  const getColors = () => {
    switch (info.type) {
      case "not_found":
        return "bg-amber-500/10 border-amber-500/25 text-amber-900 dark:text-amber-200";
      case "invalid_password":
      case "unauthorized":
      default:
        return "bg-rose-500/10 border-rose-500/25 text-rose-900 dark:text-rose-200";
    }
  };

  return (
    <div
      role="alert"
      className={`p-4 rounded-2xl border flex items-start gap-3.5 mb-5 transition-all animate-fade-in ${getColors()}`}
    >
      <div className="mt-0.5">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-bold uppercase tracking-wider mb-0.5">
          {info.title}
        </h4>
        <p className="text-xs leading-relaxed opacity-90">
          {info.message}
        </p>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Dismiss error"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
