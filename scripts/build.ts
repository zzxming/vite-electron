#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import consola from 'consola';
import dotenv from 'dotenv';
import { ensureDir, readJson, writeJson } from 'fs-extra/esm';
import yaml from 'js-yaml';
import { rimraf } from 'rimraf';
import { copyDir, getPackageManifest } from 'utils';
import { configRoot, distRoot, electronBuilderConfig, execDist, projRoot, unpackRoot } from './constants';
import { lintFiles } from './lint';
import { run } from './utils';

dotenv.config();

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
  await ensureDir(unpackRoot);
  await copyDir(config.unpackPath, unpackRoot);
  // build electron package
  await run(`electron-builder`, config.buildCmd);
  consola.success(`electron ${platform} package built!`);
};

const main = async () => {
  if (!process.env.VITE_SERVER_HOST) {
    throw new Error('please set VITE_SERVER_HOST env first!');
  }
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
  const { logs, name } = await readJson(releaseLogPath);
  const date = new Date().toISOString();
  const releaseInfo = {
    releaseNotes: logs.join('\n'),
    releaseName: `${name} (${new Date(date).toLocaleString()})`,
  };
  await writeJson(releaseLogPath, { name, date, logs }, { spaces: 2 });
  const buildConfig = await readJson(electronBuilderConfig);
  buildConfig.win.releaseInfo = releaseInfo;
  buildConfig.mac.releaseInfo = releaseInfo;
  buildConfig.linux.releaseInfo = releaseInfo;
  buildConfig.publish = [
    {
      provider: 'generic',
      url: `${process.env.VITE_SERVER_HOST}/updater`,
    },
  ];

  await writeJson(electronBuilderConfig, buildConfig, { spaces: 2 });
  consola.success('release infomation added to builder config file!');
  // update release info in package.json
  const pkgInfo = getPackageManifest(projRoot);
  pkgInfo.releaseName = releaseInfo.releaseName;
  pkgInfo.releaseDate = date;
  pkgInfo.releaseLogs = logs;
  const rootPkg = resolve(projRoot, 'package.json');
  await writeJson(rootPkg, pkgInfo, { spaces: 2 });
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
  latestConfig.path = `${process.env.VITE_SERVER_HOST}/${pkgInfo.name}/${latestConfig.path}`;
  latestConfig.releaseDate = date;
  await writeFile(latestYmlPath, yaml.dump(latestConfig), { encoding: 'utf8' });
  consola.success('build success!');
};

main().catch((error) => {
  consola.error(error);
  process.exit(1);
});
