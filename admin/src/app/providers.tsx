"use client";

import React, { useMemo } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ThemeProvider } from "@/context/ThemeContext";
import { ToastProvider } from "@/context/ToastContext";

export function Providers({ children }: { children: React.ReactNode }) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "https://convex.dev";

  const convex = useMemo(() => {
    return new ConvexReactClient(convexUrl, {
      unsavedChangesWarning: false,
    });
  }, [convexUrl]);

  return (
    <ConvexAuthProvider client={convex}>
      <ThemeProvider>
        <ToastProvider>{children}</ToastProvider>
      </ThemeProvider>
    </ConvexAuthProvider>
  );
}
