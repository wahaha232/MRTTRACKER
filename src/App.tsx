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
import { getStation } from './data/stations';
import { formatSeconds } from './utils/time';

/** 手機版 Bottom Sheet 的列車資訊 */
function MobileTrainSheet() {
  const { language, trains, selectedTrainId, selectTrain } = useMetroStore();
  const t = dictionaries[language];
  const train = trains.find((tr) => tr.id === selectedTrainId) ?? null;
  if (!train) return null;
  const route = getRoute(train.routeId);
  const cur = getStation(train.currentStationId);
  const next = getStation(train.nextStationId);
  const name = (s?: { nameZh: string; nameEn: string }) =>
    s ? (language === 'zh' ? s.nameZh : s.nameEn) : '--';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between' }}>
        <span className="mq-train-detail__id">
          {t.train} {train.id}
        </span>
        <button type="button" className="pixel-btn" onClick={() => selectTrain(null)}>
          ✕
        </button>
      </div>
      <div className="mq-train-detail__row">
        <span className="mq-train-detail__key">{t.route}</span>
        <span className="mq-train-detail__value mq-train-detail__value--en">
          {route ? (language === 'zh' ? route.nameZh : route.nameEn) : train.routeId}
        </span>
      </div>
      <div className="mq-train-detail__row">
        <span className="mq-train-detail__key">{t.direction}</span>
        <span className="mq-train-detail__value">{`${t.to} ${name(next)}`}</span>
      </div>
      <div className="mq-train-detail__row">
        <span className="mq-train-detail__key">{t.current}</span>
        <span className="mq-train-detail__value">{name(cur)}</span>
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
    </div>
  );
}

function Dashboard() {
  const { language, liveError, selectedTrainId } = useMetroStore();
  const t = dictionaries[language];

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
          <div
            className={`mq-bottom-sheet${selectedTrainId ? ' mq-bottom-sheet--open' : ''}`}
            role="dialog"
            aria-label="Train info"
          >
            <div className="mq-bottom-sheet__handle" aria-hidden="true" />
            <div className="mq-bottom-sheet__body">
              <MobileTrainSheet />
            </div>
          </div>
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
