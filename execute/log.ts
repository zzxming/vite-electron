import { appendFileSync } from 'node:fs';

export const logAppend = (logPath: string, msg: string) => {
  appendFileSync(logPath, `${msg}\n`, { encoding: 'utf8' });
};
