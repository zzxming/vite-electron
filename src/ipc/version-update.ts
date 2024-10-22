export const getVersion = () => window.ipcRenderer.getVersion();
export const listenNewVersionDownload = (callbacks: Partial<{
  'download-progress': (e: Electron.IpcRendererEvent, info: { speed?: number; percent: number }) => void;
  'downloaded': (e: Electron.IpcRendererEvent) => Promise<void> | void;
  'update-increase': (e: Electron.IpcRendererEvent) => Promise<void> | void;
  'update-major': (e: Electron.IpcRendererEvent, immediateInstall: boolean) => Promise<boolean> | boolean;
  'error': (error: Error) => void;
}> = {}) => {
  const {
    'download-progress': downloadProgress,
    downloaded,
    'update-increase': updateIncrease,
    'update-major': updateMajor = () => true,
    'error': downloadError,
  } = callbacks;

  if (downloadProgress) {
    window.ipcRenderer.on('autoUpdater-download-progress', downloadProgress);
  }
  window.ipcRenderer.on('autoUpdater-downloaded', async (e) => {
    if (downloaded) {
      await downloaded(e);
    }
  });
  window.ipcRenderer.on('autoUpdater-update-increase', async (e) => {
    ElNotification({
      type: 'success',
      message: '程序关闭后将自动更新',
    });
    if (updateIncrease) {
      await updateIncrease(e);
    }
  });
  window.ipcRenderer.on('autoUpdater-update-major', async (e) => {
    // eslint-disable-next-line no-alert
    let res = confirm('新版本已下载，是否立即安装？');
    res = await updateMajor(e, res);
    if (res) {
      window.ipcRenderer.invoke('install');
    }
  });
  window.ipcRenderer.on('autoUpdater-error', (_, error: Error) => {
    if (downloadError) {
      downloadError(error);
    }
  });
};
