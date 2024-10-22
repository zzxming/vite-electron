import type { BrowserWindow } from 'electron';
import type { Version } from '../types';
import { existsSync, openSync } from 'node:fs';
import { dirname } from 'node:path';
import { app } from 'electron';
import { autoUpdater } from 'electron-updater';
import { isString, run } from 'utils';
import { asarTempPath, devUpdateLatestYml, getReplaceAsarExc, isDev, serverHost, unpackPath } from './constants';
import { currentLogPath, localLog } from './log';
import { checkPatchVersion, downloadPatchVersion } from './version';

let updateVersionInfo: Version;
let isNewVersion = false;
const replaceOldAsar = async () => {
  if (isNewVersion && existsSync(asarTempPath)) {
    const logPath = await currentLogPath();
    const logFile = openSync(logPath, 'a');
    const excePath = getReplaceAsarExc();
    await run(excePath, [`"${logPath}"`, `"${dirname(asarTempPath)}"`], unpackPath, {
      detached: true,
      stdio: ['ignore', logFile, logFile],
      shell: false,
      windowsHide: true,
    });
  }
};

export const checkUpdate = (mainWin: BrowserWindow) => {
  try {
    if (isDev && !existsSync(devUpdateLatestYml)) return;
    if (isDev && !app.isPackaged) {
      Object.defineProperty(app, 'isPackaged', {
        get: () => true,
      });
      autoUpdater.updateConfigPath = devUpdateLatestYml;
    }
    autoUpdater.requestHeaders = {
      elearch: process.arch,
    };
    autoUpdater.setFeedURL(`${serverHost}/updater/electron-app`);
    autoUpdater.fullChangelog = true;
    // auto download new version package
    autoUpdater.autoDownload = true;
    // after app quit, auto install
    autoUpdater.autoInstallOnAppQuit = true;

    // update new patch version
    app.on('quit', replaceOldAsar);
    // send a windows notify message if has new version package
    autoUpdater.checkForUpdatesAndNotify().catch();
    autoUpdater.on('error', (error) => {
      localLog(`autoUpdater error: ${error.message}\n${error.stack}`);
    });
    autoUpdater.on('update-available', (info) => {
      mainWin.webContents.send('update-available', info);
    });
    autoUpdater.on('update-not-available', async (info) => {
      mainWin.webContents.send('update-not-available', info);
      updateVersionInfo = {
        name: info.releaseName || '',
        logs: isString(info.releaseNotes) ? info.releaseNotes.split('\n') : [],
        date: info.releaseDate,
      };
      isNewVersion = await checkPatchVersion(updateVersionInfo);
      if (isNewVersion) {
        // increase update
        await downloadPatchVersion(info).catch((error) => {
          localLog(`download patch version error: ${error.message}\n${error.stack}`);
        });
      }
    });
    autoUpdater.on('download-progress', (prog) => {
      mainWin.webContents.send('download-progress', {
        speed: Math.ceil(prog.bytesPerSecond / 1000),
        percent: Math.ceil(prog.percent),
      });
    });
    autoUpdater.on('update-downloaded', (info: any) => {
      console.log('update-downloaded', info);
      mainWin.webContents.send('update-downloaded');
      // immediate install after download
      // autoUpdater.quitAndInstall();
    });
  }
  catch {}
};
