import { autoUpdater, ipcMain } from 'electron';
import { getVersion } from './version';

// listen install event, quit app and start install
ipcMain.handle('install', () => autoUpdater.quitAndInstall());

ipcMain.handle('get-version', () => {
  return getVersion();
});
