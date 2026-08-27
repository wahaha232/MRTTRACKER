import { describe, expect, it } from 'vitest';
import type { ApiArrivalRaw } from '../types';
import { adaptApiArrivals, adaptApiArrivalsToTrains } from './dataAdapter';

function raw(overrides: Partial<ApiArrivalRaw> = {}): ApiArrivalRaw {
  return {
    lineId: 'R',
    stationId: 'R28',
    destinationName: '象山',
    headSign: '往象山',
    estimateSeconds: 60,
    updateTime: '2026-01-01T00:00:00+08:00',
    ...overrides,
  };
}

describe('adaptApiArrivals（TDX LiveBoard raw → 內部 StationArrival）', () => {
  it('依站碼與路線 id 對應到內部 station/route id', () => {
    const [arrival] = adaptApiArrivals([raw()]);
    expect(arrival).toBeDefined();
    expect(arrival!.stationId).toBe('r-tamsui');
    expect(arrival!.routeId).toBe('R');
    expect(arrival!.directionZh).toBe('往象山');
  });

  it('TRTC- 前綴的 LineID 也能正確比對路線', () => {
    const [arrival] = adaptApiArrivals([raw({ lineId: 'TRTC-R' })]);
    expect(arrival!.routeId).toBe('R');
  });

  it('秒數為負數時，至少保留 0 秒（不產生負值）', () => {
    const [arrival] = adaptApiArrivals([raw({ estimateSeconds: -5 })]);
    expect(arrival!.seconds).toBe(0);
  });

  it('「未知路線」會被忽略（不滲入結果）', () => {
    const arrivals = adaptApiArrivals([raw({ lineId: 'ZZ' })]);
    expect(arrivals).toHaveLength(0);
  });

  it('「未知站碼」的被丟棄，不輸出錯誤資料', () => {
    const arrivals = adaptApiArrivals([raw({ stationId: 'NOT-A-STATION' })]);
    expect(arrivals).toHaveLength(0);
  });
});

describe('adaptApiArrivalsToTrains（用到站看板反推近似列車位置）', () => {
  it('依「進站站→上一站」反推 current/next 與方向', () => {
    const [train] = adaptApiArrivalsToTrains([
      raw({ stationId: 'R14', destinationName: '象山', estimateSeconds: 40 }),
    ]);
    expect(train).toBeDefined();
    expect(train!.routeId).toBe('R');
    expect(train!.nextStationId).toBe('r-yuanshan');
    expect(train!.currentStationId).toBe('r-jiantan');
    expect(train!.direction).toBe(1);
    expect(train!.remainingSeconds).toBe(40);
  });

  it('進站站是該方向的起點站（無「上一站」）時整筆略過', () => {
    const trains = adaptApiArrivalsToTrains([
      raw({ stationId: 'R28', destinationName: '象山' }), // 淡水本身就是往象山方向的起點
    ]);
    expect(trains).toHaveLength(0);
  });

  it('同路線同方向多筆資料時，只取「最快進站」的一筆', () => {
    const trains = adaptApiArrivalsToTrains([
      raw({ stationId: 'R14', destinationName: '象山', estimateSeconds: 200 }),
      raw({ stationId: 'R12', destinationName: '象山', estimateSeconds: 30 }),
    ]);
    expect(trains).toHaveLength(1);
    expect(trains[0]!.remainingSeconds).toBe(30);
  });

  it('未知路線／站碼／目的地站名的資料會被忽略', () => {
    const trains = adaptApiArrivalsToTrains([
      raw({ lineId: 'ZZ', stationId: 'R14', destinationName: '象山' }),
      raw({ stationId: 'R14', destinationName: '不存在的車站' }),
    ]);
    expect(trains).toHaveLength(0);
  });
});
