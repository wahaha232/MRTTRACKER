import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // dev 於根路徑提供服務（http://localhost:5173/），build 產物才使用
  // GitHub Pages 子路徑 base（/MRTTRACKER/）。配合 main.tsx 的
  // BrowserRouter basename={import.meta.env.BASE_URL}，兩邊路由皆正確。
  base: command === 'build' ? '/MRTTRACKER/' : '/',
  server: {
    port: 5173,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
}));

