import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  return {
    plugins: [react()],
    // dev 於根路徑提供服務（http://localhost:5173/）；build 與 preview 則使用
    // GitHub Pages 子路徑 base（/MRTTRACKER/），與 dist 內的資源路徑一致。
    // 注意：vite preview 的 command 同為 'serve'，故需以 mode 區分。
    base: command === 'serve' && mode !== 'production' ? '/' : '/MRTTRACKER/',
    server: {
      port: 5173,
      host: true,
      // 不需要 dev proxy：Live Mode 的資料來自 cloudflare-worker/ 這支獨立
      // 部署的 Cloudflare Worker（見該目錄說明），它是公開的 HTTPS 端點且
      // 已設定好 CORS，本機開發與正式站都直接呼叫 VITE_METRO_API_BASE_URL
      // 指向的 Worker 網址即可，金鑰只存在 Worker 端，不經過這個 dev server。
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
  };
});

