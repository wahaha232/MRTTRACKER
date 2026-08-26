// ---------------------------------------------------------------------------
// METRO QUEST — Loading Screen
// 白色背景 + 列車從左向右跑 + 進度條 → Ready!
// ---------------------------------------------------------------------------
import { useEffect, useState } from 'react';

export function LoadingScreen() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          window.clearInterval(timer);
          return 100;
        }
        return Math.min(100, p + 6);
      });
    }, 90);
    return () => window.clearInterval(timer);
  }, []);

  const ready = progress >= 100;

  return (
    <div className="mq-loading" role="status" aria-live="polite">
      <div className="mq-loading__title">
        {ready ? 'READY!' : 'LOADING METRO MAP...'}
      </div>
      <div className="mq-loading__train" aria-hidden="true">
        <div className="mq-loading__train-track" />
        <div className="mq-loading__train-sprite">
          <svg width="80" height="24" viewBox="0 0 80 24">
            <rect x="2" y="6" width="60" height="12" fill="#f2f4ff" stroke="#0a0e26" strokeWidth="2" />
            <rect x="2" y="11" width="60" height="3" fill="#e3002c" />
            <rect x="62" y="7" width="6" height="10" fill="#d5d9f0" stroke="#0a0e26" strokeWidth="2" />
            <rect x="8" y="7" width="10" height="4" fill="#9be7ff" />
            <rect x="22" y="7" width="10" height="4" fill="#9be7ff" />
            <rect x="36" y="7" width="10" height="4" fill="#9be7ff" />
            <rect x="64" y="8" width="3" height="3" fill="#fff6b8" />
            <rect x="8" y="18" width="6" height="4" fill="#1a1f3d" />
            <rect x="26" y="18" width="6" height="4" fill="#1a1f3d" />
            <rect x="44" y="18" width="6" height="4" fill="#1a1f3d" />
            <rect x="60" y="18" width="6" height="4" fill="#1a1f3d" />
          </svg>
        </div>
      </div>
      <div className="mq-loading__bar">
        <div className="mq-loading__fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="mq-loading__pct">{String(progress).padStart(3, '0')}%</div>
    </div>
  );
}
