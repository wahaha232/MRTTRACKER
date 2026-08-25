/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_METRO_API_BASE_URL?: string;
  readonly VITE_METRO_API_KEY?: string;
  readonly VITE_METRO_UPDATE_INTERVAL?: string;
  readonly VITE_ADS_ENABLED?: string;
  readonly VITE_ADS_CLIENT?: string;
  readonly VITE_ADS_SLOT_RECT?: string;
  readonly VITE_ADS_SLOT_BANNER?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  adsbygoogle?: unknown[];
}
