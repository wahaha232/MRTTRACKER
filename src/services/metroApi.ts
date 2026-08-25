// ---------------------------------------------------------------------------
// METRO QUEST — Live Mode API 客戶端（提示詞十三 / 五十六）
// API endpoint 來自 .env：
//   VITE_METRO_API_BASE_URL
//   VITE_METRO_API_KEY
// 若未設定或連線失敗，呼叫端會自動 fallback 到 Demo Mode。
// 切勿把真正的 API Secret 提交到 repository。
// ---------------------------------------------------------------------------
import type { ApiTrainRaw } from '../types';

export interface LiveConfig {
  baseUrl: string;
  apiKey: string;
  updateInterval: number;
  timeoutMs: number;
}

/** 從環境變數讀取 Live 設定 */
export function getLiveConfig(): LiveConfig {
  return {
    baseUrl: (import.meta.env.VITE_METRO_API_BASE_URL as string | undefined) ?? '',
    apiKey: (import.meta.env.VITE_METRO_API_KEY as string | undefined) ?? '',
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
 * 請在 proxy 端完成驗證；此處僅在前端保留非機密 base url。
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
  if (cfg.apiKey) headers.Authorization = `Bearer ${cfg.apiKey}`;

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
