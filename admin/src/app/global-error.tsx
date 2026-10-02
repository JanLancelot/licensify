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
      <body className="bg-studio-950 text-studio-50 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-xl bg-studio-900 border border-studio-700 text-center shadow-2xl">
          <h2 className="text-xl font-bold mb-2">P App Notice</h2>
          <p className="text-xs text-studio-400 mb-6">
            {error?.message || "An unexpected error occurred."}
          </p>
          <button
            onClick={() => reset()}
            className="w-full py-2.5 px-4 rounded-lg btn-primary text-xs font-semibold"
          >
            Reload P App
          </button>
        </div>
      </body>
    </html>
  );
}
