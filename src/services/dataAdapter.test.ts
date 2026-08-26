import { describe, expect, it } from 'vitest';
import type { ApiArrivalRaw } from '../types';
import { adaptApiArrivals } from './dataAdapter';

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
