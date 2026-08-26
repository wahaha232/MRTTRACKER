import { describe, expect, it } from 'vitest';
import type { ApiTrainRaw } from '../types';
import { adaptApiTrains } from './dataAdapter';

function raw(overrides: Partial<ApiTrainRaw> = {}): ApiTrainRaw {
  return {
    trainId: 'R101',
    lineId: 'R',
    direction: '1',
    currentStation: '淡水',
    nextStation: '紅樹林',
    remainingSeconds: 60,
    status: 'normal',
    ...overrides,
  };
}

describe('adaptApiTrains（API raw → 內部 Train）', () => {
  it('把中文站名對應到內部 station id，並計算方向', () => {
    const [train] = adaptApiTrains([raw()]);
    expect(train).toBeDefined();
    expect(train!.routeId).toBe('R');
    expect(train!.currentStationId).toBe('r-tamsui');
    expect(train!.nextStationId).toBe('r-hongshulin');
    expect(train!.direction).toBe(1);
  });

  it('delay 狀態正確反映 status 與 delaySeconds', () => {
    const t = raw({ status: 'delay', remainingSeconds: 10 });
    const [train] = adaptApiTrains([t]);
    expect(train!.status).toBe('delay');
    expect(train!.delaySeconds).toBeGreaterThan(0);
  });

  it('剩餘秒數為 0/負數時，至少保留 1 秒（不產生無意義 0）', () => {
    const [train] = adaptApiTrains([raw({ remainingSeconds: 0 })]);
    expect(train!.remainingSeconds).toBeGreaterThanOrEqual(1);
  });

  it('「未知路線」會被忽略（不滲入 Train 清單）', () => {
    const trains = adaptApiTrains([raw({ lineId: 'ZZ' })]);
    expect(trains).toHaveLength(0);
  });

  it('「未知站名」的被丟棄，不輸出錯誤資料', () => {
    const trains = adaptApiTrains([raw({ currentStation: '不存在的車站' })]);
    expect(trains).toHaveLength(0);
  });
});
