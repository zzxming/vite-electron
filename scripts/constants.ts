import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const projRoot = resolve(__dirname, '../');
export const electronBuilderConfig = resolve(projRoot, 'electron-builder.json5');
export const distRoot = resolve(projRoot, 'release');
export const configRoot = resolve(projRoot, 'config');
export const execDist = resolve(projRoot, 'execute/dist-execute');
export const unpackRoot = resolve(projRoot, 'unpack');
