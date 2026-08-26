// ---------------------------------------------------------------------------
// METRO QUEST — 左側 Route Control Panel（提示詞五）
// 每條路線顯示：路線顏色 / 名稱 / 運行列車數 / 系統狀態 / 延誤狀態
// ---------------------------------------------------------------------------
import { useMetroStore } from '../store/MetroStore';
import { ROUTES } from '../data/routes';
import { dictionaries } from '../i18n/translations';
import type { TrainStatus } from '../types';

export function RoutePanel() {
  const { language, trains, selectedRouteId, selectRoute, delayHistory } = useMetroStore();
  const t = dictionaries[language];

  const countByRoute = (routeId: string) => trains.filter((tr) => tr.routeId === routeId).length;
  const delayByRoute = (routeId: string) =>
    trains.filter((tr) => tr.routeId === routeId && tr.status === 'delay').length;

  const statusOf = (routeId: string): TrainStatus => {
    const delayed = delayByRoute(routeId);
    if (delayed >= 4) return 'delay';
    return 'normal';
  };

  return (
    <div className="mq-panel-col mq-panel-col--left">
      <div className="mq-panel-col__title">{t.routesTitle}</div>
      <div className="mq-panel-col__body">
        <button
          type="button"
          className={`mq-route-item${selectedRouteId === null ? ' mq-route-item--active' : ''}`}
          onClick={() => selectRoute(null)}
        >
          <span
            className="mq-route-item__swatch"
            style={{ background: 'linear-gradient(135deg, #e3002c 0 33%, #0070c0 33% 66%, #008659 66% 100%)' }}
            aria-hidden="true"
          />
          <span className="mq-route-item__info">
            <span className="mq-route-item__name">{language === 'zh' ? t.allRoutes : t.allRoutes}</span>
            <span className="mq-route-item__name--en">
              {trains.length} {t.trains}
            </span>
          </span>
        </button>

        {ROUTES.map((route) => {
          const status = statusOf(route.id);
          const count = countByRoute(route.id);
          const delay = delayByRoute(route.id);
          const active = selectedRouteId === route.id;
          return (
            <button
              type="button"
              key={route.id}
              className={`mq-route-item${active ? ' mq-route-item--active' : ''}`}
              onClick={() => selectRoute(active ? null : route.id)}
              aria-pressed={active}
            >
              <span
                className="mq-route-item__swatch"
                style={{ background: route.color }}
                aria-hidden="true"
              />
              <span className="mq-route-item__info">
                <span className="mq-route-item__name">
                  {language === 'zh' ? route.nameZh : route.nameEn}
                </span>
                <span className="mq-route-item__name--en">
                  {route.shortName} · {t.world} {String(route.worldId).padStart(2, '0')}
                </span>
                <span className="mq-route-item__meta">
                  <span className="mq-status-badge mq-status-badge--normal">
                    {count} {t.trains}
                  </span>
                  {delay > 0 ? (
                    <span className="mq-status-badge mq-status-badge--delay">
                      {t.delay} +{delay}
                    </span>
                  ) : (
                    <span className="mq-status-badge mq-status-badge--normal">{t.normal}</span>
                  )}
                  <span
                    className={`mq-status-badge ${
                      status === 'delay' ? 'mq-status-badge--delay' : 'mq-status-badge--normal'
                    }`}
                  >
                    {status === 'delay' ? t.delay : t.normal}
                  </span>
                </span>
              </span>
            </button>
          );
        })}

        {/* 延誤趨勢（加分功能）：每 ~30 秒取樣一次全系統延誤比例 */}
        {delayHistory.length > 1 ? (
          <div className="mq-delay-trend">
            <div className="mq-panel-col__title" style={{ padding: '6px 8px', fontSize: 8 }}>
              {t.delayTrend}
            </div>
            <div className="mq-delay-trend__chart" aria-hidden="true">
              {delayHistory.map((ratio, i) => {
                const pct = Math.max(6, Math.round(ratio * 100));
                return (
                  <div
                    key={i}
                    className="mq-delay-trend__bar"
                    style={{
                      height: `${pct}%`,
                      background: ratio > 0.5 ? 'var(--mq-red)' : ratio > 0.05 ? 'var(--mq-yellow)' : 'var(--mq-green)',
                    }}
                  />
                );
              })}
            </div>
            <div className="mq-delay-trend__legend">
              <span className="mq-delay-trend__cell">● {t.normal}</span>
              <span className="mq-delay-trend__cell" style={{ color: 'var(--mq-yellow)' }}>
                ● {t.delay}
              </span>
              <span className="mq-delay-trend__cell" style={{ color: 'var(--mq-red)' }}>
                ● {t.alert}
              </span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
