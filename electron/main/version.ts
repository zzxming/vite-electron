import type { BrowserWindow } from 'electron';
import type { UpdateInfo } from 'electron-updater';
import type { Version } from '../types';
import { createWriteStream } from 'node:fs';
import axios from 'axios';
import { app } from 'electron';
import { ensureFile } from 'fs-extra';
import { __require, asarTempPath, pkgPath, serverHost } from './constants';

export const readVersion = async () => {
  const packageInfo = await __require(pkgPath);
  return {
    name: packageInfo.releaseName,
    logs: packageInfo.releaseLogs,
    date: packageInfo.releaseDate,
  };
};

export const checkPatchVersion = async (versionInfo: Version) => {
  const currentVersion = await readVersion();
  if (currentVersion) {
    return currentVersion.date !== versionInfo.date;
  }
  return false;
};

export const getVersion = async () => {
  const version = app.getVersion();
  const currentVersion = await readVersion();
  return {
    version,
    ...currentVersion,
  };
};

export const downloadPatchVersion = async (_versionInfo: UpdateInfo, win: BrowserWindow) => {
  const packageInfo = await __require(pkgPath);
  return new Promise<string>((resolvePromise, reject) => {
    axios.get(`${serverHost}/${packageInfo.name}/app.asar`, {
      responseType: 'stream',
      onDownloadProgress(progressEvent) {
        win.webContents.send('autoUpdater-download-progress', {
          percent: Math.round((progressEvent.loaded / (progressEvent.total as number)) * 100),
        });
      },
    }).then(async (res) => {
      await ensureFile(asarTempPath);
      const writer = createWriteStream(asarTempPath);
      res.data.pipe(writer);

      writer.on('finish', () => {
        console.log('new asar writen successfully');
        win.webContents.send('autoUpdater-downloaded');
        resolvePromise(asarTempPath);
      });

      writer.on('error', (error) => {
        console.error('error when file writing:', error);
        reject(error);
      });
    })
      .catch((error) => {
        console.error('error when request:', error);
        reject(error);
      });
  });
};
