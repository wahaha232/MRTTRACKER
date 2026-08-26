import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // 與 vite.config.ts 的 base 一致（GitHub Pages 子路徑），但測試時主要跑純邏輯。
    globals: false,
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
