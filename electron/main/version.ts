import type { UpdateInfo } from 'electron-updater';
import type { Version } from '../types';
import { createWriteStream } from 'node:fs';
import axios from 'axios';
import { app } from 'electron';
import { ensureFile } from 'fs-extra';
import { __require, asarTempPath, serverHost } from './constants';

export const readVersion = async () => {
  const versionInfo = await __require('../../package.json');
  return {
    name: versionInfo.releaseName,
    logs: versionInfo.releaseLogs,
    date: versionInfo.releaseDate,
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

export const downloadPatchVersion = (_versionInfo: UpdateInfo) => {
  return new Promise<string>((resolvePromise, reject) => {
    axios.get(`${serverHost}/electron-app/app.asar`, {
      responseType: 'stream',
    }).then(async (res) => {
      await ensureFile(asarTempPath);
      const writer = createWriteStream(asarTempPath);
      res.data.pipe(writer);

      writer.on('finish', () => {
        console.log('new asar writen successfully');
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
