"use client";

import React from "react";
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-900 text-white min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-800 border border-slate-700 text-center shadow-2xl">
          <h2 className="text-xl font-bold mb-2">Curriculum Studio Notice</h2>
          <p className="text-xs text-slate-400 mb-6">
            {error?.message || "An unexpected error occurred."}
          </p>
          <button
            onClick={() => reset()}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
          >
            Reload Studio
          </button>
        </div>
      </body>
    </html>
  );
}
