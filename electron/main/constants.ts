import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { app } from 'electron';

export const __require = createRequire(import.meta.url);
export const isDev = import.meta.env.DEV;
export const serverHost = import.meta.env.VITE_SERVER_HOST;

const __dirname = dirname(fileURLToPath(import.meta.url));
export const appRoot = resolve(__dirname, '../../');
export const pkgPath = resolve(appRoot, 'package.json');
export const electronDist = resolve(appRoot, 'dist-electron');
export const rendererDist = resolve(appRoot, 'dist');
export const preloadBundle = resolve(electronDist, 'preload/index.mjs');
export const indexHtml = resolve(rendererDist, 'index.html');
export const publicPath = isDev ? resolve(appRoot, 'public') : rendererDist;
// Contents/Resources for MacOS, resources for Linux and Windows
export const resourcesPath = isDev
  ? resolve(appRoot, 'resources')
  : process.platform === 'darwin'
    ? resolve(dirname(app.getPath('exe')), 'Contents/Resources')
    : resolve(dirname(app.getPath('exe')), 'resources');

export const platformDirName = {
  win32: 'windows',
  darwin: 'mac',
  linux: 'linux',
}[process.platform as 'win32' | 'linux' | 'darwin'];
export const unpackPath = isDev ? resolve(appRoot, `execute/dist-execute/${platformDirName}`) : resolve(resourcesPath, 'unpack');

export const configPath = resolve(appRoot, 'config');
export const devUpdateLatestYml = resolve(configPath, 'dev-update.yml');

export const asarTempPath = resolve(resourcesPath, `app.asar-temp`);
export const logPath = app.getPath('logs');

export const getReplaceAsarExc = () => {
  const exeName = {
    win32: 'replace-asar.exe',
    darwin: 'replace-asar',
    linux: 'replace-asar',
  };

  return exeName[process.platform as 'win32' | 'linux' | 'darwin'];
};
