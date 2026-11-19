import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.{ts,tsx}", "**/__tests__/**/*.test.{ts,tsx}"],
    exclude: ["node_modules", ".next", "backend"],
    coverage: {
      reporter: ["text", "html"],
      include: ["components/**", "lib/**", "app/**"],
      exclude: ["**/*.d.ts", "node_modules", ".next"],
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "."),
    },
  },
});
