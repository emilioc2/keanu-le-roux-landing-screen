/**
 * Vitest configuration for the Keanu Le Roux Financial Advisor website.
 * Uses jsdom environment for DOM testing, mirrors tsconfig path aliases,
 * and includes a setup file for Testing Library matchers.
 */
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    // Use jsdom to simulate a browser DOM environment for component tests
    environment: "jsdom",

    // Global setup file — registers Testing Library custom matchers (e.g. toBeInTheDocument)
    setupFiles: ["./vitest.setup.ts"],

    // Include test files matching these patterns
    include: ["src/**/*.{test,spec}.{ts,tsx}"],

    // Enable global test APIs (describe, it, expect) without explicit imports
    globals: true,
  },

  resolve: {
    alias: {
      // Mirror the @/* path alias from tsconfig.json so imports resolve in tests
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
