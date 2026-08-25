// ---------------------------------------------------------------------------
// METRO QUEST — World Selector（提示詞二十四：WORLD 01 ~ 06）
// 點擊 World 後中央地圖只 highlight 該路線。
// ---------------------------------------------------------------------------
import { useMetroStore } from '../store/MetroStore';
import { ROUTES } from '../data/routes';
import { dictionaries } from '../i18n/translations';

export function WorldSelector() {
  const { language, selectedRouteId, selectRoute } = useMetroStore();
  const t = dictionaries[language];

  return (
    <div className="mq-worldbar" role="tablist" aria-label={t.worldSelectorTitle}>
      <button
        type="button"
        role="tab"
        aria-selected={selectedRouteId === null}
        className={`mq-worldbar__chip${selectedRouteId === null ? ' mq-worldbar__chip--active' : ''}`}
        onClick={() => selectRoute(null)}
      >
        {t.allRoutes}
      </button>
      {ROUTES.map((route) => (
        <button
          type="button"
          role="tab"
          key={route.id}
          aria-selected={selectedRouteId === route.id}
          className={`mq-worldbar__chip${selectedRouteId === route.id ? ' mq-worldbar__chip--active' : ''}`}
          onClick={() => selectRoute(selectedRouteId === route.id ? null : route.id)}
        >
          {t.world} {String(route.worldId).padStart(2, '0')} · {route.shortName}
        </button>
      ))}
    </div>
  );
}
