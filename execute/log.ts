import { appendFileSync } from 'node:fs';
import { ensureFileSync } from 'fs-extra';

export const logAppend = (logPath: string, msg: string) => {
  ensureFileSync(logPath);
  appendFileSync(logPath, `${msg}\n`, { encoding: 'utf8' });
};
