import { ipcMain } from 'electron';
import electronUpdater from 'electron-updater';
import { getVersion } from './version';

const { autoUpdater } = electronUpdater;

// listen install event, quit app and start install
ipcMain.handle('install', () => autoUpdater.quitAndInstall());

ipcMain.handle('get-version', () => {
  return getVersion();
});
