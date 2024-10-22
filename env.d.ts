/// <reference types="vite/client" />

interface Window {
  // expose in the `electron/preload/index.ts`
  ipcRenderer: typeof import('./electron/preload/index.ts').exportIpcRenderer;
}

interface ImportMetaEnv {
  readonly VITE_SERVER_HOST: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
