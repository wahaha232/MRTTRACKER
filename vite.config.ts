import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages 子路徑部署：https://wahaha232.github.io/MRTTRACKER/
  // 固定 absolute base，配合 main.tsx 的 BrowserRouter basename，
  // 讓 SPA 路由在子路徑下正確匹配（避免顯示 404）。
  base: '/MRTTRACKER/',
  server: {
    port: 5173,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});

