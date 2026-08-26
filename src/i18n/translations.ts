// ---------------------------------------------------------------------------
// METRO QUEST — 中英雙語字典（提示詞「四十、中英雙語」）
// 官方站名不翻譯，直接使用 stations.ts 內的 nameZh / nameEn。
// ---------------------------------------------------------------------------
import type { Language } from '../types';

export interface Dictionary {
  appName: string;
  subtitle: string;
  tagline: string;
  routesTitle: string;
  trainControlTitle: string;
  worldSelectorTitle: string;
  live: string;
  demoMode: string;
  liveMode: string;
  lastUpdate: string;
  nextUpdate: string;
  updated: string;
  trains: string;
  trainsCount: (n: number) => string;
  systemStatus: string;
  allSystemsNormal: string;
  minorDelays: string;
  serviceAlert: string;
  delay: string;
  delayMin: (n: number) => string;
  normal: string;
  alert: string;
  train: string;
  route: string;
  direction: string;
  to: string;
  current: string;
  nextStation: string;
  remaining: string;
  status: string;
  position: string;
  estimated: string;
  speed: string;
  notAvailable: string;
  station: string;
  transfer: string;
  none: string;
  arriving: string;
  platform: string;
  departure: string;
  loading: string;
  worldReady: string;
  worldNotFound: string;
  returnToMap: string;
  dataSource: string;
  dataSourceName: string;
  openData: string;
  dataSourceUrl: string;
  easycardName: string;
  easycardUrl: string;
  taipeiTourismName: string;
  taipeiTourismUrl: string;
  newTaipeiTourismName: string;
  newTaipeiTourismUrl: string;
  soundOn: string;
  soundOff: string;
  fullscreenOn: string;
  fullscreenOff: string;
  selectRoute: string;
  allRoutes: string;
  selectTrainHint: string;
  selectStationHint: string;
  noTrainSelected: string;
  stationInfo: string;
  world: string;
  lastData: string;
  dataAge: string;
  staleData: string;
  connectionLost: string;
  fallbackToDemo: string;
  estimatedPosition: string;
  updatedAgo: string;
  coords: string;
  totalTrains: string;
  adLabel: string;
  adReserved: string;
}

const zh: Dictionary = {
  appName: 'METRO QUEST',
  subtitle: '台北捷運即時列車行控中心',
  tagline: '每一列車，都有自己的旅程。',
  routesTitle: '路線控制台',
  trainControlTitle: '列車控制台',
  worldSelectorTitle: '選擇世界',
  live: 'LIVE',
  demoMode: 'DEMO MODE',
  liveMode: 'LIVE MODE',
  lastUpdate: 'LAST UPDATE',
  nextUpdate: 'NEXT UPDATE',
  updated: '更新時間',
  trains: '列車',
  trainsCount: (n) => `${n} 列車`,
  systemStatus: 'SYSTEM STATUS',
  allSystemsNormal: 'ALL SYSTEMS NORMAL',
  minorDelays: 'MINOR DELAYS',
  serviceAlert: 'SERVICE ALERT',
  delay: '延誤',
  delayMin: (n) => `+${n} MIN`,
  normal: 'NORMAL',
  alert: 'ALERT',
  train: '列車',
  route: '路線',
  direction: '方向',
  to: '往',
  current: '目前',
  nextStation: '下一站',
  remaining: '剩餘時間',
  status: '狀態',
  position: '位置',
  estimated: 'ESTIMATED',
  speed: '速度',
  notAvailable: 'N/A',
  station: '車站',
  transfer: '轉乘',
  none: '無',
  arriving: '到站',
  platform: '月台',
  departure: '發車',
  loading: 'LOADING METRO WORLD...',
  worldReady: 'WORLD READY!',
  worldNotFound: 'WORLD NOT FOUND',
  returnToMap: 'RETURN TO MAP',
  dataSource: '資料來源',
  dataSourceName: '臺北大眾捷運股份有限公司',
  openData: 'Government Open Data',
  dataSourceUrl: 'https://www.metro.taipei/',
  easycardName: '悠遊卡股份有限公司',
  easycardUrl: 'https://www.easycard.com.tw/',
  taipeiTourismName: '臺北旅遊網',
  taipeiTourismUrl: 'https://www.travel.taipei/',
  newTaipeiTourismName: '新北旅遊網',
  newTaipeiTourismUrl: 'https://tour.ntpc.gov.tw/',
  soundOn: '音效 ON',
  soundOff: '音效 OFF',
  fullscreenOn: '全螢幕 ON',
  fullscreenOff: '全螢幕 OFF',
  selectRoute: '全部路線',
  allRoutes: 'ALL',
  selectTrainHint: '點擊地圖上的列車以查看詳情',
  selectStationHint: '點擊車站以查看到站資訊',
  noTrainSelected: 'NO TRAIN SELECTED',
  stationInfo: '車站資訊',
  world: 'WORLD',
  lastData: 'LAST DATA',
  dataAge: 'DATA AGE',
  staleData: 'STALE DATA',
  connectionLost: 'DATA CONNECTION LOST',
  fallbackToDemo: 'FALLBACK TO DEMO DATA',
  estimatedPosition: 'ESTIMATED POSITION',
  updatedAgo: '更新於',
  coords: '座標',
  totalTrains: '總列車數',
  adLabel: 'AD · 廣告',
  adReserved: 'GOOGLE ADSENSE 廣告位置保留中',
};

const en: Dictionary = {
  appName: 'METRO QUEST',
  subtitle: 'TAIPEI METRO REAL-TIME CONTROL CENTER',
  tagline: 'Every Train Has a Story.',
  routesTitle: 'ROUTE CONTROL',
  trainControlTitle: 'TRAIN CONTROL',
  worldSelectorTitle: 'SELECT WORLD',
  live: 'LIVE',
  demoMode: 'DEMO MODE',
  liveMode: 'LIVE MODE',
  lastUpdate: 'LAST UPDATE',
  nextUpdate: 'NEXT UPDATE',
  updated: 'UPDATED',
  trains: 'TRAINS',
  trainsCount: (n) => `${n} TRAINS`,
  systemStatus: 'SYSTEM STATUS',
  allSystemsNormal: 'ALL SYSTEMS NORMAL',
  minorDelays: 'MINOR DELAYS',
  serviceAlert: 'SERVICE ALERT',
  delay: 'DELAY',
  delayMin: (n) => `+${n} MIN`,
  normal: 'NORMAL',
  alert: 'ALERT',
  train: 'TRAIN',
  route: 'ROUTE',
  direction: 'DIRECTION',
  to: 'TO',
  current: 'CURRENT',
  nextStation: 'NEXT STATION',
  remaining: 'REMAINING',
  status: 'STATUS',
  position: 'POSITION',
  estimated: 'ESTIMATED',
  speed: 'SPEED',
  notAvailable: 'N/A',
  station: 'STATION',
  transfer: 'TRANSFER',
  none: 'NONE',
  arriving: 'ARRIVING',
  platform: 'PLATFORM',
  departure: 'DEPARTURE',
  loading: 'LOADING METRO WORLD...',
  worldReady: 'WORLD READY!',
  worldNotFound: 'WORLD NOT FOUND',
  returnToMap: 'RETURN TO MAP',
  dataSource: 'DATA SOURCE',
  dataSourceName: 'Taipei Rapid Transit Corporation',
  openData: 'Government Open Data',
  dataSourceUrl: 'https://www.metro.taipei/',
  easycardName: 'EasyCard Corporation',
  easycardUrl: 'https://www.easycard.com.tw/',
  taipeiTourismName: 'Taipei Travel Net',
  taipeiTourismUrl: 'https://www.travel.taipei/',
  newTaipeiTourismName: 'New Taipei Travel Net',
  newTaipeiTourismUrl: 'https://tour.ntpc.gov.tw/',
  soundOn: 'SOUND ON',
  soundOff: 'SOUND OFF',
  fullscreenOn: 'FULLSCREEN ON',
  fullscreenOff: 'FULLSCREEN OFF',
  selectRoute: 'ALL ROUTES',
  allRoutes: 'ALL',
  selectTrainHint: 'Click a train on the map to inspect it',
  selectStationHint: 'Click a station to view arrivals',
  noTrainSelected: 'NO TRAIN SELECTED',
  stationInfo: 'STATION INFO',
  world: 'WORLD',
  lastData: 'LAST DATA',
  dataAge: 'DATA AGE',
  staleData: 'STALE DATA',
  connectionLost: 'DATA CONNECTION LOST',
  fallbackToDemo: 'FALLBACK TO DEMO DATA',
  estimatedPosition: 'ESTIMATED POSITION',
  updatedAgo: 'UPDATED',
  coords: 'COORD',
  totalTrains: 'TOTAL TRAINS',
  adLabel: 'AD',
  adReserved: 'SPACE RESERVED FOR GOOGLE ADSENSE',
};

export const dictionaries: Record<Language, Dictionary> = { zh, en };
