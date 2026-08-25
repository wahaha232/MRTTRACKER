// ---------------------------------------------------------------------------
// METRO QUEST — 資料轉接器
// 將官方 API raw 資料轉為內部 Train 模型；站名以官方中文站名比對。
// ---------------------------------------------------------------------------
import type { ApiTrainRaw, Train } from '../types';
import { getRoute } from '../data/routes';
import { STATION_MAP } from '../data/stations';
import { estimateTravelTimeVariant } from '../data/travelTimes';

function lookupStation(raw: string): string | undefined {
  const s = raw.trim();
  if (!s) return undefined;
  const byId = STATION_MAP.get(s);
  if (byId) return byId.id;
  for (const st of STATION_MAP.values()) {
    if (st.nameZh === s || s.includes(st.nameZh)) return st.id;
  }
  const lower = s.toLowerCase();
  for (const st of STATION_MAP.values()) {
    if (st.nameEn.toLowerCase() === lower) return st.id;
  }
  return undefined;
}

/** 把 API raw 轉為內部 Train 清單 */
export function adaptApiTrains(raw: ApiTrainRaw[]): Train[] {
  const now = Date.now();
  const trains: Train[] = [];
  for (const item of raw) {
    const route = getRoute(item.lineId);
    if (!route) continue;
    const currentId = lookupStation(item.currentStation);
    const nextId = lookupStation(item.nextStation);
    if (!currentId || !nextId) continue;
    const travel = estimateTravelTimeVariant(currentId, nextId, item.trainId.length);
    const remaining = Math.max(1, Math.round(item.remainingSeconds));
    const dir: 1 | -1 =
      route.stations.indexOf(nextId) > route.stations.indexOf(currentId) ? 1 : -1;
    trains.push({
      id: item.trainId,
      routeId: route.id,
      currentStationId: currentId,
      nextStationId: nextId,
      remainingSeconds: remaining,
      travelTimeSeconds: travel,
      status: item.status === 'delay' ? 'delay' : 'normal',
      delaySeconds: item.status === 'delay' ? Math.max(0, Math.round(travel - remaining)) : 0,
      direction: dir,
      updatedAt: now,
    });
  }
  return trains;
}

