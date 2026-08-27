// ---------------------------------------------------------------------------
// METRO QUEST — 資料轉接器
// 將 TDX LiveBoard raw 資料轉為內部 StationArrival 模型（車站到站看板），
// 並額外反推「近似列車位置」（adaptApiArrivalsToTrains）：TDX 沒有列車 GPS，
// 只有「某站還有幾秒後有車」，故取每條路線每個方向「最快進站」的那筆資料，
// 定位在「上一站→這一站」之間，用既有的列車動畫系統平滑呈現，是估計值不是
// 精確位置。
// TDX 的 StationID / LineID 格式可能與本專案的官方站碼/路線 id 有些微差異
// （例如大小寫、是否帶 "TRTC-" 前綴），故用寬鬆比對；若實際串接後對不上，
// 可能要依實際回傳值調整下方 lookupStationByCode / lookupRouteByLineId。
// ---------------------------------------------------------------------------
import type { ApiArrivalRaw, StationArrival, Train } from '../types';
import { getRoute, ROUTES } from '../data/routes';
import { STATION_MAP } from '../data/stations';
import { estimateTravelTimeVariant } from '../data/travelTimes';

/** 依 TDX StationID 比對回本專案的官方站碼（code），找不到再試中文/英文站名 */
function lookupStationByCode(raw: string): string | undefined {
  const s = raw.trim();
  if (!s) return undefined;
  const upper = s.toUpperCase();
  for (const st of STATION_MAP.values()) {
    if (st.code.toUpperCase() === upper) return st.id;
  }
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

/** 依 TDX LineID 比對回本專案的路線 id（去除常見的 "TRTC-" 前綴後比對） */
function lookupRouteByLineId(raw: string): string | undefined {
  const s = raw.trim().toUpperCase().replace(/^TRTC-?/, '');
  const direct = getRoute(s);
  if (direct) return direct.id;
  const bySameShort = ROUTES.find((r) => r.shortName.toUpperCase() === s);
  return bySameShort?.id;
}

/** 把 TDX LiveBoard raw 轉為內部 StationArrival 清單（車站到站看板） */
export function adaptApiArrivals(raw: ApiArrivalRaw[]): StationArrival[] {
  const arrivals: StationArrival[] = [];
  for (const item of raw) {
    const stationId = lookupStationByCode(item.stationId);
    const routeId = lookupRouteByLineId(item.lineId);
    if (!stationId || !routeId) continue;
    arrivals.push({
      stationId,
      routeId,
      directionZh: item.headSign || item.destinationName,
      directionEn: item.destinationName,
      seconds: Math.max(0, Math.round(item.estimateSeconds)),
    });
  }
  return arrivals;
}

/** 路線所有可跑路徑（主線 + 支線），跟 mockMetroApi.ts 的 routePaths 邏輯一致 */
function routePaths(routeId: string): string[][] {
  const route = getRoute(routeId);
  if (!route) return [];
  return [route.stations, ...route.branches.map((b) => b.stations)];
}

/**
 * 把 TDX LiveBoard raw 反推成「近似列車位置」（Train[]）。
 * 每條路線每個方向只取「最快進站」的一筆，定位在「進站前一站→進站站」之間，
 * id 用 routeId+方向 固定，讓同一個方向的動畫在多次輪詢間保持連續。
 */
export function adaptApiArrivalsToTrains(raw: ApiArrivalRaw[]): Train[] {
  const now = Date.now();
  interface Candidate {
    routeId: string;
    direction: 1 | -1;
    currentStationId: string;
    nextStationId: string;
    remainingSeconds: number;
    destinationStationId: string;
  }
  const bestByKey = new Map<string, Candidate>();

  for (const item of raw) {
    const stationId = lookupStationByCode(item.stationId);
    const routeId = lookupRouteByLineId(item.lineId);
    const destinationId = lookupStationByCode(item.destinationName);
    if (!stationId || !routeId || !destinationId) continue;

    const paths = routePaths(routeId);
    let currentStationId: string | undefined;
    let direction: 1 | -1 | undefined;
    for (const path of paths) {
      const si = path.indexOf(stationId);
      const di = path.indexOf(destinationId);
      if (si === -1 || di === -1 || si === di) continue;
      const dir: 1 | -1 = di > si ? 1 : -1;
      const prevIdx = si - dir;
      if (prevIdx < 0 || prevIdx >= path.length) continue; // 進站站是這個方向的起點，沒有「上一站」
      currentStationId = path[prevIdx];
      direction = dir;
      break;
    }
    if (!currentStationId || !direction) continue;

    const remainingSeconds = Math.max(0, Math.round(item.estimateSeconds));
    const key = `${routeId}-${direction}`;
    const existing = bestByKey.get(key);
    if (!existing || remainingSeconds < existing.remainingSeconds) {
      bestByKey.set(key, {
        routeId,
        direction,
        currentStationId,
        nextStationId: stationId,
        remainingSeconds,
        destinationStationId: destinationId,
      });
    }
  }

  const trains: Train[] = [];
  for (const c of bestByKey.values()) {
    const travelTimeSeconds = estimateTravelTimeVariant(c.currentStationId, c.nextStationId, 0);
    trains.push({
      id: `${c.routeId}-${c.direction === 1 ? 'fwd' : 'rev'}`,
      routeId: c.routeId,
      currentStationId: c.currentStationId,
      nextStationId: c.nextStationId,
      remainingSeconds: Math.max(1, c.remainingSeconds),
      travelTimeSeconds,
      status: 'normal',
      delaySeconds: 0,
      direction: c.direction,
      updatedAt: now,
      destinationStationId: c.destinationStationId,
    });
  }
  return trains;
}

