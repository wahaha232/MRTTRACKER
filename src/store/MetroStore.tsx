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
import type { Language, Mode, StationArrival, SystemStatus, Train, ViewMode } from '../types';
import { generateMockTrains, tickDemoTrains } from '../services/mockMetroApi';
import { fetchLiveArrivals, isLiveConfigured, getLiveConfig } from '../services/metroApi';
import { adaptApiArrivals, adaptApiArrivalsToTrains } from '../services/dataAdapter';
import { playAlert, playArrival } from '../utils/sound';

interface MetroStoreValue {
  mode: Mode;
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
  language: Language;
  soundOn: boolean;
  trains: Train[];
  /** Live Mode 的車站到站看板資料（TDX 只提供看板，不提供列車即時位置） */
  arrivals: StationArrival[];
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
  crtOn: boolean;
  setCrtOn: (v: boolean) => void;
  /** 最近一段時間的延誤比例（0..1），每個樣本間隔約 30 秒，最多 60 筆 */
  delayHistory: number[];
  selectRoute: (id: string | null) => void;
  selectTrain: (id: string | null) => void;
  selectStation: (id: string | null) => void;
  closeSelection: () => void;
}

const MetroStoreContext = createContext<MetroStoreValue | null>(null);

/** 使用者偏好（語系 / 模式 / 音效 / CRT）持久化到 localStorage */
const SETTINGS_KEY = 'mq-settings-v1';
interface PersistedSettings {
  language?: Language;
  mode?: Mode;
  soundOn?: boolean;
  crtOn?: boolean;
  viewMode?: ViewMode;
}

function loadSettings(): PersistedSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as PersistedSettings;
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

export function MetroStoreProvider({ children }: { children: ReactNode }) {
  const saved = loadSettings();
  const [mode, setModeState] = useState<Mode>(saved.mode === 'live' ? 'live' : 'demo');
  const [viewMode, setViewMode] = useState<ViewMode>(saved.viewMode === 'strip' ? 'strip' : 'map');
  const [language, setLanguageState] = useState<Language>(saved.language === 'en' ? 'en' : 'zh');
  const [soundOn, setSoundOn] = useState(saved.soundOn === true);
  const [crtOn, setCrtOn] = useState(saved.crtOn !== false);
  const [trains, setTrains] = useState<Train[]>(() => generateMockTrains());
  const [arrivals, setArrivals] = useState<StationArrival[]>([]);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(Date.now());
  const [nextUpdateIn, setNextUpdateIn] = useState<number>(1);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [selectedTrainId, setSelectedTrainId] = useState<string | null>(null);
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const [liveError, setLiveError] = useState(false);
  const [delayHistory, setDelayHistory] = useState<number[]>([]);
  const lastHistoryRef = useRef(0);

  // 偏好變更時寫回 localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify({ language, mode, soundOn, crtOn, viewMode } satisfies PersistedSettings),
      );
    } catch {
      /* 忽略（私密模式等） */
    }
  }, [language, mode, soundOn, crtOn, viewMode]);

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
      // 延誤比例歷史取樣（每 ~30 秒一筆，保留最近 60 筆）
      if (now - lastHistoryRef.current >= 30000) {
        lastHistoryRef.current = now;
        const total = next.length;
        const delayed = next.filter((t) => t.status === 'delay').length;
        setDelayHistory((h) => [...h.slice(-59), total > 0 ? delayed / total : 0]);
      }
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
      setArrivals([]);
      const timer = window.setInterval(() => {
        const now = Date.now();
        const next = tickDemoTrains(trainsRef.current, now);
        applyTrains(next, now);
        setNextUpdateIn(1);
      }, 1000);
      return () => window.clearInterval(timer);
    }

    // Live mode：TDX 只提供車站到站看板，沒有列車即時位置。地圖上的列車圖示
    // 是從「每個方向最快進站」的看板資料反推「近似位置」，不是精確 GPS；
    // 車站彈窗顯示的到站看板才是完整、未經推算的原始資料。
    if (!liveConfigured) {
      setLiveError(true);
      setModeState('demo');
      return;
    }

    let cancelled = false;
    const load = async () => {
      try {
        const raw = await fetchLiveArrivals();
        if (cancelled) return;
        const adapted = adaptApiArrivals(raw);
        const approxTrains = adaptApiArrivalsToTrains(raw);
        setLiveError(false);
        setArrivals(adapted);
        applyTrains(approxTrains, Date.now());
      } catch {
        if (cancelled) return;
        setLiveError(true);
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
    viewMode,
    setViewMode,
    language,
    soundOn,
    crtOn,
    delayHistory,
    trains,
    arrivals,
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
    setCrtOn,
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

