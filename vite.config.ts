import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    // dev 於根路徑提供服務（http://localhost:5173/）；build 與 preview 則使用
    // GitHub Pages 子路徑 base（/MRTTRACKER/），與 dist 內的資源路徑一致。
    // 注意：vite preview 的 command 同為 'serve'，故需以 mode 區分。
    base: command === 'serve' && mode !== 'production' ? '/' : '/MRTTRACKER/',
    server: {
      port: 5173,
      host: true,
      // Dev proxy（僅 dev server 有效，不會被打包 / 上線）。目的：
      //   1. 瀏覽器一律打同源路徑 /metro，避免直接跨域回源造成 CORS 問題；
      //   2. 官方 API 金鑰只在「伺服器端（此 proxy）」注入並轉發，金鑰永遠
      //      不會出現在瀏覽器或 Vite 打包出的前端 JS bundle。
      // 請在 .env 設定：METRO_API_KEY（伺服器端密鑰）與 METRO_API_BASE_URL
      // （官方 API 主機）。未設定時，此 proxy 會直接回源（適用於不需金鑰的
      // 公開 API）。
      proxy: {
        '/metro': {
          target:
            env.METRO_API_BASE_URL ||
            'https://api.metro.taipei',
          changeOrigin: true,
          rewrite: (p: string) => p.replace(/^\/metro/, ''),
          configure: (proxy) => {
            // 在「伺服器端」附加金鑰，而不是在瀏覽器植入。
            const key = (env.METRO_API_KEY ?? '').trim();
            proxy.on('proxyReq', (proxyReq) => {
              if (key) proxyReq.setHeader('Authorization', `Bearer ${key}`);
            });
          },
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
  };
});

