import { existsSync } from 'node:fs';
import { appendFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { logPath } from './constants';

export const currentLogPath = async () => {
  const day = new Date().toLocaleDateString().replaceAll('/', '-');
  const dayLogPath = resolve(logPath, `${day}.txt`);
  if (!existsSync(dayLogPath)) {
    await writeFile(dayLogPath, ``, { encoding: 'utf8' });
  }
  return dayLogPath;
};
export const localLog = async (data: any) => {
  const dayLogPath = await currentLogPath();
  return appendFile(dayLogPath, `[${new Date().toLocaleString().replaceAll('/', '-')}]${data.toString()}\n`, { encoding: 'utf8' });
};
