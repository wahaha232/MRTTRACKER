// ---------------------------------------------------------------------------
// METRO QUEST — Pixel Metro World Map（提示詞六 / 七 / 十 / 十一 / 十七 / 二十五）
// SVG 路網 + Pixel Train 平滑動畫（requestAnimationFrame）+ 縮放 / 平移。
// 效能：列車位置集中於 ref 更新，不為每台列車建立 React state。
// ---------------------------------------------------------------------------
import { useEffect, useMemo, useRef, useState, type WheelEvent as ReactWheelEvent } from 'react';
import { useMetroStore } from '../store/MetroStore';
import { dictionaries } from '../i18n/translations';
import { STATIONS, getStation } from '../data/stations';
import { ROUTES } from '../data/routes';
import { ALL_ROUTE_PATHS, isTerminalFor } from '../utils/routeGeometry';
import { interpolatedProgress, progressForTrain, calculateTrainPosition } from '../utils/calculateTrainPosition';
import { TrainMarker, HEADING_ROTATION } from './TrainMarker';
import { StationPopup } from './StationPopup';
import type { Train, TrainPosition } from '../types';

const WORLD_W = 1080;
const WORLD_H = 850;

interface ViewState {
  x: number;
  y: number;
  k: number;
}

function clampK(k: number): number {
  return Math.min(4.5, Math.max(0.35, k));
}

function applyTransform(g: SVGGElement | null, view: ViewState): void {
  if (!g) return;
  g.setAttribute('transform', `translate(${view.x.toFixed(2)} ${view.y.toFixed(2)}) scale(${view.k.toFixed(4)})`);
}

/** 將世界座標轉為容器像素座標 */
function worldToScreen(p: { x: number; y: number }, view: ViewState) {
  return { x: p.x * view.k + view.x, y: p.y * view.k + view.y };
}

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false,
  );
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
}

// ---------------------------------------------------------------------------
// Pixel Environment（提示詞二十三：深藍天空 / pixel clouds / mountains /
// trees / islands / water / buildings）—— 純裝飾，位於路線圖後方。
// ---------------------------------------------------------------------------
function PixelBackground() {
  return (
    <g aria-hidden="true">
      {/* SMB3 世界地圖天空：米黃/日間色調 */}
      <rect x="0" y="0" width={WORLD_W} height={WORLD_H} fill="#e9cd9c" />
      {/* 雲朵 */}
      <rect x="80" y="90" width="60" height="10" fill="#fff8ea" opacity="0.9" />
      <rect x="92" y="82" width="34" height="8" fill="#fff8ea" opacity="0.9" />
      <rect x="780" y="110" width="70" height="10" fill="#fff8ea" opacity="0.75" />
      <rect x="795" y="100" width="40" height="10" fill="#fff8ea" opacity="0.75" />
      <rect x="360" y="70" width="50" height="8" fill="#fff8ea" opacity="0.6" />
      {/* 遠山：暖棕色丘陵 */}
      {[
        [0, 470, 30], [30, 450, 34], [60, 480, 26], [90, 455, 30],
        [960, 480, 30], [990, 455, 34], [1020, 470, 26], [1050, 450, 30],
      ].map(([mx, my, mh], i) => (
        <polygon key={`mt-${i}`} points={`${mx},${my + (mh as number) * 2} ${mx + (mh as number) / 2},${my} ${mx + (mh as number)},${my + (mh as number) * 2}`} fill="#c9955c" stroke="#96683a" strokeWidth="1" />
      ))}
      {/* 水：晴天藍 */}
      <rect x="0" y="790" width="230" height="60" fill="#5aa9e6" stroke="#2f6db3" strokeWidth="1" />
      <rect x="60" y="798" width="14" height="4" fill="#8ccbf5" />
      <rect x="110" y="812" width="14" height="4" fill="#8ccbf5" />
      <rect x="170" y="800" width="10" height="3" fill="#8ccbf5" />
      <rect x="240" y="805" width="16" height="4" fill="#5aa9e6" />
      <rect x="290" y="818" width="16" height="4" fill="#8ccbf5" />
      <rect x="980" y="770" width="100" height="80" fill="#5aa9e6" stroke="#2f6db3" strokeWidth="1" />
      <rect x="1000" y="790" width="12" height="4" fill="#8ccbf5" />
      <rect x="1040" y="805" width="12" height="4" fill="#8ccbf5" />
      {/* 樹木 */}
      {[
        [30, 690], [70, 705], [115, 690], [160, 720], [1000, 700], [1030, 720],
        [1060, 690], [180, 660], [55, 760], [95, 775], [1005, 745],
      ].map(([tx, ty], i) => (
        <g key={`tree-${i}`}>
          <rect x={tx} y={ty} width="6" height="8" fill="#1c3a1f" />
          <rect x={tx - 5} y={ty - 8} width="16" height="10" fill="#2f6b33" />
        </g>
      ))}
      {/* SMB3 世界地圖灌木叢（像素半圓，純裝飾） */}
      {[
        [48, 630], [132, 668], [206, 640], [330, 668], [256, 772],
        [720, 782], [862, 666], [1014, 636], [478, 700],
      ].map(([bx, by], i) => (
        <g key={`bush-${i}`}>
          <rect x={bx + 4} y={by - 4} width="6" height="4" fill="#3f8a3f" />
          <rect x={bx} y={by} width="14" height="4" fill="#2f6b33" />
          <rect x={bx + 2} y={by - 2} width="4" height="2" fill="#7ec850" />
          <rect x={bx + 8} y={by - 2} width="4" height="2" fill="#7ec850" />
        </g>
      ))}
      {/* SMB3 山坡（遠景三角綠色丘陵） */}
      {[
        [10, 820, 40], [250, 835, 55], [600, 825, 30], [880, 838, 60],
      ].map(([hx, hy, hs], i) => (
        <polygon
          key={`hill-${i}`}
          points={`${hx},${hy + (hs as number)} ${hx + (hs as number) / 2},${hy} ${hx + (hs as number)},${hy + (hs as number)}`}
          fill="#1e5a2e"
          opacity="0.5"
        />
      ))}
      {/* 遠景石塔群（日間石磚色，取代原本的夜間發光高樓） */}
      {[
        [20, 620], [34, 606], [50, 630], [70, 612], [86, 632],
        [930, 610], [948, 596], [964, 620], [982, 604], [998, 628],
      ].map(([bx, by], i) => (
        <rect key={`bld-${i}`} x={bx} y={by} width="10" height={770 - (by as number)} fill="#8a6d4a" stroke="#5c4527" strokeWidth="1" />
      ))}
      {[30, 44, 60, 74, 88].map((ox, i) => (
        <rect key={`win-${i}`} x={ox} y="630" width="3" height="3" fill="#fbf2df" opacity="0.55" />
      ))}
      {[940, 956, 972, 988, 1004].map((ox, i) => (
        <rect key={`win2-${i}`} x={ox} y="612" width="3" height="3" fill="#fbf2df" opacity="0.55" />
      ))}
    </g>
  );
}

// ---------------------------------------------------------------------------
// useTrainPositions：rAF 平滑插值（提示詞三十二）
// 每影格更新 ref；約 12fps 觸發一次 React 重繪。
// ---------------------------------------------------------------------------
function useTrainPositions(
  trains: Train[],
  reduced: boolean,
): { positions: Map<string, TrainPosition>; tick: number } {
  const [tick, setTick] = useState(0);
  const positionsRef = useRef<Map<string, TrainPosition>>(new Map());

  useEffect(() => {
    if (reduced) {
      const map = new Map<string, TrainPosition>();
      for (const tr of trains) {
        map.set(tr.id, calculateTrainPosition(tr, progressForTrain(tr)));
      }
      positionsRef.current = map;
      setTick((t) => t + 1);
      return;
    }
    let raf = 0;
    let last = 0;
    let lastFrameMs = 0;
    const loop = (nowMs: number) => {
      const now = Date.now();
      // requestAnimationFrame 每幀回傳真實時間戳（nowMs），量測「實際 frame
      // 間隔」取代寫死的 16（60fps 假設）。高更新率螢幕、分頁背景、低效
      // 裝置的幀間隔都不同，用實測值讓插值更貼近真實時間。
      const frameDt = lastFrameMs ? nowMs - lastFrameMs : 16;
      lastFrameMs = nowMs;
      const map = new Map<string, TrainPosition>();
      for (const tr of trains) {
        map.set(tr.id, calculateTrainPosition(tr, interpolatedProgress(tr, now, frameDt)));
      }
      positionsRef.current = map;
      if (nowMs - last > 80) {
        last = nowMs;
        setTick((t) => t + 1);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [trains, reduced]);

  return { positions: positionsRef.current, tick };
}

// ---------------------------------------------------------------------------
// MetroMap 主元件
// ---------------------------------------------------------------------------
export function MetroMap() {
  const {
    language,
    trains,
    selectedRouteId,
    selectedTrainId,
    selectedStationId,
    selectTrain,
    selectStation,
    closeSelection,
  } = useMetroStore();
  const t = dictionaries[language];
  const reduced = useReducedMotion();

  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const [view, setView] = useState<ViewState>({ x: 0, y: 0, k: 1 });
  const viewRef = useRef<ViewState>({ x: 0, y: 0, k: 1 });
  const targetRef = useRef<ViewState>({ x: 0, y: 0, k: 1 });
  const trainsRef = useRef<Train[]>(trains);
  trainsRef.current = trains;

  const draggingRef = useRef(false);
  const dragStartRef = useRef<{ px: number; py: number; vx: number; vy: number } | null>(null);
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchRef = useRef<{
    dist: number;
    midX: number;
    midY: number;
    k: number;
    x: number;
    y: number;
  } | null>(null);

  const { positions } = useTrainPositions(trains, reduced);

  // ---- 初始 fit 與 resize ----
  useEffect(() => {
    const fit = () => {
      const rect = wrapRef.current?.getBoundingClientRect();
      if (!rect || rect.width === 0 || rect.height === 0) return;
      const k = clampK(Math.min(rect.width / WORLD_W, rect.height / WORLD_H) * 0.96);
      const v: ViewState = {
        x: (rect.width - WORLD_W * k) / 2,
        y: (rect.height - WORLD_H * k) / 2,
        k,
      };
      viewRef.current = v;
      targetRef.current = v;
      applyTransform(gRef.current, v);
      setView(v);
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [reduced]);

  // ---- 主 rAF 迴圈：平滑位移 + 套用 transform ----
  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    let last = 0;
    const loop = (nowMs: number) => {
      const cur = viewRef.current;
      const tgt = targetRef.current;
      cur.x += (tgt.x - cur.x) * 0.12;
      cur.y += (tgt.y - cur.y) * 0.12;
      cur.k += (tgt.k - cur.k) * 0.12;
      if (Math.abs(tgt.x - cur.x) < 0.05) cur.x = tgt.x;
      if (Math.abs(tgt.y - cur.y) < 0.05) cur.y = tgt.y;
      if (Math.abs(tgt.k - cur.k) < 0.0004) cur.k = tgt.k;
      applyTransform(gRef.current, cur);
      if (nowMs - last > 80) {
        last = nowMs;
        setView({ ...cur });
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  // ---- 選擇列車時自動 pan 到該列車（提示詞十七） ----
  useEffect(() => {
    if (!selectedTrainId) return;
    const tr = trainsRef.current.find((x) => x.id === selectedTrainId);
    if (!tr) return;
    const pos = positions.get(tr.id) ?? calculateTrainPosition(tr, progressForTrain(tr));
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const k = Math.max(viewRef.current.k, 1.25);
    const v = { ...viewRef.current };
    targetRef.current = {
      x: rect.width / 2 - pos.x * k,
      y: rect.height / 2 - pos.y * k,
      k,
    };
    if (reduced) {
      viewRef.current = { ...targetRef.current };
      applyTransform(gRef.current, viewRef.current);
      setView({ ...viewRef.current });
    }
    void v;
  }, [selectedTrainId, positions, reduced]);

  // ---- 縮放 ----
  const zoomBy = (factor: number, anchor?: { x: number; y: number }) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    const v = viewRef.current;
    const nk = clampK(v.k * factor);
    if (!anchor || !rect) {
      const cx = (rect?.width ?? 0) / 2;
      const cy = (rect?.height ?? 0) / 2;
      const wx = (cx - v.x) / v.k;
      const wy = (cy - v.y) / v.k;
      const nv = { x: cx - wx * nk, y: cy - wy * nk, k: nk };
      viewRef.current = nv;
      targetRef.current = nv;
      setView(nv);
      return;
    }
    const wx = (anchor.x - v.x) / v.k;
    const wy = (anchor.y - v.y) / v.k;
    const nv = { x: anchor.x - wx * nk, y: anchor.y - wy * nk, k: nk };
    viewRef.current = nv;
    targetRef.current = nv;
    setView(nv);
  };

  /** 重設視角：重新 fit 整個世界地圖 */
  const resetView = () => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return;
    const k = clampK(Math.min(rect.width / WORLD_W, rect.height / WORLD_H) * 0.96);
    const nv: ViewState = {
      x: (rect.width - WORLD_W * k) / 2,
      y: (rect.height - WORLD_H * k) / 2,
      k,
    };
    viewRef.current = nv;
    targetRef.current = nv;
    applyTransform(gRef.current, nv);
    setView(nv);
  };


  const handleWheel = (e: ReactWheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    zoomBy(e.deltaY < 0 ? 1.15 : 0.87, { x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  // ---- 平移（滑鼠 / 觸控 / 兩指縮放） ----
  const localPoint = (e: PointerEvent) => {
    const rect = svgRef.current?.getBoundingClientRect();
    return { x: e.clientX - (rect?.left ?? 0), y: e.clientY - (rect?.top ?? 0) };
  };

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    const pt = localPoint(e.nativeEvent);
    pointersRef.current.set(e.pointerId, pt);
    if (pointersRef.current.size === 1) {
      draggingRef.current = true;
      dragStartRef.current = { px: pt.x, py: pt.y, vx: viewRef.current.x, vy: viewRef.current.y };
      e.currentTarget.setPointerCapture(e.pointerId);
    } else if (pointersRef.current.size === 2) {
      draggingRef.current = false;
      const [p1, p2] = [...pointersRef.current.values()];
      pinchRef.current = {
        dist: Math.hypot(p2.x - p1.x, p2.y - p1.y),
        midX: (p1.x + p2.x) / 2,
        midY: (p1.y + p2.y) / 2,
        k: viewRef.current.k,
        x: viewRef.current.x,
        y: viewRef.current.y,
      };
    }
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const pt = localPoint(e.nativeEvent);
    pointersRef.current.set(e.pointerId, pt);
    const pointers = [...pointersRef.current.values()];

    if (pointers.length === 2 && pinchRef.current) {
      const p1 = pointers[0];
      const p2 = pointers[1];
      const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;
      const pin = pinchRef.current;
      const nk = clampK((pin.k * dist) / pin.dist);
      const wx = (pin.midX - pin.x) / pin.k;
      const wy = (pin.midY - pin.y) / pin.k;
      const nv = { x: midX - wx * nk, y: midY - wy * nk, k: nk };
      viewRef.current = nv;
      targetRef.current = nv;
      setView(nv);
      return;
    }

    if (draggingRef.current && dragStartRef.current) {
      const ds = dragStartRef.current;
      const nv = {
        x: ds.vx + (pt.x - ds.px),
        y: ds.vy + (pt.y - ds.py),
        k: viewRef.current.k,
      };
      viewRef.current = nv;
      targetRef.current = nv;
      setView(nv);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    pointersRef.current.delete(e.pointerId);
    if (pointersRef.current.size === 0) {
      draggingRef.current = false;
      dragStartRef.current = null;
      pinchRef.current = null;
    }
  };

  // ---- 渲染資料整理 ----
  const selectedStation = selectedStationId ? getStation(selectedStationId) : null;
  const selectedRoute = selectedRouteId ? ROUTES.find((r) => r.id === selectedRouteId) : null;
  const stationAnchor = selectedStation
    ? worldToScreen({ x: selectedStation.x, y: selectedStation.y }, view)
    : null;

  return (
    <div className="mq-map-wrap" ref={wrapRef}>
      <svg
        ref={svgRef}
        className={`mq-map${draggingRef.current ? ' dragging' : ''}`}
        viewBox={`0 0 ${WORLD_W} ${WORLD_H}`}
        preserveAspectRatio="xMidYMid slice"
        role="application"
        aria-label="Taipei Metro pixel world map"
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onClick={() => {
          if (selectedTrainId || selectedStationId) closeSelection();
        }}
      >
        <g ref={gRef}>
          <PixelBackground />

          {/* 路線（提示詞八：pixel border / glow / shadow） */}
          {ALL_ROUTE_PATHS.map((rp) => {
            const route = ROUTES.find((r) => r.id === rp.routeId);
            if (!route) return null;
            const dimmed = selectedRouteId !== null && selectedRouteId !== route.id;
            const isSel = selectedRouteId === route.id;
            return (
              <g
                key={rp.routeId}
                className={`mq-route${dimmed ? ' mq-route--dimmed' : ''}${
                  isSel ? ' mq-route--selected' : ''
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <path className="mq-route-path mq-route-shadow" d={rp.d} />
                <path className="mq-route-path mq-route-core" d={rp.d} stroke={route.color} />
                <path className="mq-route-path mq-route-bricks--glow" d={rp.d} stroke={route.color} />
                <path className="mq-route-path mq-route-bricks" d={rp.d} stroke={route.color} />
              </g>
            );
          })}

          {/* 車站（提示詞九：普通站 / 轉乘站 / 終點站） */}
          {STATIONS.map((station) => {
            const onSelectedRoute =
              selectedRouteId === null || station.routeIds.includes(selectedRouteId);
            const route = ROUTES.find((r) => r.id === station.routeIds[0]);
            const isTransfer = station.routeIds.length > 1;
            const terminal = station.terminal === true;
            const dimmed = selectedRouteId !== null && !onSelectedRoute;
            const dx = station.x - WORLD_W / 2;
            const anchorEnd = dx >= 0 ? 'start' : 'end';
            const labelX = station.x + (dx >= 0 ? 12 : -12);
            const labelY = station.y - 10;
            return (
              <g
                key={station.id}
                className="mq-station"
                role="button"
                tabIndex={0}
                aria-label={`${language === 'zh' ? station.nameZh : station.nameEn} station`}
                opacity={dimmed ? 0.35 : 1}
                onClick={(e) => {
                  e.stopPropagation();
                  selectStation(station.id);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    selectStation(station.id);
                  }
                }}
              >
                {terminal ? (
                  <g transform={`translate(${station.x} ${station.y})`}>
                    {/* SMB3 終點：城堡 + 旗 */}
                    <rect x="-9" y="-2" width="18" height="8" fill="#d8cbb0" stroke="#0a0e26" strokeWidth="1.5" />
                    <rect x="-5" y="-5" width="10" height="4" fill="#d8cbb0" stroke="#0a0e26" strokeWidth="1.5" />
                    {/* 城垛 */}
                    <rect x="-7" y="-2" width="2" height="2" fill="#d8cbb0" stroke="#0a0e26" strokeWidth="1" />
                    <rect x="5" y="-2" width="2" height="2" fill="#d8cbb0" stroke="#0a0e26" strokeWidth="1" />
                    {/* 城門 */}
                    <rect x="-2" y="1" width="4" height="5" fill="#160d00" />
                    {/* 旗 */}
                    <rect className="mq-flag-pole" x="-1" y="-11" width="1.5" height="9" fill="#cfd6f0" stroke="#0a0e26" strokeWidth="0.6" />
                    <path
                      className="mq-flag"
                      d="M -1 -11 L -8 -9 L -1 -7 Z"
                      fill={route?.color ?? '#e3002c'}
                      stroke="#0a0e26"
                      strokeWidth="0.8"
                      strokeLinejoin="round"
                    />
                  </g>
                ) : isTransfer ? (
                  <g transform={`translate(${station.x} ${station.y})`}>
                    {/* SMB3 轉乘：大型紅磚塊 */}
                    <rect className="mq-station__marker mq-station__marker--transfer" x="-8" y="-8" width="16" height="16" />
                    <line x1="-8" y1="-2.6" x2="8" y2="-2.6" stroke="#160d00" strokeWidth="1.4" />
                    <line x1="-8" y1="2.6" x2="8" y2="2.6" stroke="#160d00" strokeWidth="1.4" />
                    <line x1="-2.6" y1="-8" x2="-2.6" y2="-2.6" stroke="#160d00" strokeWidth="1.4" />
                    <line x1="2.6" y1="2.6" x2="2.6" y2="8" stroke="#160d00" strokeWidth="1.4" />
                  </g>
                ) : (
                  <g transform={`translate(${station.x} ${station.y})`}>
                    {/* 普通站：金色磚塊 + 中央凸起裝飾（通用圖案，非特定商標符號） */}
                    <rect className="mq-station__marker mq-station__marker--block" x="-6" y="-6" width="12" height="12" />
                    <rect x="-2" y="-2" width="4" height="4" fill="#fff3c4" opacity="0.9" />
                  </g>
                )}
                <text className="mq-station__label" x={labelX} y={labelY} textAnchor={anchorEnd}>
                  {language === 'zh' ? station.nameZh : station.nameEn}
                </text>
                <text className="mq-station__label--en" x={labelX} y={labelY + 11} textAnchor={anchorEnd}>
                  {language === 'zh' ? station.code : station.nameEn}
                </text>
              </g>
            );
          })}

          {/* 列車（提示詞十一：平滑移動 / 十七：選取列車閃爍） */}
          {trains.map((train) => {
            const pos = positions.get(train.id) ?? calculateTrainPosition(train, progressForTrain(train));
            const route = ROUTES.find((r) => r.id === train.routeId);
            const dimmed = selectedRouteId !== null && selectedRouteId !== train.routeId;
            const isSel = selectedTrainId === train.id;
            return (
              <g
                key={train.id}
                transform={`translate(${pos.x.toFixed(2)} ${pos.y.toFixed(2)}) rotate(${
                  HEADING_ROTATION[pos.heading] ?? 0
                })`}
                opacity={dimmed ? 0.5 : 1}
                pointerEvents="auto"
              >
                {isSel ? (
                  <rect x="-28" y="-18" width="56" height="36" fill="none" stroke="#4ef6ff" strokeWidth="2" opacity="0.9" />
                ) : null}
                <TrainMarker
                  color={route?.color ?? '#888'}
                  selected={isSel}
                  delayed={train.status === 'delay'}
                  trainId={train.id}
                  onClick={() => selectTrain(train.id)}
                />
              </g>
            );
          })}
        </g>
      </svg>

      {/* 縮放工具列 */}
      <div className="mq-map__toolbar">
        <button type="button" className="mq-map__zoom-btn" onClick={() => zoomBy(1.25)} aria-label="Zoom in">
          +
        </button>
        <button type="button" className="mq-map__zoom-btn" onClick={() => zoomBy(0.8)} aria-label="Zoom out">
          −
        </button>
        <button type="button" className="mq-map__zoom-btn" onClick={resetView} aria-label="Reset zoom">
          ⌂
        </button>
      </div>

      {/* 世界標題 */}
      <div className="mq-map__overlay">
        <div style={{ position: 'absolute', top: 10, left: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span
            className="pixel-tag"
            style={{ background: selectedRoute?.color ?? '#2d3a7d', color: '#0a0e26', borderColor: '#0a0e26' }}
          >
            {selectedRoute
              ? `${t.world} ${String(selectedRoute.worldId).padStart(2, '0')} · ${
                  language === 'zh' ? selectedRoute.nameZh : selectedRoute.nameEn
                }`
              : 'METRO WORLD'}
          </span>
          <span className="pixel-tag" style={{ background: 'rgba(16,26,69,0.9)', color: 'var(--mq-text-dim)', borderColor: '#0a0e26' }}>
            {t.selectStationHint}
          </span>
        </div>
      </div>

      <div className="mq-map__hint">DRAG / WHEEL · PINCH ZOOM</div>

      {/* 車站彈窗 */}
      {selectedStation && stationAnchor ? (
        <StationPopup
          stationId={selectedStation.id}
          anchorX={stationAnchor.x}
          anchorY={stationAnchor.y}
        />
      ) : null}
    </div>
  );
}




