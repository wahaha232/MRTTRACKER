// ---------------------------------------------------------------------------
// METRO QUEST — 列車位置演算法
// progress = 1 - remainingSeconds / travelTimeSeconds（提示詞三十二）
// 並在每次「引擎更新」之間以 requestAnimationFrame 平滑插值。
// ---------------------------------------------------------------------------
import type { Train, TrainPosition } from '../types';
import { STATION_MAP } from '../data/stations';
import { lerpPoint, headingBetween } from './routeGeometry';

/** 依剩餘秒數計算區間內 progress（0..1） */
export function progressForTrain(train: Train): number {
  if (train.travelTimeSeconds <= 0) return 0;
  return Math.min(1, Math.max(0, 1 - train.remainingSeconds / train.travelTimeSeconds));
}

/** 平滑插值：以「引擎更新時間」與「剩餘秒數」推算當下位置。 */
export function interpolatedProgress(
  train: Train,
  nowMs: number,
  tickMs: number,
): number {
  const elapsed = (nowMs - train.updatedAt) / 1000;
  const remaining = train.remainingSeconds - elapsed + tickMs / 1000;
  if (train.travelTimeSeconds <= 0) return 0;
  return Math.min(1, Math.max(0, 1 - remaining / train.travelTimeSeconds));
}

/**
 * 計算列車在「單一路線直線圖」上的一維位置（沿 path 陣列索引，非世界座標）。
 * path 必須是該路線目前站點順序（例如 route.stations）；若列車目前所在區間
 * 不在此 path 中（如支線列車），回傳 null，呼叫端應略過不畫。
 */
export function stripProgressForTrain(path: string[], train: Train, progress: number): number | null {
  const ci = path.indexOf(train.currentStationId);
  const ni = path.indexOf(train.nextStationId);
  if (ci === -1 || ni === -1) return null;
  return ci + (ni - ci) * progress;
}

/** 計算列車在 SVG 中的位置與朝向 */
export function calculateTrainPosition(train: Train, progress: number): TrainPosition {
  const from = STATION_MAP.get(train.currentStationId);
  const to = STATION_MAP.get(train.nextStationId);
  if (!from || !to) {
    const fallback = from ?? to;
    if (!fallback) return { x: 0, y: 0, heading: 'E', progress };
    return { x: fallback.x, y: fallback.y, heading: 'E', progress };
  }
  const p = lerpPoint({ x: from.x, y: from.y }, { x: to.x, y: to.y }, progress);
  return { x: p.x, y: p.y, heading: headingBetween(from, to), progress };
}
