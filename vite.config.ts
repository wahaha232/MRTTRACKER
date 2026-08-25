import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 使用相對路徑，使 build 產物可部署於 GitHub Pages 子路徑
  //（https://wahaha232.github.io/MRTTRACKER/）與本機根目錄。
  base: './',
  server: {
    port: 5173,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});

