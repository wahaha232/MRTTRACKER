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
  /** 該筆到站資料所屬路線 id（轉乘站可能同時有多路線的到站資料） */
  routeId: string;
  directionZh: string;
  directionEn: string;
  /** 抵達秒數，null 表示資料不存在 */
  seconds: number | null;
}

/**
 * TDX「捷運車站電子看板」raw 資料（Rail/Metro/LiveBoard/TRTC）。
 * 官方捷運系統不對外公開列車即時 GPS 位置，只提供「車站到站看板」
 * （某站還有哪些車次、預估幾秒後到站），因此 Live Mode 呈現的是到站看板，
 * 不是地圖上移動的列車圖示（那是 Demo Mode 的模擬效果）。
 */
export interface ApiArrivalRaw {
  lineId: string;
  stationId: string;
  destinationName: string;
  headSign: string;
  /** 預估到站秒數。TDX 文件寫分鐘，但實測回傳為秒數，故以秒解析。 */
  estimateSeconds: number;
  updateTime: string;
}
