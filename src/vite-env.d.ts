/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_METRO_API_BASE_URL?: string;
  readonly VITE_METRO_API_KEY?: string;
  readonly VITE_METRO_UPDATE_INTERVAL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
