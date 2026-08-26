// ---------------------------------------------------------------------------
// METRO QUEST — 時間工具
// 時間一律以「台北時區（Asia/Taipei）」顯示，避免使用者所在時區不同而造成
// 誤導（這是台北捷運追蹤網站，顯示的便是台北時間）。
// ---------------------------------------------------------------------------

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

/** 用指定的時區取得 Date 的各時間欄位（hour/min/sec/year/month/day） */
function partsInZone(d: Date, timeZone = 'Asia/Taipei') {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(d);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '00';
  return {
    hour: Number(get('hour')),
    minute: Number(get('minute')),
    second: Number(get('second')),
    year: Number(get('year')),
    month: Number(get('month')),
    day: Number(get('day')),
  };
}

/** 現在時間 HH:MM:SS（台北時區） */
export function formatClock(d: Date): string {
  const p = partsInZone(d);
  return `${pad2(p.hour)}:${pad2(p.minute)}:${pad2(p.second)}`;
}

/** 現在時間 HH:MM（手機 HUD 用，台北時區） */
export function formatClockShort(d: Date): string {
  const p = partsInZone(d);
  return `${pad2(p.hour)}:${pad2(p.minute)}`;
}

/** 日期 YYYY-MM-DD（台北時區） */
export function formatDate(d: Date): string {
  const p = partsInZone(d);
  return `${p.year}-${pad2(p.month)}-${pad2(p.day)}`;
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
