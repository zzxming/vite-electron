#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import consola from 'consola';
import yaml from 'js-yaml';
import { rimraf } from 'rimraf';
import { copyDir, getPackageManifest } from 'utils';
import { configRoot, distRoot, electronBuilderConfig, execDist, projRoot, unpackRoot } from './constants';
import { lintFiles } from './lint';
import { run } from './utils';

interface PlatFormConfig {
  unpackPath: string;
  buildCmd: string;
};
const buildPlatform = async (platform: string) => {
  const platformMap: Record<string, PlatFormConfig> = {
    win: {
      unpackPath: resolve(execDist, 'windows'),
      buildCmd: '--win --x64',
    },
    mac: {
      unpackPath: resolve(execDist, 'mac'),
      buildCmd: '--mac --x64',
    },
    linux: {
      unpackPath: resolve(execDist, 'linux'),
      buildCmd: '--linux --x64',
    },
  };
  const config = platformMap[platform];

  // copy unpack files to unpack dir
  consola.start(`start to build on ${platform}...`);
  if (!existsSync(unpackRoot)) {
    await mkdir(unpackRoot);
  }
  await copyDir(config.unpackPath, unpackRoot);
  // build electron package
  await run(`electron-builder`, config.buildCmd);
  consola.success(`electron ${platform} package built!`);
};

const main = async () => {
  const platforms = process.argv.slice(2);
  if (platforms.length === 0) {
    platforms.push('win');
  }
  const releaseLogPath = resolve(configRoot, 'release.log.json');
  if (!existsSync(releaseLogPath)) {
    throw new Error('release log not found! please create a release log file first!');
  }
  await run(`pnpm`, `build:exec`);
  // add release info in builder config
  consola.start('start to write release infomation...');
  const releaseLog = await readFile(releaseLogPath, { encoding: 'utf8' });
  const { logs, name } = JSON.parse(releaseLog);
  const date = new Date().toISOString();
  const releaseInfo = {
    releaseNotes: logs.join('\n'),
    releaseName: `${name} (${new Date(date).toLocaleString()})`,
  };
  await writeFile(releaseLogPath, JSON.stringify({ name, date, logs }, undefined, 2));
  const buildConfigStr = await readFile(electronBuilderConfig, { encoding: 'utf8' });
  const buildConfig = JSON.parse(buildConfigStr);
  buildConfig.win.releaseInfo = releaseInfo;
  buildConfig.mac.releaseInfo = releaseInfo;
  buildConfig.linux.releaseInfo = releaseInfo;
  await writeFile(electronBuilderConfig, JSON.stringify(buildConfig, undefined, 2));
  consola.success('release infomation added to builder config file!');
  // update release info in package.json
  const pkgInfo = getPackageManifest(projRoot);
  pkgInfo.releaseName = releaseInfo.releaseName;
  pkgInfo.releaseDate = date;
  pkgInfo.releaseLogs = logs;
  const rootPkg = resolve(projRoot, 'package.json');
  await writeFile(rootPkg, JSON.stringify(pkgInfo, undefined, 2), { encoding: 'utf8' });
  await lintFiles(rootPkg);
  consola.success('release infomation added to package.json!');

  // clean dirs
  consola.start('clean dist dirs...');
  await rimraf(resolve(distRoot, pkgInfo.version));
  await rimraf(unpackRoot);
  consola.success('dist dirs cleaned!');

  // build main dist
  consola.start('start to main dist...');
  await run(`pnpm`, `build:vite`);

  for (const platform of platforms) {
    await buildPlatform(platform);
  }

  // update latest info in latest.yml
  consola.start('start to update latest info...');
  const latestYmlPath = resolve(distRoot, pkgInfo.version, 'latest.yml');
  const latestConfig = yaml.load(await readFile(latestYmlPath, { encoding: 'utf8' })) as Record<string, any>;
  latestConfig.path = `http://localhost:3000/electron-app/${latestConfig.path}`;
  latestConfig.releaseDate = date;
  await writeFile(latestYmlPath, yaml.dump(latestConfig), { encoding: 'utf8' });
  consola.success('build success!');
};

main().catch((error) => {
  consola.error(error);
  process.exit(1);
});
