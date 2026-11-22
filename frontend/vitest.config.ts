import { defineConfig } from "vitest/config";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";

export default defineConfig({
  optimizeDeps: { include: ["@reduxjs/toolkit/query", "@reduxjs/toolkit/query/react"] },
  plugins: [storybookTest({ configDir: ".storybook" })],
  test: {
    name: "storybook",
    maxWorkers: 1,
    fileParallelism: false,
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: "chromium" }],
    },
  },
});
