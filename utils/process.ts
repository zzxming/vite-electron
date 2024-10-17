import type { SpawnOptions } from 'node:child_process';
import { spawn } from 'node:child_process';
import { isString } from './types';

export const run = async (cmd: string, args: string | string[], cwd: string, options: SpawnOptions = {}, handler?: { spawn: () => void }) =>
  new Promise<void>((resolve, reject) => {
    let argsArr: string[] = args as string[];
    if (isString(args)) {
      argsArr = args.split(' ');
    }
    const app = spawn(cmd, argsArr, {
      cwd,
      stdio: 'inherit',
      shell: process.platform === 'win32',
      ...options,
    });

    const onProcessExit = () => app.kill('SIGHUP');
    process.on('exit', onProcessExit);

    app.on('spawn', () => {
      if (handler?.spawn) {
        handler.spawn();
      }
    });
    app.on('close', (code) => {
      process.removeListener('exit', onProcessExit);

      if (code === 0) {
        resolve();
      }
      else {
        const error = new Error(`Command failed. \n Command: ${cmd} ${argsArr.join(' ')} \n Code: ${code}`);
        reject(error);
      }
    });
    if (options.detached) {
      app.unref();
    }
  });
