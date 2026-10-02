import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  // Generated Convex JavaScript needs no transform. Avoid loading the mobile
  // tsconfig when running this standalone admin project's tests.
  plugins: [react({ exclude: [/node_modules/, /convex\/_generated\//] })],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: ["src/convex/**", "node_modules/**"],
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@convex": path.resolve(__dirname, "../convex"),
      "convex": path.resolve(__dirname, "./node_modules/convex"),
    },
  },
});
