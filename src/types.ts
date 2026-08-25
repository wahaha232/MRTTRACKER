// ---------------------------------------------------------------------------
// METRO QUEST — 資料型別定義
// 對應提示詞「三十一、資料模型」：Route / Station / Train
// ---------------------------------------------------------------------------

export type Language = 'zh' | 'en';
export type Mode = 'demo' | 'live';
export type SystemStatus = 'normal' | 'delay' | 'alert';
export type TrainStatus = 'normal' | 'delay';
export type Heading = 'E' | 'W' | 'N' | 'S' | 'NE' | 'NW' | 'SE' | 'SW';

export interface Station {
  /** 唯一 id，例如 "r-beitou" */
  id: string;
  /** 車站編號，例如 "R22" */
  code: string;
  /** 官方中文站名 */
  nameZh: string;
  /** 官方英文站名 */
  nameEn: string;
  /** 經過的路線 id 清單（>=2 表示轉乘站） */
  routeIds: string[];
  /** SVG 地圖座標 */
  x: number;
  y: number;
  /** 是否為終點站（Goal / Castle） */
  terminal?: boolean;
}

export interface RouteBranch {
  /** 主線連結站（分歧點車站 id） */
  parentId: string;
  /** 支線分支 id */
  branchId: string;
  /** 支線車站 id 清單（含分歧點） */
  stations: string[];
}

export interface Route {
  id: string;
  /** 中文路線名，例如「淡水信義線」 */
  nameZh: string;
  /** 英文路線名，例如 "Tamsui-Xinyi Line" */
  nameEn: string;
  /** 短名，例如 "R" */
  shortName: string;
  /** 路線代表色 */
  color: string;
  /** 主線車站 id 清單（依行駛順序） */
  stations: string[];
  /** 支線 */
  branches: RouteBranch[];
  /** WORLD 編號（1-based） */
  worldId: number;
}

export interface Train {
  id: string;
  routeId: string;
  currentStationId: string;
  nextStationId: string;
  /** 到下一站的剩餘秒數 */
  remainingSeconds: number;
  /** 此段行車時間（秒） */
  travelTimeSeconds: number;
  status: TrainStatus;
  /** 延誤秒數（status === 'delay' 時 > 0） */
  delaySeconds: number;
  /** 1 = 順向行駛，-1 = 逆向行駛 */
  direction: 1 | -1;
  /** 上次引擎更新時間（performance.now / Date.now） */
  updatedAt: number;
}

export interface TrainPosition {
  x: number;
  y: number;
  heading: Heading;
  /** 0..1，於目前區間的位置比例 */
  progress: number;
}

export interface StationArrival {
  stationId: string;
  directionZh: string;
  directionEn: string;
  /** 抵達秒數，null 表示資料不存在 */
  seconds: number | null;
}

export interface ApiTrainRaw {
  trainId: string;
  lineId: string;
  direction: string;
  currentStation: string;
  nextStation: string;
  remainingSeconds: number;
  status: 'normal' | 'delay';
}
