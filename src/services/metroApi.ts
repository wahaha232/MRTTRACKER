// ---------------------------------------------------------------------------
// METRO QUEST — Live Mode API 客戶端（提示詞十三 / 五十六）
// API endpoint 來自 .env：
//   VITE_METRO_API_BASE_URL（僅非機密、經 proxy 轉發的端點；瀏覽器可存取）
// 若未設定或連線失敗，呼叫端會自動 fallback 到 Demo Mode。
//
// ⚠️ 資安原則（務必遵守）：
//   - API 金鑰（METRO_API_KEY）是「僅伺服器端」的密鑰，絕不能寫進任何
//     VITE_ 環境變數。Vite 會把所有 VITE_ 開頭變數靜態打包進公開的前端
//     JS bundle，任何人打開 DevTools 就能看到。
//   - 瀏覽器一律呼叫「同源 proxy 路徑」（預設 /api/... 或此處設定的端點），
//     由 proxy / Edge server（例如 nginx、Cloudflare Worker、AWS Lambda@Edge）
//     在伺服器端注入 API 金鑰後再轉發到官方 API。
//   - 本檔不得持有、讀取或發送任何 API 金鑰。
// ---------------------------------------------------------------------------
import type { ApiTrainRaw } from '../types';

export interface LiveConfig {
  /** proxy 端點（非機密）。預設為同源相對路徑，由伺服器端 proxy 掛載。 */
  baseUrl: string;
  updateInterval: number;
  timeoutMs: number;
}

/** 從環境變數讀取 Live 設定 */
export function getLiveConfig(): LiveConfig {
  return {
    baseUrl: (import.meta.env.VITE_METRO_API_BASE_URL as string | undefined) ?? '/metro',
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
 * 呼叫官方 API 取得列車位置。
 * 驗證一律在伺服器端 proxy 完成；瀏覽器只發 request 到「非機密的 proxy
 * 路徑」（可以是同源相對路徑，或受你控制的 proxy 端點），因此前端永遠
 * 不需也不得持有 API 金鑰。
 */
export async function fetchLiveTrains(signal?: AbortSignal): Promise<ApiTrainRaw[]> {
  const cfg = getLiveConfig();
  if (!isLiveConfigured()) {
    throw new Error('METRO_API_BASE_URL not configured');
  }
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), cfg.timeoutMs);
  const ac = signal ?? controller.signal;

  const url = `${cfg.baseUrl.replace(/\/$/, '')}/live/getLiveTrainPosition`;
  const headers: Record<string, string> = { Accept: 'application/json' };

  // 注意：此 request 不含任何 Authorization header。API 金鑰只存在伺服器端
  //（proxy / Edge server），由伺服器注入後再轉發到官方 API。
  try {
    const res = await fetch(url, { headers, signal: ac });
    if (!res.ok) {
      throw new Error(`Metro API responded ${res.status}`);
    }
    const json = (await res.json()) as unknown;
    return normalizeLiveResponse(json);
  } finally {
    window.clearTimeout(timeoutId);
  }
}

/** 把官方 JSON 轉成內部 raw 型別（依資料結構擴充） */
function normalizeLiveResponse(json: unknown): ApiTrainRaw[] {
  const list = Array.isArray(json)
    ? json
    : Array.isArray((json as { result?: unknown }).result)
      ? ((json as { result: unknown[] }).result)
      : Array.isArray((json as { data?: unknown }).data)
        ? ((json as { data: unknown[] }).data)
        : [];
  return list
    .map((item): ApiTrainRaw | null => {
      const rec = item as Record<string, unknown>;
      const trainId = String(rec.TrainNo ?? rec.trainId ?? rec.train_no ?? '');
      const lineId = String(rec.LineID ?? rec.lineId ?? rec.line_id ?? rec.Line ?? '');
      const direction = String(rec.Direction ?? rec.direction ?? '');
      const currentStation = String(rec.StationID ?? rec.currentStation ?? rec.current_station ?? '');
      const nextStation = String(rec.NextStationID ?? rec.nextStation ?? rec.next_station ?? '');
      const remaining = Number(rec.RemainingSeconds ?? rec.remainingSeconds ?? 60);
      if (!trainId || !lineId) return null;
      return {
        trainId,
        lineId,
        direction,
        currentStation,
        nextStation,
        remainingSeconds: Number.isFinite(remaining) ? remaining : 60,
        status: rec.status === 'delay' ? 'delay' : 'normal',
      };
    })
    .filter((t): t is ApiTrainRaw => t !== null);
}
