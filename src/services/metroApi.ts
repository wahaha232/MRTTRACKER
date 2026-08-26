// ---------------------------------------------------------------------------
// METRO QUEST — Live Mode API 客戶端
// API endpoint 來自 .env：
//   VITE_METRO_API_BASE_URL（僅非機密、經 proxy 轉發的端點；瀏覽器可存取）
// 若未設定或連線失敗，呼叫端會自動 fallback 到 Demo Mode。
//
// ⚠️ 資安原則（務必遵守）：
//   - API 金鑰（TDX Client ID / Secret）是「僅伺服器端」的密鑰，絕不能寫進
//     任何 VITE_ 環境變數。Vite 會把所有 VITE_ 開頭變數靜態打包進公開的
//     前端 JS bundle，任何人打開 DevTools 就能看到。
//   - 瀏覽器一律呼叫「非機密的 proxy 端點」（此處為 Cloudflare Worker，
//     見 cloudflare-worker/），由 proxy 在伺服器端用金鑰跟 TDX 換
//     access token、代為呼叫 TDX API 後再把結果轉發回來。
//   - 本檔不得持有、讀取或發送任何 API 金鑰。
//
// 資料模型注意：TDX 提供的是「捷運車站電子看板」（LiveBoard，某站還有哪些
// 車次、預估幾秒後到站），不是列車即時 GPS 位置，因此 Live Mode 沒有地圖上
// 移動的列車圖示，只有點擊車站後顯示的到站看板（真實資料能提供的呈現方式）。
// ---------------------------------------------------------------------------
import type { ApiArrivalRaw } from '../types';

export interface LiveConfig {
  /** Cloudflare Worker proxy 網址（非機密）。未設定時 Live Mode 視為未啟用。 */
  baseUrl: string;
  updateInterval: number;
  timeoutMs: number;
}

/** 從環境變數讀取 Live 設定 */
export function getLiveConfig(): LiveConfig {
  return {
    baseUrl: (import.meta.env.VITE_METRO_API_BASE_URL as string | undefined) ?? '',
    updateInterval: Number(import.meta.env.VITE_METRO_UPDATE_INTERVAL ?? 10),
    timeoutMs: 8000,
  };
}

/** Live Mode 是否已設定可用 */
export function isLiveConfigured(): boolean {
  const cfg = getLiveConfig();
  return cfg.baseUrl.trim().length > 0;
}

/**
 * 呼叫 proxy 取得台北捷運「車站電子看板」到站資料（TDX Rail/Metro/LiveBoard/TRTC）。
 * 驗證一律在伺服器端 proxy 完成；瀏覽器只發 request 到「非機密的 proxy
 * 端點」，因此前端永遠不需也不得持有 API 金鑰。
 */
export async function fetchLiveArrivals(signal?: AbortSignal): Promise<ApiArrivalRaw[]> {
  const cfg = getLiveConfig();
  if (!isLiveConfigured()) {
    throw new Error('METRO_API_BASE_URL not configured');
  }
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), cfg.timeoutMs);
  const ac = signal ?? controller.signal;

  const url = cfg.baseUrl.replace(/\/$/, '');
  const headers: Record<string, string> = { Accept: 'application/json' };

  // 注意：此 request 不含任何 Authorization header。API 金鑰只存在伺服器端
  //（Cloudflare Worker），由 proxy 注入後再轉發到 TDX。
  try {
    const res = await fetch(url, { headers, signal: ac });
    if (!res.ok) {
      throw new Error(`Metro API responded ${res.status}`);
    }
    const json = (await res.json()) as unknown;
    return normalizeLiveBoard(json);
  } finally {
    window.clearTimeout(timeoutId);
  }
}

/** 把 TDX LiveBoard JSON 轉成內部 raw 型別 */
function normalizeLiveBoard(json: unknown): ApiArrivalRaw[] {
  const list = Array.isArray(json)
    ? json
    : Array.isArray((json as { LiveBoards?: unknown }).LiveBoards)
      ? ((json as { LiveBoards: unknown[] }).LiveBoards)
      : [];
  return list
    .map((item): ApiArrivalRaw | null => {
      const rec = item as Record<string, unknown>;
      const lineId = String(rec.LineID ?? '');
      const stationId = String(rec.StationID ?? '');
      const destination = rec.DestinationStationName as { Zh_tw?: string; En?: string } | undefined;
      const headSignObj = rec.TripHeadSign as { Zh_tw?: string; En?: string } | undefined;
      const estimate = Number(rec.EstimateTime ?? NaN);
      if (!lineId || !stationId || !Number.isFinite(estimate)) return null;
      return {
        lineId,
        stationId,
        destinationName: destination?.Zh_tw ?? destination?.En ?? '',
        headSign: headSignObj?.Zh_tw ?? headSignObj?.En ?? '',
        estimateSeconds: estimate,
        updateTime: String(rec.SrcUpdateTime ?? rec.UpdateTime ?? ''),
      };
    })
    .filter((a): a is ApiArrivalRaw => a !== null);
}
