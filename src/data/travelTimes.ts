// ---------------------------------------------------------------------------
// METRO QUEST — 區間行車時間
// 依兩站間 SVG 距離估算（像素 → 秒），並加少量變化避免所有列車同速。
// 提示詞「三十一 / 三十二」：根據 current/next/remaining/travelTime 推算 progress。
// ---------------------------------------------------------------------------
import { STATION_MAP } from './stations';

export interface SegmentKey {
  routeId: string;
  fromId: string;
  toId: string;
}

/** 以距離估算行車時間（秒），限制在合理班距範圍內。 */
export function estimateTravelTime(fromId: string, toId: string): number {
  const a = STATION_MAP.get(fromId);
  const b = STATION_MAP.get(toId);
  if (!a || !b) return 90;
  const dist = Math.hypot(b.x - a.x, b.y - a.y);
  // 每約 4.2px ≈ 1 秒；介於 45s ~ 210s
  const t = Math.round(dist / 4.2);
  return Math.min(210, Math.max(45, t));
}

/** 附加一點隨機變化（用於 demo 列車，避免全部同時到站） */
export function estimateTravelTimeVariant(fromId: string, toId: string, seed = 0): number {
  const base = estimateTravelTime(fromId, toId);
  const variance = ((seed * 37) % 21) - 10; // -10 ~ +10
  return Math.max(40, base + variance);
}
