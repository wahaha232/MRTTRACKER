// ---------------------------------------------------------------------------
// METRO QUEST — 資料轉接器
// 將 TDX LiveBoard raw 資料轉為內部 StationArrival 模型（車站到站看板）。
// TDX 的 StationID / LineID 格式可能與本專案的官方站碼/路線 id 有些微差異
// （例如大小寫、是否帶 "TRTC-" 前綴），故用寬鬆比對；若實際串接後對不上，
// 可能要依實際回傳值調整下方 lookupStationByCode / lookupRouteByLineId。
// ---------------------------------------------------------------------------
import type { ApiArrivalRaw, StationArrival } from '../types';
import { getRoute, ROUTES } from '../data/routes';
import { STATION_MAP } from '../data/stations';

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

