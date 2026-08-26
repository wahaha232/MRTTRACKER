import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => ({
  plugins: [react()],
  // dev 於根路徑提供服務（http://localhost:5173/）；build 與 preview 則使用
  // GitHub Pages 子路徑 base（/MRTTRACKER/），與 dist 內的資源路徑一致。
  // 注意：vite preview 的 command 同為 'serve'，故需以 mode 區分。
  base: command === 'serve' && mode !== 'production' ? '/' : '/MRTTRACKER/',
  server: {
    port: 5173,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
}));

