// ---------------------------------------------------------------------------
// METRO QUEST — 底部 System Status Bar（提示詞十九 / 二十）
// ---------------------------------------------------------------------------
import { useMetroStore } from '../store/MetroStore';
import { dictionaries } from '../i18n/translations';
import { formatClock, formatCountdown } from '../utils/time';

export function StatusBar() {
  const {
    language,
    trains,
    systemStatus,
    delayCount,
    lastUpdatedAt,
    nextUpdateIn,
    mode,
  } = useMetroStore();
  const t = dictionaries[language];

  const statusText =
    systemStatus === 'normal'
      ? t.allSystemsNormal
      : systemStatus === 'delay'
        ? t.minorDelays
        : t.serviceAlert;

  const statusClass =
    systemStatus === 'normal' ? 'dot--green' : systemStatus === 'delay' ? 'dot--yellow' : 'dot--red';

  const updatedLabel = lastUpdatedAt ? formatClock(new Date(lastUpdatedAt)) : '--:--:--';

  return (
    <footer className="mq-statusbar">
      <span className="mq-statusbar__label">{t.systemStatus}</span>
      <span className="mq-statusbar__stat">
        <span className={`dot ${statusClass}`} aria-hidden="true" />
        {statusText}
      </span>
      <span className="mq-statusbar__stat">
        🚇 {trains.length} {t.trains}
      </span>
      {delayCount > 0 ? (
        <span className="mq-statusbar__stat" style={{ color: 'var(--mq-red)' }}>
          {t.delay} {delayCount}
        </span>
      ) : (
        <span className="mq-statusbar__stat">{t.delay} 0</span>
      )}
      <span className="mq-statusbar__stat">
        {t.updated} {updatedLabel}
      </span>
      {mode === 'live' ? (
        <span className="mq-statusbar__stat">
          {t.nextUpdate} {formatCountdown(nextUpdateIn)}
        </span>
      ) : null}

      <div className="mq-statusbar__right">
        <a
          className="mq-statusbar__stat"
          href={t.dataSourceUrl}
          target="_blank"
          rel="noreferrer"
          title={t.dataSourceName}
        >
          {t.dataSource} · {t.openData}
        </a>
      </div>
    </footer>
  );
}
