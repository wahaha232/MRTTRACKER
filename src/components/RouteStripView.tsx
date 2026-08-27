// ---------------------------------------------------------------------------
// METRO QUEST — 路線直線圖（單一路線拉直呈現，同時列出全部路線）
// 每條路線各自一排橫向捲動的站點條狀圖；轉乘站用色點徽章標示可轉乘路線；
// 列車位置沿用「近似位置」資料（Live Mode）或既有模擬引擎（Demo Mode），
// 只是改用一維（沿路線站序）插值，不再依賴地圖世界座標。
// ---------------------------------------------------------------------------
import { useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';
import { useMetroStore } from '../store/MetroStore';
import { dictionaries } from '../i18n/translations';
import { ROUTES, getRoute } from '../data/routes';
import { STATION_MAP, getStation } from '../data/stations';
import {
  interpolatedProgress,
  progressForTrain,
  stripProgressForTrain,
} from '../utils/calculateTrainPosition';
import { useReducedMotion } from '../utils/useReducedMotion';
import { StationPopup } from './StationPopup';
import { formatSeconds } from '../utils/time';
import type { Route, Train } from '../types';

const STATION_GAP = 64;
const TRACK_HEIGHT = 132;

interface ActiveStation {
  routeId: string;
  stationId: string;
  x: number;
  y: number;
}

/** rAF 平滑插值：沿路線站序（非世界座標）的一維列車位置 */
function useStripPositions(trains: Train[], path: string[], reduced: boolean): Map<string, number> {
  const [, setTick] = useState(0);
  const ref = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    if (reduced) {
      const map = new Map<string, number>();
      for (const tr of trains) {
        const idx = stripProgressForTrain(path, tr, progressForTrain(tr));
        if (idx !== null) map.set(tr.id, idx);
      }
      ref.current = map;
      setTick((t) => t + 1);
      return;
    }
    let raf = 0;
    let last = 0;
    let lastFrameMs = 0;
    const loop = (nowMs: number) => {
      const now = Date.now();
      const frameDt = lastFrameMs ? nowMs - lastFrameMs : 16;
      lastFrameMs = nowMs;
      const map = new Map<string, number>();
      for (const tr of trains) {
        const idx = stripProgressForTrain(path, tr, interpolatedProgress(tr, now, frameDt));
        if (idx !== null) map.set(tr.id, idx);
      }
      ref.current = map;
      if (nowMs - last > 80) {
        last = nowMs;
        setTick((t) => t + 1);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [trains, path, reduced]);

  return ref.current;
}

function RouteStripRow({
  route,
  activeStation,
  onStationClick,
}: {
  route: Route;
  activeStation: ActiveStation | null;
  onStationClick: (routeId: string, stationId: string, x: number, y: number) => void;
}) {
  const { language, trains, selectedRouteId, selectedTrainId, selectedStationId, selectRoute, selectTrain } =
    useMetroStore();
  const t = dictionaries[language];
  const reduced = useReducedMotion();
  const rowRef = useRef<HTMLDivElement>(null);

  const path = route.stations;
  const routeTrains = useMemo(() => trains.filter((tr) => tr.routeId === route.id), [trains, route.id]);
  const positions = useStripPositions(routeTrains, path, reduced);

  const dimmed = selectedRouteId !== null && selectedRouteId !== route.id;
  const trackWidth = path.length * STATION_GAP + 40;

  const handleStationClick = (e: ReactMouseEvent<HTMLButtonElement>, stationId: string) => {
    e.stopPropagation();
    const rowRect = rowRef.current?.getBoundingClientRect();
    const targetRect = e.currentTarget.getBoundingClientRect();
    if (!rowRect) return;
    onStationClick(
      route.id,
      stationId,
      targetRect.left - rowRect.left + targetRect.width / 2,
      targetRect.top - rowRect.top + targetRect.height / 2,
    );
  };

  // 也要求與 store.selectedStationId 一致：StationPopup 內建的關閉鈕會呼叫
  // store.closeSelection()，若只看 activeStation（本地 state）會在按下 X
  // 後仍殘留彈窗，因為那個關閉鈕沒有機會清掉這裡的本地 state。
  const showPopup = activeStation?.routeId === route.id && activeStation.stationId === selectedStationId;

  return (
    <div className={`mq-strip-row${dimmed ? ' mq-strip-row--dimmed' : ''}`} ref={rowRef}>
      <button
        type="button"
        className="mq-strip-row__header"
        onClick={() => selectRoute(selectedRouteId === route.id ? null : route.id)}
      >
        <span className="mq-strip-row__swatch" style={{ background: route.color }} aria-hidden="true" />
        <span className="mq-strip-row__name">{language === 'zh' ? route.nameZh : route.nameEn}</span>
        <span className="mq-status-badge mq-status-badge--normal">
          {routeTrains.length} {t.trains}
        </span>
      </button>

      <div className="mq-strip-row__scroll">
        <div className="mq-strip-row__track" style={{ width: trackWidth, height: TRACK_HEIGHT }}>
          <div className="mq-strip-row__line" style={{ background: route.color }} />

          {path.map((stationId, i) => {
            const station = STATION_MAP.get(stationId);
            if (!station) return null;
            const x = i * STATION_GAP + 20;
            const isTransfer = station.routeIds.length > 1;
            const otherRoutes = station.routeIds.filter((rid) => rid !== route.id);
            return (
              <div key={stationId} className="mq-strip-station" style={{ left: x }}>
                <button
                  type="button"
                  className={`mq-strip-station__dot${isTransfer ? ' mq-strip-station__dot--transfer' : ''}`}
                  style={isTransfer ? { borderColor: route.color } : { background: route.color }}
                  onClick={(e) => handleStationClick(e, stationId)}
                  aria-label={language === 'zh' ? station.nameZh : station.nameEn}
                />
                <span className="mq-strip-station__name">
                  {language === 'zh' ? station.nameZh : station.nameEn}
                </span>
                {isTransfer ? (
                  <span className="mq-strip-station__transfers">
                    {otherRoutes.map((rid) => {
                      const r = getRoute(rid);
                      return r ? (
                        <span
                          key={rid}
                          className="mq-strip-station__transfer-dot"
                          style={{ background: r.color }}
                          title={`${t.transferTo} ${r.shortName}`}
                        />
                      ) : null;
                    })}
                  </span>
                ) : null}
              </div>
            );
          })}

          {routeTrains.map((train) => {
            // 尚未跑過第一次 rAF（或分頁在背景被節流）時，退回同步計算，
            // 避免列車在初次渲染或分頁不可見時完全不顯示（比照 MetroMap 的作法）。
            const idx = positions.get(train.id) ?? stripProgressForTrain(path, train, progressForTrain(train));
            if (idx === null) return null;
            const x = idx * STATION_GAP + 20;
            const forward = train.direction === 1;
            const dest = train.destinationStationId ? getStation(train.destinationStationId) : null;
            const isSel = selectedTrainId === train.id;
            return (
              <button
                type="button"
                key={train.id}
                className={`mq-strip-train${forward ? ' mq-strip-train--fwd' : ' mq-strip-train--rev'}${
                  isSel ? ' mq-strip-train--selected' : ''
                }`}
                style={{ left: x }}
                onClick={(e) => {
                  e.stopPropagation();
                  selectTrain(isSel ? null : train.id);
                }}
              >
                <span className="mq-strip-train__dest">
                  {t.destinationLabel} {dest ? (language === 'zh' ? dest.nameZh : dest.nameEn) : '--'}
                </span>
                <span className="mq-strip-train__icon" style={{ background: route.color }} aria-hidden="true">
                  {forward ? '▶' : '◀'}
                </span>
                <span className="mq-strip-train__eta">{formatSeconds(train.remainingSeconds)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {showPopup ? (
        <StationPopup stationId={activeStation.stationId} anchorX={activeStation.x} anchorY={activeStation.y} />
      ) : null}
    </div>
  );
}

export function RouteStripView() {
  const { language, selectedStationId, selectStation, closeSelection } = useMetroStore();
  const t = dictionaries[language];
  const [activeStation, setActiveStation] = useState<ActiveStation | null>(null);

  const closeAll = () => {
    setActiveStation(null);
    closeSelection();
  };

  const handleStationClick = (routeId: string, stationId: string, x: number, y: number) => {
    if (activeStation?.routeId === routeId && stationId === selectedStationId) {
      closeAll();
      return;
    }
    setActiveStation({ routeId, stationId, x, y });
    selectStation(stationId);
  };

  return (
    <div className="mq-strip-wrap" onClick={closeAll}>
      <div className="mq-strip-wrap__hint">{t.legendStation}</div>
      {ROUTES.map((route) => (
        <RouteStripRow
          key={route.id}
          route={route}
          activeStation={activeStation}
          onStationClick={handleStationClick}
        />
      ))}
    </div>
  );
}
