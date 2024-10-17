import type { Version } from '../types';
import { contextBridge, ipcRenderer } from 'electron';
import { ElLoading } from 'element-plus';

export const exportIpcRenderer = {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args;
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args));
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args;
    return ipcRenderer.off(channel, ...omit);
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args;
    return ipcRenderer.send(channel, ...omit);
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args;
    return ipcRenderer.invoke(channel, ...omit);
  },
  getVersion(): Promise<Version & { version: string }> {
    return ipcRenderer.invoke('get-version');
  },
} as const;

contextBridge.exposeInMainWorld('ipcRenderer', exportIpcRenderer);

// --------- Preload scripts loading ---------
function domReady(condition: DocumentReadyState[] = ['complete', 'interactive']) {
  return new Promise((resolve) => {
    if (condition.includes(document.readyState)) {
      resolve(true);
    }
    else {
      document.addEventListener('readystatechange', () => {
        if (condition.includes(document.readyState)) {
          resolve(true);
        }
      });
    }
  });
}

let loading: { close: () => void } | null = null;
domReady().then(() => {
  loading = ElLoading.service({
    lock: true,
    text: 'Loading',
    background: 'rgba(0, 0, 0, 0.7)',
  });
});

window.addEventListener('message', (e) => {
  if (e.data.payload === 'removeLoading' && loading) {
    loading.close();
  }
});

setTimeout(() => {
  if (loading) {
    loading.close();
  }
}, 4999);
