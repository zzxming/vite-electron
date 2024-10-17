import { run as utilsRun } from 'utils';
import { projRoot } from './constants';

export const run = async (cmd: string, args: string | string[], cwd: string = projRoot) => utilsRun(cmd, args, cwd);
