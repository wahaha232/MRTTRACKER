import { describe, expect, it } from 'vitest';
import {
  formatAge,
  formatClock,
  formatClockShort,
  formatCountdown,
  formatDate,
  formatSeconds,
} from './time';

describe('台北時區時間格式化', () => {
  it('formatClock 以 Asia/Taipei（UTC+8）顯示小時/分鐘/秒', () => {
    // 2024-01-01 00:00 UTC = 台北 2024-01-01 08:00:00
    expect(formatClock(new Date('2024-01-01T00:00:00Z'))).toBe('08:00:00');
    expect(formatClock(new Date('2024-01-01T12:34:56Z'))).toBe('20:34:56');
  });

  it('formatClockShort 只顯示 HH:MM（台北時區）', () => {
    expect(formatClockShort(new Date('2024-06-15T16:05:00Z'))).toBe('00:05');
  });

  it('formatDate 使用台北時區的日期（跨日/跨月界線）', () => {
    // UTC 17:00 = 台北隔日 01:00，日期跨到隔天
    expect(formatDate(new Date('2024-01-01T17:00:00Z'))).toBe('2024-01-02');
    // 月底跨月
    expect(formatDate(new Date('2024-01-31T16:30:00Z'))).toBe('2024-02-01');
    expect(formatDate(new Date('2024-12-31T16:30:00Z'))).toBe('2025-01-01');
  });

  it('formatClock / formatDate 補零到兩碼', () => {
    expect(formatClock(new Date('2024-01-05T04:05:06Z'))).toBe('12:05:06');
    expect(formatDate(new Date('2024-03-07T00:00:00Z'))).toBe('2024-03-07');
  });
});

describe('秒數格式化', () => {
  it('formatSeconds 以 MM:SS 呈現', () => {
    expect(formatSeconds(0)).toBe('00:00');
    expect(formatSeconds(82)).toBe('01:22');
    expect(formatSeconds(60)).toBe('01:00');
    expect(formatSeconds(9)).toBe('00:09');
  });

  it('formatSeconds 負數與小數安全處理', () => {
    expect(formatSeconds(-5)).toBe('00:00');
    expect(formatSeconds(1.6)).toBe('00:02');
  });

  it('formatCountdown 只回傳整數秒數', () => {
    expect(formatCountdown(9)).toBe('9 sec');
    expect(formatCountdown(9.6)).toBe('10 sec');
    expect(formatCountdown(-3)).toBe('0 sec');
  });

  it('formatAge 計算資料年齡', () => {
    expect(formatAge(1000, 5000)).toBe('00:04');
    expect(formatAge(1000, 1000)).toBe('00:00');
    // now 早於 start 時不為負
    expect(formatAge(5000, 1000)).toBe('00:00');
  });
});
