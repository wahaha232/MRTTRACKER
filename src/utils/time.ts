// ---------------------------------------------------------------------------
// METRO QUEST — 時間工具
// ---------------------------------------------------------------------------

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

/** 現在時間 HH:MM:SS */
export function formatClock(d: Date): string {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
}

/** 現在時間 HH:MM（手機 HUD 用） */
export function formatClockShort(d: Date): string {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

/** 日期 YYYY-MM-DD */
export function formatDate(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** 秒數 → MM:SS（例 82 → 01:22） */
export function formatSeconds(sec: number): string {
  const s = Math.max(0, Math.round(sec));
  return `${pad2(Math.floor(s / 60))}:${pad2(s % 60)}`;
}

/** 秒數倒數計時（NEXT UPDATE 09 sec） */
export function formatCountdown(sec: number): string {
  return `${Math.max(0, Math.round(sec))} sec`;
}

/** 資料年齡 DATA AGE 00:18 */
export function formatAge(startMs: number, nowMs: number): string {
  const diff = Math.max(0, Math.floor((nowMs - startMs) / 1000));
  return `${pad2(Math.floor(diff / 60))}:${pad2(diff % 60)}`;
}

/** 台灣時區日期字串（用於系統資訊） */
export function systemTimeString(): string {
  const d = new Date();
  return `${formatClock(d)} ${formatDate(d)}`;
}
