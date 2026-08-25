// ---------------------------------------------------------------------------
// METRO QUEST — App（Dashboard + 路由 + Loading）
// ---------------------------------------------------------------------------
import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { MetroStoreProvider, useMetroStore } from './store/MetroStore';
import { dictionaries } from './i18n/translations';
import { Header } from './components/Header';
import { RoutePanel } from './components/RoutePanel';
import { WorldSelector } from './components/WorldSelector';
import { MetroMap } from './components/MetroMap';
import { TrainPanel } from './components/TrainPanel';
import { StatusBar } from './components/StatusBar';
import { LoadingScreen } from './components/LoadingScreen';
import { NotFound } from './components/NotFound';
import { getRoute } from './data/routes';
import { ROUTES } from './data/routes';
import { getStation } from './data/stations';
import { formatSeconds } from './utils/time';

/** 手機版操作模式 */
type MobileSheetMode = 'routes' | 'trains' | 'detail';

/** 手機浮動控制列：路線 / 列車 */
function MobileControlBar({
  onRoutes,
  onTrains,
}: {
  onRoutes: () => void;
  onTrains: () => void;
}) {
  const { language } = useMetroStore();
  const t = dictionaries[language];
  return (
    <div className="mq-mobile-bar" role="toolbar" aria-label="Mobile controls">
      <button type="button" className="pixel-btn" onClick={onRoutes}>
        🗺 {t.routesTitle}
      </button>
      <button type="button" className="pixel-btn" onClick={onTrains}>
        🚇 {t.trainControlTitle}
      </button>
    </div>
  );
}

/** 手機：路線選擇清單 */
function MobileRouteList({ onDone }: { onDone: () => void }) {
  const { language, trains, selectedRouteId, selectRoute } = useMetroStore();
  const t = dictionaries[language];
  const count = (rid: string) => trains.filter((tr) => tr.routeId === rid).length;
  return (
    <div className="mq-sheet-list">
      <button
        type="button"
        className={`mq-route-item${selectedRouteId === null ? ' mq-route-item--active' : ''}`}
        onClick={() => {
          selectRoute(null);
          onDone();
        }}
      >
        <span
          className="mq-route-item__swatch"
          style={{
            background:
              'linear-gradient(135deg,#e3002c 0 25%,#0070c0 25% 50%,#008659 50% 75%,#ff9e18 75% 100%)',
          }}
        />
        <span className="mq-route-item__info">
          <span className="mq-route-item__name">{t.allRoutes}</span>
          <span className="mq-route-item__meta">
            <span className="mq-status-badge mq-status-badge--normal">
              {trains.length} {t.trains}
            </span>
          </span>
        </span>
      </button>
      {ROUTES.map((route) => {
        const active = selectedRouteId === route.id;
        return (
          <button
            key={route.id}
            type="button"
            className={`mq-route-item${active ? ' mq-route-item--active' : ''}`}
            onClick={() => {
              selectRoute(active ? null : route.id);
              onDone();
            }}
          >
            <span className="mq-route-item__swatch" style={{ background: route.color }} />
            <span className="mq-route-item__info">
              <span className="mq-route-item__name">
                {language === 'zh' ? route.nameZh : route.nameEn}
              </span>
              <span className="mq-route-item__meta">
                <span className="mq-status-badge mq-status-badge--normal">
                  {count(route.id)} {t.trains}
                </span>
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** 手機：列車清單 */
function MobileTrainList() {
  const { language, trains, selectTrain } = useMetroStore();
  const t = dictionaries[language];
  const list = trains.slice(0, 20);
  const nm = (s?: { nameZh: string; nameEn: string }) =>
    s ? (language === 'zh' ? s.nameZh : s.nameEn) : '--';
  return (
    <div className="mq-sheet-list">
      <div className="mq-sheet-list__hint">
        {trains.length} {t.trains} · {t.selectTrainHint}
      </div>
      {list.map((tr) => {
        const route = getRoute(tr.routeId);
        return (
          <button
            key={tr.id}
            type="button"
            className="mq-route-item"
            onClick={() => selectTrain(tr.id)}
          >
            <span className="mq-route-item__swatch" style={{ background: route?.color ?? '#888' }} />
            <span className="mq-route-item__info">
              <span className="mq-route-item__name">
                {t.train} {tr.id}
              </span>
              <span className="mq-route-item__name--en">
                {nm(getStation(tr.currentStationId))} → {nm(getStation(tr.nextStationId))} ·{' '}
                {formatSeconds(tr.remainingSeconds)}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}


/** 手機：選取列車詳情 */
function MobileTrainDetail() {
  const { language, trains, selectedTrainId, selectTrain } = useMetroStore();
  const t = dictionaries[language];
  const train = trains.find((tr) => tr.id === selectedTrainId) ?? null;
  if (!train) return null;
  const route = getRoute(train.routeId);
  const cur = getStation(train.currentStationId);
  const next = getStation(train.nextStationId);
  const nm = (s?: { nameZh: string; nameEn: string }) =>
    s ? (language === 'zh' ? s.nameZh : s.nameEn) : '--';
  return (
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
      <div className="mq-train-detail__row">
        <span className="mq-train-detail__key">{t.route}</span>
        <span className="mq-train-detail__value mq-train-detail__value--en">
          {route ? (language === 'zh' ? route.nameZh : route.nameEn) : train.routeId}
        </span>
      </div>
      <div className="mq-train-detail__row">
        <span className="mq-train-detail__key">{t.direction}</span>
        <span className="mq-train-detail__value">{`${t.to} ${nm(next)}`}</span>
      </div>
      <div className="mq-train-detail__row">
        <span className="mq-train-detail__key">{t.current}</span>
        <span className="mq-train-detail__value">{nm(cur)}</span>
      </div>
      <div className="mq-train-detail__row">
        <span className="mq-train-detail__key">{t.nextStation}</span>
        <span className="mq-train-detail__value">{nm(next)}</span>
      </div>
      <div className="mq-train-detail__row">
        <span className="mq-train-detail__key">{t.remaining}</span>
        <span className="mq-train-detail__value mq-train-detail__value--accent">
          {formatSeconds(train.remainingSeconds)}
        </span>
      </div>
      <div className="mq-train-detail__row">
        <span className="mq-train-detail__key">{t.status}</span>
        <span
          className={`mq-train-detail__value ${
            train.status === 'delay'
              ? 'mq-train-detail__value--delay'
              : 'mq-train-detail__value--green'
          }`}
        >
          {train.status === 'delay' ? t.delay : t.normal}
        </span>
      </div>
      <div className="mq-train-detail__row">
        <span className="mq-train-detail__key">{t.position}</span>
        <span className="mq-train-detail__value mq-train-detail__value--en">
          {t.estimatedPosition}
        </span>
      </div>
      <button type="button" className="pixel-btn" onClick={() => selectTrain(null)}>
        ✕ {t.noTrainSelected}
      </button>
    </div>
  );
}

/** 手機底部 Bottom Sheet（路線 / 列車 / 詳情） */
function MobileBottomSheet({
  open,
  mode,
  onClose,
}: {
  open: boolean;
  mode: MobileSheetMode;
  onClose: () => void;
}) {
  const { language } = useMetroStore();
  const t = dictionaries[language];
  const title = mode === 'routes' ? t.routesTitle : t.trainControlTitle;
  return (
    <div
      className={`mq-bottom-sheet${open ? ' mq-bottom-sheet--open' : ''}`}
      role="dialog"
      aria-label={title}
      aria-hidden={!open}
    >
      <div className="mq-bottom-sheet__handle" aria-hidden="true" />
      <div className="mq-bottom-sheet__header">
        <span className="mq-bottom-sheet__title">{title}</span>
        {open ? (
          <button type="button" className="pixel-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        ) : null}
      </div>
      <div className="mq-bottom-sheet__body">
        {mode === 'routes' ? <MobileRouteList onDone={onClose} /> : null}
        {mode === 'trains' ? <MobileTrainList /> : null}
        {mode === 'detail' ? <MobileTrainDetail /> : null}
      </div>
    </div>
  );
}

function Dashboard() {
  const { language, liveError, selectedTrainId, selectTrain } = useMetroStore();
  const t = dictionaries[language];
  const [mobileSheet, setMobileSheet] = useState<MobileSheetMode | null>(null);

  // 選取列車消失時，同步關閉 detail sheet
  useEffect(() => {
    if (!selectedTrainId) {
      setMobileSheet((m) => (m === 'detail' ? null : m));
    }
  }, [selectedTrainId]);

  const sheetMode: MobileSheetMode | null = selectedTrainId ? 'detail' : mobileSheet;
  const sheetOpen = sheetMode !== null;

  const openSheet = (mode: 'routes' | 'trains') => setMobileSheet(mode);
  const closeSheet = () => {
    if (selectedTrainId) selectTrain(null);
    setMobileSheet(null);
  };

  return (
    <div className="mq-dashboard">
      <div className="crt-overlay" aria-hidden="true" />
      <Header />
      {liveError ? (
        <div className="mq-alert-banner" role="alert">
          <span aria-hidden="true">⚠</span> {t.connectionLost} · {t.fallbackToDemo}
        </div>
      ) : null}
      <div className="mq-main">
        <RoutePanel />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            minHeight: 0,
            position: 'relative',
          }}
        >
          <WorldSelector />
          <MetroMap />
          {sheetOpen ? (
            <div
              className="mq-sheet-backdrop mq-sheet-backdrop--open"
              onClick={closeSheet}
              aria-hidden="true"
            />
          ) : null}
          <MobileControlBar
            onRoutes={() => openSheet('routes')}
            onTrains={() => openSheet('trains')}
          />
          <MobileBottomSheet open={sheetOpen} mode={sheetMode ?? 'trains'} onClose={closeSheet} />
        </div>
        <TrainPanel />
      </div>
      <StatusBar />
    </div>
  );
}

function AppInner() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 2500);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      {loading ? <LoadingScreen /> : null}
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <MetroStoreProvider>
      <AppInner />
    </MetroStoreProvider>
  );
}
