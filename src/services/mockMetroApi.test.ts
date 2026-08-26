import { describe, expect, it } from 'vitest';
import type { Route, Train } from '../types';
import { getRoute } from '../data/routes';
import { generateMockTrains, nextPair, tickDemoTrains } from './mockMetroApi';

const R = getRoute('R') as Route;
const idx = (id: string) => R.stations.indexOf(id);

function makeTrain(overrides: Partial<Train> = {}): Train {
  return {
    id: 'R1201',
    routeId: 'R',
    currentStationId: 'r-tamsui',
    nextStationId: 'r-hongshulin',
    remainingSeconds: 3,
    travelTimeSeconds: 60,
    status: 'normal',
    delaySeconds: 0,
    direction: 1,
    updatedAt: 0,
    ...overrides,
  };
}

describe('nextPair（列車到站後的下一個 current/next 配對）', () => {
  it('中間段順向繼續前進', () => {
    const pair = nextPair(R, makeTrain({ currentStationId: 'r-hongshulin', nextStationId: 'r-zhuwei', direction: 1 }));
    expect(pair).toEqual({ current: 'r-zhuwei', next: 'r-guandu', dir: 1 });
  });

  it('到達主線終點（象山）時掉頭反向', () => {
    const taipei101 = 'r-taipei101';
    const xiangshan = 'r-xiangshan';
    const pair = nextPair(R, makeTrain({ currentStationId: taipei101, nextStationId: xiangshan, direction: 1 }));
    expect(pair).toEqual({ current: xiangshan, next: taipei101, dir: -1 });
  });

  it('支線終點（新北投）抵達後掉頭', () => {
    const pair = nextPair(
      R,
      makeTrain({ currentStationId: 'r-beitou', nextStationId: 'r-xinbeitou', direction: 1 }),
    );
    expect(pair.current).toBe('r-xinbeitou');
    expect(pair.next).toBe('r-beitou');
    expect(pair.dir).toBe(-1);
  });

  it('朝起點端滑行進入主線起點（淡水）時掉頭順向', () => {
    const pair = nextPair(R, makeTrain({ currentStationId: 'r-hongshulin', nextStationId: 'r-tamsui', direction: -1 }));
    expect(pair).toEqual({ current: 'r-tamsui', next: 'r-hongshulin', dir: 1 });
  });

  it('current/next 不相鄰時 fallback 掉頭', () => {
    const pair = nextPair(
      R,
      makeTrain({ currentStationId: 'r-tamsui', nextStationId: 'r-zhuwei', direction: 1 }),
    );
    expect(pair.current).toBe('r-zhuwei');
    expect(pair.next).toBe('r-tamsui');
    expect(pair.dir).toBe(-1);
  });
});

describe('generateMockTrains', () => {
  it('產生 128 台 demo 列車', () => {
    const trains = generateMockTrains();
    expect(trains).toHaveLength(128);
  });

  it('每台列車的 current/next 都是合法相鄰配對', () => {
    const trains = generateMockTrains();
    for (const t of trains) {
      const route = getRoute(t.routeId);
      expect(route).toBeDefined();
      const pair = nextPair(route as Route, t);
      expect(pair.current).toBeDefined();
    }
  });
});

describe('tickDemoTrains', () => {
  it('剩餘秒數大於 1 時只遞減、不換站', () => {
    const t = makeTrain({ remainingSeconds: 5, updatedAt: 100 });
    const [next] = tickDemoTrains([t], 200);
    expect(next.remainingSeconds).toBe(4);
    expect(next.currentStationId).toBe(t.currentStationId);
    expect(next.nextStationId).toBe(t.nextStationId);
  });

  it('剩餘秒數歸零時推進到下一 station 配對', () => {
    const t = makeTrain({ currentStationId: 'r-hongshulin', nextStationId: 'r-zhuwei', remainingSeconds: 1, updatedAt: 100 });
    const [next] = tickDemoTrains([t], 200);
    expect(next.currentStationId).toBe('r-zhuwei');
    expect(next.nextStationId).toBe('r-guandu');
    expect(next.remainingSeconds).toBeGreaterThan(0);
  });
});
