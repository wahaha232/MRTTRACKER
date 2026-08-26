// ---------------------------------------------------------------------------
// METRO QUEST — Top HUD（提示詞四：現在時間 / 日期 / LIVE indicator / 語系切換）
// ---------------------------------------------------------------------------
import { useEffect, useState } from 'react';
import { useMetroStore } from '../store/MetroStore';
import { dictionaries } from '../i18n/translations';
import { formatClock, formatDate } from '../utils/time';
import { unlockAudio } from '../utils/sound';
import type { Language } from '../types';

export function Header() {
  const { language, setLanguage, soundOn, toggleSound, mode, setMode, liveConfigured } =
    useMetroStore();
  const t = dictionaries[language];
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const switchLanguage = (l: Language) => {
    unlockAudio();
    setLanguage(l);
  };

  const switchMode = () => {
    unlockAudio();
    setMode(mode === 'demo' ? 'live' : 'demo');
  };

  return (
    <header className="mq-header">
      <div className="mq-header__brand">
        <h1 className="mq-header__title">METRO QUEST</h1>
        <p className="mq-header__subtitle">{t.subtitle}</p>
      </div>

      <div className="mq-header__right">
        <div
          className={`mq-live${mode === 'live' ? '' : ' mq-live--demo'}`}
          role="status"
          aria-label={mode === 'live' ? t.live : t.demoMode}
        >
          <span className="mq-live__dot" aria-hidden="true" />
          <span>{mode === 'live' ? t.live : t.demoMode}</span>
        </div>

        <div className="mq-clock">
          <span className="mq-clock__time">{formatClock(now)}</span>
          <span className="mq-clock__date">{formatDate(now)}</span>
        </div>

        <span className={`mq-mode-tag${mode === 'live' ? ' mq-mode-tag--live' : ''}`}>
          {mode === 'demo' ? t.demoMode : t.liveMode}
        </span>

        <button type="button" className="pixel-btn" onClick={switchMode} aria-label="Toggle mode">
          {mode === 'demo' ? t.liveMode : t.demoMode}
        </button>

        <button
          type="button"
          className="pixel-btn"
          onClick={() => switchLanguage(language === 'zh' ? 'en' : 'zh')}
          aria-label="Switch language"
        >
          {language === 'zh' ? 'EN' : '繁中'}
        </button>

        <button
          type="button"
          className="pixel-btn"
          onClick={() => {
            unlockAudio();
            toggleSound();
          }}
          aria-pressed={soundOn}
          aria-label={soundOn ? t.soundOn : t.soundOff}
        >
          {soundOn ? '🔊' : '🔇'}
        </button>

        {!liveConfigured && mode === 'live' ? (
          <span className="mq-mode-tag" title="VITE_METRO_API_BASE_URL not set">
            API KEY?
          </span>
        ) : null}
      </div>
    </header>
  );
}
