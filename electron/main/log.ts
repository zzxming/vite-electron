import { appendFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { ensureFile } from 'fs-extra';
import { logPath } from './constants';

export const currentLogPath = async () => {
  const day = new Date().toLocaleDateString().replaceAll('/', '-');
  const dayLogPath = resolve(logPath, `${day}.txt`);
  await ensureFile(dayLogPath);
  return dayLogPath;
};
export const localLog = async (data: any) => {
  const dayLogPath = await currentLogPath();
  return appendFile(dayLogPath, `[${new Date().toLocaleString().replaceAll('/', '-')}]${data.toString()}\n`, { encoding: 'utf8' });
};
