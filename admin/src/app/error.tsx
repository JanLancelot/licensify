"use client";

import React from "react";
import { RotateCcw, AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-studio-50 dark:bg-studio-950 bg-blueprint-grid">
      <div className="glass-panel max-w-md w-full p-8 rounded-3xl border border-rose-500/20 text-center shadow-2xl">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-studio-900 dark:text-studio-50">
          Curriculum Studio Notice
        </h2>
        <p className="text-xs text-studio-600 dark:text-studio-400 mt-2 mb-6">
          {error?.message || "An unexpected error occurred while loading the portal."}
        </p>
        <button
          onClick={() => reset()}
          className="w-full py-2.5 px-4 rounded-xl bg-blueprint-600 hover:bg-blueprint-700 text-white text-xs font-semibold shadow-sm flex items-center justify-center gap-2 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Retry Connection</span>
        </button>
      </div>
    </div>
  );
}
