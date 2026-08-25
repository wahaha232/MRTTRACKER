// ---------------------------------------------------------------------------
// METRO QUEST — 中央 Metro Store（提示詞四十七：中央 Store + rAF 統一更新）
// 列車動畫不依賴每台列車的 React state；引擎每秒 tick 一次，
// MetroMap 用 rAF 對位置做平滑插值。
// ---------------------------------------------------------------------------
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Language, Mode, SystemStatus, Train } from '../types';
import { generateMockTrains, tickDemoTrains } from '../services/mockMetroApi';
import { fetchLiveTrains, isLiveConfigured, getLiveConfig } from '../services/metroApi';
import { adaptApiTrains } from '../services/dataAdapter';
import { playAlert, playArrival } from '../utils/sound';

interface MetroStoreValue {
  mode: Mode;
  language: Language;
  soundOn: boolean;
  trains: Train[];
  systemStatus: SystemStatus;
  lastUpdatedAt: number | null;
  nextUpdateIn: number;
  selectedRouteId: string | null;
  selectedTrainId: string | null;
  selectedStationId: string | null;
  liveError: boolean;
  liveConfigured: boolean;
  trainCount: number;
  delayCount: number;
  setMode: (m: Mode) => void;
  toggleSound: () => void;
  setLanguage: (l: Language) => void;
  selectRoute: (id: string | null) => void;
  selectTrain: (id: string | null) => void;
  selectStation: (id: string | null) => void;
  closeSelection: () => void;
}

const MetroStoreContext = createContext<MetroStoreValue | null>(null);

export function MetroStoreProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<Mode>('demo');
  const [language, setLanguageState] = useState<Language>('zh');
  const [soundOn, setSoundOn] = useState(false);
  const [trains, setTrains] = useState<Train[]>(() => generateMockTrains());
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(Date.now());
  const [nextUpdateIn, setNextUpdateIn] = useState<number>(1);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [selectedTrainId, setSelectedTrainId] = useState<string | null>(null);
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const [liveError, setLiveError] = useState(false);

  const trainsRef = useRef<Train[]>(trains);
  trainsRef.current = trains;

  const prevStatus = useRef<Map<string, string>>(new Map());
  const prevNext = useRef<Map<string, string>>(new Map());

  const liveConfigured = useMemo(() => isLiveConfigured(), []);
  const updateInterval = getLiveConfig().updateInterval;

  const systemStatus: SystemStatus = useMemo(() => {
    const total = trains.length;
    const delayed = trains.filter((t) => t.status === 'delay').length;
    if (total === 0) return 'normal';
    const ratio = delayed / total;
    if (ratio >= 0.2) return 'alert';
    if (delayed > 0) return 'delay';
    return 'normal';
  }, [trains]);

  const trainCount = trains.length;
  const delayCount = trains.filter((t) => t.status === 'delay').length;

  /** 套用 tick 後的列車並觸發音效 */
  const applyTrains = useCallback(
    (next: Train[], now: number) => {
      setTrains(next);
      setLastUpdatedAt(now);
      for (const t of next) {
        if (t.status === 'delay' && prevStatus.current.get(t.id) !== 'delay') {
          if (soundOn) playAlert();
        }
        if (selectedTrainId === t.id && prevNext.current.get(t.id) !== t.nextStationId) {
          if (soundOn) playArrival();
        }
        prevStatus.current.set(t.id, t.status);
        prevNext.current.set(t.id, t.nextStationId);
      }
    },
    [soundOn, selectedTrainId],
  );

  // ---- Demo / Live 引擎主迴圈 ----
  useEffect(() => {
    if (mode === 'demo') {
      const timer = window.setInterval(() => {
        const now = Date.now();
        const next = tickDemoTrains(trainsRef.current, now);
        applyTrains(next, now);
        setNextUpdateIn(1);
      }, 1000);
      return () => window.clearInterval(timer);
    }

    // Live mode
    if (!liveConfigured) {
      setLiveError(true);
      setModeState('demo');
      return;
    }

    let cancelled = false;
    const load = async () => {
      try {
        const raw = await fetchLiveTrains();
        if (cancelled) return;
        const adapted = adaptApiTrains(raw);
        setLiveError(false);
        if (adapted.length > 0) {
          applyTrains(adapted, Date.now());
        }
      } catch {
        if (cancelled) return;
        setLiveError(true);
        // 錯誤處理：fallback 到 demo tick，不白屏
        const now = Date.now();
        const next = tickDemoTrains(trainsRef.current, now);
        applyTrains(next, now);
      }
      setNextUpdateIn(updateInterval);
    };
    void load();
    const timer = window.setInterval(() => {
      void load();
    }, Math.max(3000, updateInterval * 1000));
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [mode, liveConfigured, updateInterval, applyTrains]);

  // ---- NEXT UPDATE 倒數（live） ----
  useEffect(() => {
    if (mode !== 'live') return;
    setNextUpdateIn(updateInterval);
    const timer = window.setInterval(() => {
      setNextUpdateIn((v) => Math.max(0, v - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [mode, updateInterval]);

  const setMode = useCallback((m: Mode) => {
    setModeState(m);
    if (m === 'live' && !isLiveConfigured()) {
      setLiveError(true);
    } else if (m === 'demo') {
      setLiveError(false);
    }
  }, []);

  const toggleSound = useCallback(() => {
    setSoundOn((v) => !v);
  }, []);

  const setLanguage = useCallback((l: Language) => {
    setLanguageState(l);
  }, []);

  const selectRoute = useCallback((id: string | null) => {
    setSelectedRouteId(id);
    setSelectedTrainId(null);
  }, []);

  const selectTrain = useCallback((id: string | null) => {
    setSelectedTrainId(id);
    setSelectedStationId(null);
  }, []);

  const selectStation = useCallback((id: string | null) => {
    setSelectedStationId(id);
  }, []);

  const closeSelection = useCallback(() => {
    setSelectedStationId(null);
    setSelectedTrainId(null);
  }, []);

  const value: MetroStoreValue = {
    mode,
    language,
    soundOn,
    trains,
    systemStatus,
    lastUpdatedAt,
    nextUpdateIn,
    selectedRouteId,
    selectedTrainId,
    selectedStationId,
    liveError,
    liveConfigured,
    trainCount,
    delayCount,
    setMode,
    toggleSound,
    setLanguage,
    selectRoute,
    selectTrain,
    selectStation,
    closeSelection,
  };

  return <MetroStoreContext.Provider value={value}>{children}</MetroStoreContext.Provider>;
}

export function useMetroStore(): MetroStoreValue {
  const ctx = useContext(MetroStoreContext);
  if (!ctx) {
    throw new Error('useMetroStore must be used within MetroStoreProvider');
  }
  return ctx;
}

