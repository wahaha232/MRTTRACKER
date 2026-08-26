// ---------------------------------------------------------------------------
// METRO QUEST — 右側 Train Control Panel（提示詞十六）
// ---------------------------------------------------------------------------
import { useMetroStore } from '../store/MetroStore';
import { dictionaries } from '../i18n/translations';
import { getRoute } from '../data/routes';
import { getStation } from '../data/stations';
import { formatSeconds } from '../utils/time';
import { AdSlot } from './AdSlot';
import type { Language, Train } from '../types';

interface RowProps {
  label: string;
  value: string;
  accent?: boolean;
  valueClass?: string;
}

function Row({ label, value, accent, valueClass }: RowProps) {
  return (
    <div className="mq-train-detail__row">
      <span className="mq-train-detail__key">{label}</span>
      <span
        className={`mq-train-detail__value${valueClass ? ` ${valueClass}` : ''}${
          accent ? ' mq-train-detail__value--accent' : ''
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function trainDetail(train: Train, language: Language) {
  const route = getRoute(train.routeId);
  const current = getStation(train.currentStationId);
  const next = getStation(train.nextStationId);
  return {
    routeName: route ? (language === 'zh' ? route.nameZh : route.nameEn) : train.routeId,
    currentName: current ? (language === 'zh' ? current.nameZh : current.nameEn) : '--',
    nextName: next ? (language === 'zh' ? next.nameZh : next.nameEn) : '--',
  };
}

export function TrainPanel() {
  const { language, mode, trains, selectedTrainId, selectTrain } = useMetroStore();
  const t = dictionaries[language];
  const train = trains.find((tr) => tr.id === selectedTrainId) ?? null;
  const list = trains.slice(0, 8);

  return (
    <div className="mq-panel-col mq-panel-col--right">
      <div className="mq-panel-col__title">{t.trainControlTitle}</div>
      <div className="mq-panel-col__body">
        {train ? (
          <div className="mq-train-detail">
            <div className="mq-train-detail__header">
              <span className="mq-train-detail__id">
                {t.train} {train.id}
              </span>
              <span
                className={`mq-status-badge ${
                  train.status === 'delay' ? 'mq-status-badge--delay' : 'mq-status-badge--normal'
                }`}
              >
                {train.status === 'delay' ? t.delay : t.normal}
              </span>
            </div>
            {(() => {
              const d = trainDetail(train, language);
              return (
                <>
                  <Row label={t.route} value={d.routeName} valueClass="mq-train-detail__value--en" />
                  <Row label={t.direction} value={`${t.to} ${d.nextName}`} accent />
                  <Row label={t.current} value={d.currentName} />
                  <Row label={t.nextStation} value={d.nextName} accent />
                  <Row
                    label={t.remaining}
                    value={formatSeconds(train.remainingSeconds)}
                    valueClass="mq-train-detail__value--accent"
                  />
                  <Row
                    label={t.status}
                    value={train.status === 'delay' ? t.delay : t.normal}
                    valueClass={
                      train.status === 'delay'
                        ? 'mq-train-detail__value--delay'
                        : 'mq-train-detail__value--green'
                    }
                  />
                  {train.delaySeconds > 0 ? (
                    <Row
                      label={t.delay}
                      value={`+${train.delaySeconds}s`}
                      valueClass="mq-train-detail__value--delay"
                    />
                  ) : null}
                  <Row label={t.position} value={t.estimatedPosition} valueClass="mq-train-detail__value--en" />
                  <Row label={t.speed} value={t.notAvailable} valueClass="mq-train-detail__value--en" />
                  <Row
                    label={t.lastUpdate}
                    value={train.updatedAt ? formatSeconds(Math.round((Date.now() - train.updatedAt) / 1000)) : '--'}
                    valueClass="mq-train-detail__value--en"
                  />
                  <button type="button" className="pixel-btn" onClick={() => selectTrain(null)}>
                    ✕
                  </button>
                </>
              );
            })()}
          </div>
        ) : (
          <div className="mq-empty-hint">
            <span className="mq-train-detail__id">--</span>
            <span className="mq-empty-hint__text">{t.noTrainSelected}</span>
            <span className="mq-empty-hint__text">
              {mode === 'live' ? t.selectStationHint : t.selectTrainHint}
            </span>
          </div>
        )}

        {!train ? (
          <div className="mq-train-detail" style={{ marginTop: 8 }}>
            <div className="mq-panel-col__title" style={{ padding: '6px 8px', fontSize: 8 }}>
              {t.trains}
            </div>
            {list.map((tr) => (
              <button
                type="button"
                key={tr.id}
                className="mq-route-item"
                onClick={() => selectTrain(tr.id)}
              >
                <span
                  className="mq-route-item__swatch"
                  style={{ background: getRoute(tr.routeId)?.color ?? '#888' }}
                  aria-hidden="true"
                />
                <span className="mq-route-item__info">
                  <span className="mq-route-item__name">
                    {t.train} {tr.id}
                  </span>
                  <span className="mq-route-item__name--en">
                    {trainDetail(tr, language).routeName}
                  </span>
                  <span className="mq-route-item__meta">
                    <span className="mq-status-badge mq-status-badge--normal">
                      {formatSeconds(tr.remainingSeconds)}
                    </span>
                    {tr.status === 'delay' ? (
                      <span className="mq-status-badge mq-status-badge--delay">{t.delay}</span>
                    ) : null}
                  </span>
                </span>
              </button>
            ))}
          </div>
        ) : null}
      </div>
      {/* 桌面：右側 300×250 矩形廣告位（整欄僅 >=1024px 顯示） */}
      <AdSlot slotKey="RECT" variant="rectangle" />
    </div>
  );
}
