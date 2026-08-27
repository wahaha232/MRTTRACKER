import { describe, expect, it } from 'vitest';
import type { Train } from '../types';
import { interpolatedProgress, progressForTrain, stripProgressForTrain } from './calculateTrainPosition';

function makeTrain(overrides: Partial<Train> = {}): Train {
  return {
    id: 'R-test',
    routeId: 'R',
    currentStationId: 'r-tamsui',
    nextStationId: 'r-hongshulin',
    remainingSeconds: 50,
    travelTimeSeconds: 100,
    status: 'normal',
    delaySeconds: 0,
    direction: 1,
    updatedAt: 1000,
    ...overrides,
  };
}

describe('progressForTrain', () => {
  it('依剩餘秒數比例回傳 progress (0..1)', () => {
    expect(progressForTrain(makeTrain({ remainingSeconds: 50, travelTimeSeconds: 100 }))).toBeCloseTo(0.5);
    expect(progressForTrain(makeTrain({ remainingSeconds: 100, travelTimeSeconds: 100 }))).toBe(0);
    expect(progressForTrain(makeTrain({ remainingSeconds: 0, travelTimeSeconds: 100 }))).toBe(1);
  });

  it('clamp 到 0..1，不因剩餘秒數超界而越界', () => {
    expect(progressForTrain(makeTrain({ remainingSeconds: 150, travelTimeSeconds: 100 }))).toBe(0);
    expect(progressForTrain(makeTrain({ remainingSeconds: -10, travelTimeSeconds: 100 }))).toBe(1);
  });

  it('travelTimeSeconds <= 0 時回傳 0（無法預測）', () => {
    expect(progressForTrain(makeTrain({ travelTimeSeconds: 0 }))).toBe(0);
    expect(progressForTrain(makeTrain({ travelTimeSeconds: -5 }))).toBe(0);
  });
});

describe('interpolatedProgress', () => {
  it('tick 之間以經過時間平滑插值位置', () => {
    const t = makeTrain({ remainingSeconds: 50, travelTimeSeconds: 100, updatedAt: 1000 });
    // nowMs === updatedAt → 無經過時間，progress 依剩餘秒數
    expect(interpolatedProgress(t, 1000, 16)).toBeCloseTo(0.5);
    // 經過 10 秒後，剩餘更少，progress 增加
    expect(interpolatedProgress(t, 11000, 16)).toBeCloseTo(0.59984);
  });

  it('clamp 到 0..1', () => {
    const t = makeTrain({ remainingSeconds: 0, travelTimeSeconds: 100, updatedAt: 0 });
    expect(interpolatedProgress(t, 100000, 16)).toBe(1);
    const t2 = makeTrain({ remainingSeconds: 200, travelTimeSeconds: 100, updatedAt: 0 });
    expect(interpolatedProgress(t2, 0, 16)).toBe(0);
  });
});

describe('stripProgressForTrain（路線直線圖：沿 path 索引的一維位置）', () => {
  const path = ['r-tamsui', 'r-hongshulin', 'r-zhuwei', 'r-guandu'];

  it('依 progress 在目前站與下一站的索引之間插值', () => {
    const t = makeTrain({ currentStationId: 'r-hongshulin', nextStationId: 'r-zhuwei' });
    expect(stripProgressForTrain(path, t, 0)).toBe(1);
    expect(stripProgressForTrain(path, t, 0.5)).toBeCloseTo(1.5);
    expect(stripProgressForTrain(path, t, 1)).toBe(2);
  });

  it('反向行駛時索引遞減', () => {
    const t = makeTrain({ currentStationId: 'r-zhuwei', nextStationId: 'r-hongshulin', direction: -1 });
    expect(stripProgressForTrain(path, t, 0)).toBe(2);
    expect(stripProgressForTrain(path, t, 1)).toBe(1);
  });

  it('列車所在區間不在給定 path 中（例如支線列車）時回傳 null', () => {
    const t = makeTrain({ currentStationId: 'r-beitou', nextStationId: 'r-xinbeitou' });
    expect(stripProgressForTrain(path, t, 0.5)).toBeNull();
  });
});
