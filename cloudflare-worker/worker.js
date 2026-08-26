// ---------------------------------------------------------------------------
// METRO QUEST — TDX LiveBoard Proxy (Cloudflare Worker)
//
// 這支 Worker 是唯一持有 TDX Client ID / Client Secret 的地方。前端
// （GitHub Pages 靜態網站）只會呼叫這支 Worker 的網址，Worker 在伺服器端
// 用金鑰跟 TDX 換 access token、代為呼叫台北捷運（TRTC）的車站電子看板
// API（LiveBoard），再把結果轉發回前端。金鑰絕不會出現在瀏覽器端。
//
// 部署方式（一次性設定）：
//   1. npm install -g wrangler（或用 npx wrangler）
//   2. 在本目錄執行：wrangler login
//   3. 設定金鑰（不要寫進 wrangler.toml，一律用 secret 指令）：
//        wrangler secret put TDX_CLIENT_ID
//        wrangler secret put TDX_CLIENT_SECRET
//   4. 部署：wrangler deploy
//   5. 部署完成後會得到一個網址，例如：
//        https://mrttracker-tdx-proxy.<你的-subdomain>.workers.dev
//      把這個網址設定成前端的 VITE_METRO_API_BASE_URL（GitHub Actions
//      build 環境變數，或本機 .env）。
//
// 資料模型注意：TDX 提供的是「捷運車站電子看板」（某站還有哪些車次、預估
// 幾秒後到站），不是列車即時 GPS 位置，前端也是依此設計（顯示到站看板，
// 而非地圖上移動的列車圖示）。
// ---------------------------------------------------------------------------

const TDX_TOKEN_URL =
  'https://tdx.transportdata.tw/auth/realms/TDXConnect/protocol/openid-connect/token';
const TDX_LIVEBOARD_URL =
  'https://tdx.transportdata.tw/api/basic/v2/Rail/Metro/LiveBoard/TRTC?$format=JSON';

// 這個 Worker 只轉發公開的捷運到站看板資料（不含任何機密），且已用快取
// 限制實際打到 TDX 的次數，所以 CORS 開放給任何來源呼叫，本機開發
// （http://localhost:5173）也不需要額外設定就能直接呼叫。

// LiveBoard 回應快取秒數：同一分鐘內不論多少使用者連線，Worker 最多只會
// 向 TDX 發出一次請求，避免多人同時瀏覽網站時打爆 TDX 的用量額度。
const CACHE_TTL_SECONDS = 12;

// Access token 快取在記憶體中（同一個 Worker isolate 生命週期內有效）。
let cachedToken = null;
let cachedTokenExpiry = 0;

async function getAccessToken(env) {
  const now = Date.now();
  if (cachedToken && now < cachedTokenExpiry) {
    return cachedToken;
  }
  const res = await fetch(TDX_TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: env.TDX_CLIENT_ID,
      client_secret: env.TDX_CLIENT_SECRET,
    }),
  });
  if (!res.ok) {
    throw new Error(`TDX token request failed: ${res.status}`);
  }
  const data = await res.json();
  cachedToken = data.access_token;
  // 官方 token 效期通常是 24 小時；提早 60 秒視為過期，避免邊界問題。
  const expiresInMs = (Number(data.expires_in) || 24 * 60 * 60) * 1000;
  cachedTokenExpiry = now + Math.max(60_000, expiresInMs - 60_000);
  return cachedToken;
}

function withCors(headers) {
  const h = new Headers(headers);
  h.set('Access-Control-Allow-Origin', '*');
  h.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  h.set('Access-Control-Allow-Headers', 'Content-Type');
  return h;
}

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: withCors({}) });
    }
    if (request.method !== 'GET') {
      return new Response('Method Not Allowed', { status: 405, headers: withCors({}) });
    }

    // 用固定的 cache key（不含使用者請求的個別參數），確保所有使用者共用同一份快取。
    const cache = caches.default;
    const cacheKey = new Request(TDX_LIVEBOARD_URL, { method: 'GET' });
    const cached = await cache.match(cacheKey);
    if (cached) {
      return new Response(cached.body, { status: cached.status, headers: withCors(cached.headers) });
    }

    try {
      const token = await getAccessToken(env);
      const tdxRes = await fetch(TDX_LIVEBOARD_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Accept-Encoding': 'gzip',
        },
      });
      if (!tdxRes.ok) {
        return new Response(JSON.stringify({ error: `TDX responded ${tdxRes.status}` }), {
          status: 502,
          headers: withCors({ 'content-type': 'application/json' }),
        });
      }
      const body = await tdxRes.text();
      const response = new Response(body, {
        status: 200,
        headers: {
          'content-type': 'application/json',
          'cache-control': `public, max-age=${CACHE_TTL_SECONDS}`,
        },
      });
      ctx.waitUntil(cache.put(cacheKey, response.clone()));
      return new Response(response.body, { status: 200, headers: withCors(response.headers) });
    } catch (err) {
      return new Response(JSON.stringify({ error: String(err && err.message ? err.message : err) }), {
        status: 500,
        headers: withCors({ 'content-type': 'application/json' }),
      });
    }
  },
};
