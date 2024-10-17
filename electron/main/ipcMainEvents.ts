import { ipcMain } from 'electron';
import { getVersion } from './version';

ipcMain.handle('get-version', () => {
  return getVersion();
});
