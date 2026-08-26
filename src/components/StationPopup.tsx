// ---------------------------------------------------------------------------
// METRO QUEST — Station Popup（提示詞十八）
// 點擊車站彈出 Pixel Window，顯示往各方向列車的到站資訊。
// 資料若不存在，顯示「無」而非捏造。
// ---------------------------------------------------------------------------
import { useMetroStore } from '../store/MetroStore';
import { dictionaries } from '../i18n/translations';
import { getStation } from '../data/stations';
import { getRoute } from '../data/routes';
import { formatSeconds } from '../utils/time';
import { PixelWindow } from './PixelWindow';

interface StationPopupProps {
  stationId: string;
  /** 錨點位置（螢幕像素，map-wrap 座標系） */
  anchorX: number;
  anchorY: number;
}

export function StationPopup({ stationId, anchorX, anchorY }: StationPopupProps) {
  const { language, mode, trains, arrivals, closeSelection } = useMetroStore();
  const t = dictionaries[language];
  const station = getStation(stationId);
  if (!station) return null;

  const isLive = mode === 'live';
  const stationTrains = trains.filter((tr) => tr.nextStationId === stationId);
  const stationArrivals = arrivals.filter((a) => a.stationId === stationId);
  const route = station.routeIds.length > 0 ? getRoute(station.routeIds[0]) : undefined;

  const width = 260;
  const maxX = typeof window !== 'undefined' ? window.innerWidth - 24 : 600;
  const maxY = typeof window !== 'undefined' ? window.innerHeight - 120 : 500;
  const x = Math.min(Math.max(8, anchorX - width / 2), Math.max(8, maxX));
  const y = Math.min(Math.max(8, anchorY + 14), Math.max(8, maxY));

  return (
    <div
      style={{ position: 'absolute', left: x, top: y, zIndex: 30 }}
      onClick={(e) => e.stopPropagation()}
    >
      <PixelWindow
        title={`★ ${language === 'zh' ? station.nameZh : station.nameEn} STATION`}
        onClose={closeSelection}
      >
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {station.routeIds.map((rid) => {
            const r = getRoute(rid);
            if (!r) return null;
            return (
              <span
                key={rid}
                className="pixel-tag"
                style={{ background: r.color, color: '#0a0e26' }}
              >
                {language === 'zh' ? r.nameZh : r.nameEn}
              </span>
            );
          })}
        </div>

        {station.routeIds.length > 1 ? (
          <div className="mq-arrival-row">
            <span className="mq-arrival-row__dir">{t.transfer}</span>
            <span className="mq-arrival-row__time">{t.none}</span>
          </div>
        ) : null}

        {isLive ? (
          stationArrivals.length === 0 ? (
            <div className="mq-arrival-row">
              <span className="mq-arrival-row__dir">{t.direction}</span>
              <span className="mq-arrival-row__time">{t.none}</span>
            </div>
          ) : (
            stationArrivals.slice(0, 4).map((a, i) => {
              const r = getRoute(a.routeId);
              return (
                <div className="mq-arrival-row" key={`${a.routeId}-${i}`}>
                  <span className="mq-arrival-row__dir">
                    {t.to} {language === 'zh' ? a.directionZh : a.directionEn} · {r?.shortName}
                  </span>
                  <span className="mq-arrival-row__time">
                    {a.seconds === null ? t.none : formatSeconds(a.seconds)}
                  </span>
                </div>
              );
            })
          )
        ) : stationTrains.length === 0 ? (
          <div className="mq-arrival-row">
            <span className="mq-arrival-row__dir">{t.direction}</span>
            <span className="mq-arrival-row__time">--</span>
          </div>
        ) : (
          stationTrains.slice(0, 4).map((tr) => {
            const cur = getStation(tr.currentStationId);
            const r = getRoute(tr.routeId);
            return (
              <div className="mq-arrival-row" key={tr.id}>
                <span className="mq-arrival-row__dir">
                  {t.to}{' '}
                  {language === 'zh' ? cur?.nameZh : cur?.nameEn} · {r?.shortName}
                </span>
                <span className="mq-arrival-row__time">
                  {tr.status === 'delay' ? '⚠ ' : ''}
                  {formatSeconds(tr.remainingSeconds)}
                </span>
              </div>
            );
          })
        )}

        <div className="mq-arrival-row">
          <span className="mq-arrival-row__dir">{t.position}</span>
          <span className="mq-arrival-row__time">{isLive ? t.notAvailable : t.estimated}</span>
        </div>
        {!isLive ? (
          <div className="mq-arrival-row">
            <span className="mq-arrival-row__dir">{t.updated}</span>
            <span className="mq-arrival-row__time">
              {formatSeconds(
                stationTrains.length > 0
                  ? Math.max(0, Math.round((Date.now() - stationTrains[0].updatedAt) / 1000))
                  : 0,
              )}
            </span>
          </div>
        ) : null}
        <span style={{ fontFamily: 'var(--mq-font-en)', fontSize: 8, color: 'var(--mq-text-dim)' }}>
          {route ? `${route.shortName} · ${station.code}` : station.code}
        </span>
      </PixelWindow>
    </div>
  );
}
