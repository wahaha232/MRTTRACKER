// ---------------------------------------------------------------------------
// METRO QUEST — Mock 資料生成（提示詞三十四：Mock Metro Engine）
// 每秒 tick 一次：模擬 progress / station arrival / departure / direction / delay。
// ---------------------------------------------------------------------------
import type { Route, Train } from '../types';
import { ROUTES, getRoute } from '../data/routes';
import { estimateTravelTimeVariant } from '../data/travelTimes';

/** 每個路線的列車數，合計 128 台 */
const TRAIN_COUNTS: Record<string, number> = {
  R: 24,
  BL: 28,
  G: 24,
  O: 20,
  BR: 18,
  Y: 14,
};

/** 可延誤秒數（低機率） */
const DELAY_OPTIONS = [30, 60, 120, 180];

/** 可重現亂數（mulberry32） */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * 路線專屬亂數種子：用 FNV-1a hash 對 route.id 的「字元內容」計算，
 * 避免過去用「字串長度」當種子——不同 id 但同長度（如 R/G/O/Y）會產生
 * 較相似的隨機模式。再混入唯一的 worldId 讓六條路線種子完全分離。
 */
function routeSeed(route: Route): number {
  let h = 0x811c9dc5; // FNV offset basis
  for (let i = 0; i < route.id.length; i += 1) {
    h ^= route.id.charCodeAt(i);
    h = Math.imul(h, 0x01000193); // FNV prime
  }
  return (h ^ route.worldId) >>> 0;
}

/** 取得路線所有可跑路徑（主線 + 支線） */
function routePaths(route: Route): string[][] {
  return [route.stations, ...route.branches.map((b) => b.stations)];
}

/** 列車抵達 nextStation 後，計算新的 current/next 配對與方向 */
export function nextPair(route: Route, train: Train): { current: string; next: string; dir: 1 | -1 } {
  const paths = routePaths(route);
  for (const p of paths) {
    const ci = p.indexOf(train.currentStationId);
    const ni = p.indexOf(train.nextStationId);
    if (ci === -1 || ni === -1 || Math.abs(ni - ci) !== 1) continue;
    if (ni === ci + 1) {
      if (ni + 1 < p.length) return { current: train.nextStationId, next: p[ni + 1], dir: 1 };
      return { current: train.nextStationId, next: train.currentStationId, dir: -1 };
    }
    if (ni === ci - 1) {
      if (ni - 1 >= 0) return { current: train.nextStationId, next: p[ni - 1], dir: -1 };
      return { current: train.nextStationId, next: train.currentStationId, dir: 1 };
    }
  }
  // fallback：掉頭
  return { current: train.nextStationId, next: train.currentStationId, dir: train.direction === 1 ? -1 : 1 };
}

/** 產生一批 demo 列車（跨六條路線、不同方向、不同速度） */
export function generateMockTrains(): Train[] {
  const now = Date.now();
  const trains: Train[] = [];
  for (const route of ROUTES) {
    const paths = routePaths(route);
    const n = TRAIN_COUNTS[route.id] ?? 10;
    const rng = mulberry32(routeSeed(route));
    for (let i = 0; i < n; i += 1) {
      const path = paths[Math.floor(rng() * paths.length)];
      if (path.length < 2) continue;
      const fromIdx = Math.floor(rng() * path.length);
      const fromId = path[fromIdx];
      // 選擇相鄰站（終點站強制回頭，其餘隨機方向）
      let toIdx: number;
      if (fromIdx === 0) toIdx = 1;
      else if (fromIdx === path.length - 1) toIdx = fromIdx - 1;
      else toIdx = rng() > 0.5 ? fromIdx + 1 : fromIdx - 1;
      const toId = path[toIdx];
      const dir: 1 | -1 = toIdx > fromIdx ? 1 : -1;
      const travel = estimateTravelTimeVariant(fromId, toId, i);
      const progress = rng();
      const remaining = Math.max(2, Math.round(travel * (1 - progress)));
      trains.push({
        id: `${route.shortName}${1200 + i + 1}`,
        routeId: route.id,
        currentStationId: fromId,
        nextStationId: toId,
        remainingSeconds: remaining,
        travelTimeSeconds: travel,
        status: 'normal',
        delaySeconds: 0,
        direction: dir,
        updatedAt: now,
      });
    }
  }
  return trains;
}

/** Demo 引擎 tick：每秒呼叫，推進所有列車 */
export function tickDemoTrains(trains: Train[], timeNow: number): Train[] {
  return trains.map((t, idx) => {
    const remaining = t.remainingSeconds - 1;
    if (remaining > 0) {
      return { ...t, remainingSeconds: remaining, updatedAt: timeNow };
    }
    const route = getRoute(t.routeId);
    if (!route) return { ...t, remainingSeconds: 1, updatedAt: timeNow };
    const pair = nextPair(route, t);
    const travel = estimateTravelTimeVariant(pair.current, pair.next, idx + 7);
    // 低機率延誤（約 3%）
    const rng = mulberry32((timeNow >>> 0) + idx * 97);
    const delay = rng() < 0.03 ? DELAY_OPTIONS[Math.floor(rng() * DELAY_OPTIONS.length)] : 0;
    return {
      ...t,
      currentStationId: pair.current,
      nextStationId: pair.next,
      direction: pair.dir,
      remainingSeconds: travel + delay,
      travelTimeSeconds: travel,
      delaySeconds: delay,
      status: delay > 0 ? 'delay' : 'normal',
      updatedAt: timeNow,
    };
  });
}
