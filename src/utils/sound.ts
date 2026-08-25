// ---------------------------------------------------------------------------
// METRO QUEST — 音效（提示詞三十六）
// 預設 MUTE；只有在使用者互動後才允許播放（Web Audio 需使用者手勢）。
// ---------------------------------------------------------------------------

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  try {
    if (!audioCtx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      audioCtx = new Ctor();
    }
    if (audioCtx.state === 'suspended') {
      void audioCtx.resume();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

function beep(freq: number, durationMs: number, type: OscillatorType = 'square', volume = 0.04): void {
  const ac = getCtx();
  if (!ac) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(volume, ac.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + durationMs / 1000);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start();
  osc.stop(ac.currentTime + durationMs / 1000);
}

/** 到站提示音 */
export function playArrival(): void {
  beep(880, 70);
  beep(1320, 90);
}

/** 通知音 */
export function playNotification(): void {
  beep(660, 80);
}

/** 異常警示音 */
export function playAlert(): void {
  beep(220, 140);
  setTimeout(() => beep(160, 200), 130);
}

/** 使用者互動後呼叫，解除瀏覽器播放限制 */
export function unlockAudio(): void {
  getCtx();
}
