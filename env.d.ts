/// <reference types="vite/client" />

interface Window {
  // expose in the `electron/preload/index.ts`
  ipcRenderer: typeof import('./electron/preload/index.ts').exportIpcRenderer;
}
