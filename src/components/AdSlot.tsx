// ---------------------------------------------------------------------------
// METRO QUEST — Google AdSense 廣告位（預留）
// ---------------------------------------------------------------------------
// 預設顯示 8-bit 像素風格占位方塊（明確標示「AD · 廣告位置保留」）。
// 若想正式投放真實 AdSense 廣告，於 .env 設定：
//   VITE_ADS_ENABLED=true
//   VITE_ADS_CLIENT=ca-pub-XXXXXXXXXXXXXXXX
//   VITE_ADS_SLOT_RECT=<矩形廣告單元 slot id>    （桌面右欄）
//   VITE_ADS_SLOT_BANNER=<橫幅廣告單元 slot id>  （平板/手機底部）
// 設定後本元件會自動載入 adsbygoogle.js 並輸出 <ins class="adsbygoogle">。
// ---------------------------------------------------------------------------
import { useEffect, useRef } from 'react';
import { useMetroStore } from '../store/MetroStore';
import { dictionaries } from '../i18n/translations';

export interface AdsConfig {
  enabled: boolean;
  client: string;
  slotFor: (key: string) => string;
}

/** 從環境變數讀取 AdSense 設定 */
export function getAdsConfig(): AdsConfig {
  return {
    enabled: (import.meta.env.VITE_ADS_ENABLED as string | undefined) === 'true',
    client: (import.meta.env.VITE_ADS_CLIENT as string | undefined) ?? '',
    slotFor: (key: string) =>
      ((import.meta.env as Record<string, string | undefined>)[`VITE_ADS_SLOT_${key}`] ?? ''),
  };
}

/** 全站 adsbygoogle.js 只載入一次 */
let adsScriptPromise: Promise<void> | null = null;

/** 載入 AdSense 指令碼（全站僅載入一次） */
function loadAdsScript(client: string): Promise<void> {
  if (adsScriptPromise) return adsScriptPromise;
  adsScriptPromise = new Promise((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src^="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]',
    );
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
    script.crossOrigin = 'anonymous';
    script.onload = () => resolve();
    script.onerror = () => {
      // 載入失敗時允許下次重試，且不阻擋頁面
      adsScriptPromise = null;
      resolve();
    };
    document.head.appendChild(script);
  });
  return adsScriptPromise;
}

export type AdVariant = 'rectangle' | 'banner';

interface AdSlotProps {
  /** 廣告位識別 key，對應 .env 的 VITE_ADS_SLOT_<KEY> */
  slotKey: string;
  variant: AdVariant;
}

export function AdSlot({ slotKey, variant }: AdSlotProps) {
  const { language } = useMetroStore();
  const t = dictionaries[language];

  const cfg = getAdsConfig();
  const slotId = cfg.slotFor(slotKey);
  const live = cfg.enabled && cfg.client.trim().length > 0 && slotId.trim().length > 0;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const pushedRef = useRef(false);

  useEffect(() => {
    if (!live) return;
    let cancelled = false;

    const tryPush = () => {
      const el = containerRef.current;
      if (!el || pushedRef.current) return;
      // 隱藏狀態的廣告位不 push（例如桌面右欄矩形在平板隱藏時）
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') return;
      if (window.adsbygoogle) {
        pushedRef.current = true;
        window.adsbygoogle.push({});
      }
    };

    loadAdsScript(cfg.client).then(() => {
      if (cancelled) return;
      tryPush();
      // 延遲重試，等媒體查詢/尺寸確定後若仍可見才 push
      [500, 1500].forEach((ms) => {
        window.setTimeout(() => {
          if (!cancelled) tryPush();
        }, ms);
      });
    });

    return () => {
      cancelled = true;
    };
  }, [live, cfg.client, slotId]);

  if (live) {
    return (
      <div ref={containerRef} className={`mq-ad mq-ad--live mq-ad--${variant}`}>
        <ins
          className="adsbygoogle"
          data-ad-client={cfg.client}
          data-ad-slot={slotId}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`mq-ad mq-ad--${variant}`} role="complementary" aria-label={t.adLabel}>
      <span className="mq-ad__badge">
        <span className="mq-ad__dot" aria-hidden="true" />
        {t.adLabel}
      </span>
      <span className="mq-ad__text">{t.adReserved}</span>
      <span className="mq-ad__dim">
        {variant === 'rectangle' ? '300 × 250 RECT' : 'RESPONSIVE BANNER'}
      </span>
      <span className="mq-ad__corner mq-ad__corner--tl" aria-hidden="true" />
      <span className="mq-ad__corner mq-ad__corner--tr" aria-hidden="true" />
      <span className="mq-ad__corner mq-ad__corner--bl" aria-hidden="true" />
      <span className="mq-ad__corner mq-ad__corner--br" aria-hidden="true" />
    </div>
  );
}
