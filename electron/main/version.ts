import type { Version } from '../types';
import { app } from 'electron';
import { __require } from './constants';

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
