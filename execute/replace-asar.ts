#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { rename, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { logAppend } from './log';

const logPath = process.argv[2].slice(1, -1);

const main = async () => {
  const log = logAppend.bind(undefined, logPath);

  try {
    await new Promise(res => setTimeout(res, 2000));
    log('start replace asar');

    const asarDir = process.argv[3].slice(1, -1);
    const asarPath = resolve(asarDir, 'app.asar');
    const asarTempPath = resolve(asarDir, 'app.asar-temp');
    if (!existsSync(asarTempPath)) {
      throw new Error('app.asar-temp not exists');
    }

    await rm(asarPath, { force: true });
    await rename(asarTempPath, asarPath);

    log('replace asar success');
  }
  catch (error: any) {
    log(`message: ${error.message}\n${error.stack}`);
    log('replace asar failed');
  }
};

main().finally(() => {
  process.exit(1);
});
