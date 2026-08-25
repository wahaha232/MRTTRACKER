// ---------------------------------------------------------------------------
// METRO QUEST — 路線幾何
// 由車站座標產生 SVG path，並提供「沿路段取點」的函式（提示詞三十二）。
// ---------------------------------------------------------------------------
import type { Route, Station } from '../types';
import { ROUTES } from '../data/routes';
import { STATION_MAP } from '../data/stations';

export interface Point {
  x: number;
  y: number;
}

export interface RoutePath {
  routeId: string;
  /** SVG path d 字串（含支線） */
  d: string;
  /** 完整 station id 順序（主線 + 支線） */
  stationIds: string[];
}

/** 把一串 station id 轉成座標陣列（跳過不存在者） */
export function pointsForIds(ids: string[]): Point[] {
  const pts: Point[] = [];
  for (const id of ids) {
    const s = STATION_MAP.get(id);
    if (s) pts.push({ x: s.x, y: s.y });
  }
  return pts;
}

/** 座標陣列 → SVG path d 字串 */
export function toPathD(pts: Point[]): string {
  if (pts.length === 0) return '';
  const parts = [`M ${pts[0].x} ${pts[0].y}`];
  for (let i = 1; i < pts.length; i += 1) {
    parts.push(`L ${pts[i].x} ${pts[i].y}`);
  }
  return parts.join(' ');
}

/** 為單一路線產生完整 path（主線 + 支線） */
export function buildRoutePath(route: Route): RoutePath {
  const allIds: string[] = [...route.stations];
  const dParts: string[] = [toPathD(pointsForIds(route.stations))];
  for (const branch of route.branches) {
    const ids = branch.stations.map((id) => {
      // 分歧點站已在主線中；若支線站於 STATION_MAP 不存在則略過
      return STATION_MAP.has(id) ? id : branch.parentId;
    });
    allIds.push(...branch.stations);
    dParts.push(toPathD(pointsForIds(ids)));
  }
  return { routeId: route.id, d: dParts.join(' '), stationIds: allIds };
}

/** 所有路線 path（含支線） */
export const ALL_ROUTE_PATHS: RoutePath[] = ROUTES.map(buildRoutePath);

/** 兩點間線性插值 */
export function lerpPoint(a: Point, b: Point, t: number): Point {
  const k = Math.min(1, Math.max(0, t));
  return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k };
}

/** 兩點間距離 */
export function dist(a: Point, b: Point): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

/** 由兩站座標推得列車方位（8 方向） */
export function headingBetween(a: Station, b: Station): 'E' | 'W' | 'N' | 'S' | 'NE' | 'NW' | 'SE' | 'SW' {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI; // 0 = 東，90 = 南
  if (angle >= -22.5 && angle < 22.5) return 'E';
  if (angle >= 22.5 && angle < 67.5) return 'SE';
  if (angle >= 67.5 && angle < 112.5) return 'S';
  if (angle >= 112.5 && angle < 157.5) return 'SW';
  if (angle >= 157.5 || angle < -157.5) return 'W';
  if (angle >= -157.5 && angle < -112.5) return 'NW';
  if (angle >= -112.5 && angle < -67.5) return 'N';
  return 'NE';
}

/** 車站是否為某路線的終點 */
export function isTerminalFor(station: Station, route: Route): boolean {
  return (
    route.stations[0] === station.id ||
    route.stations[route.stations.length - 1] === station.id ||
    route.branches.some((b) => b.stations[0] === station.id || b.stations[b.stations.length - 1] === station.id)
  );
}
