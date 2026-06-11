import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    include: [
      "src/**/*.{spec,test}.ts",
      "tests/**/*.{spec,test}.ts",
      "tests/unit/**/*.{spec,test}.ts",
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
