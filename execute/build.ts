#!/usr/bin/env node
import { rimraf } from 'rimraf';
import { run } from 'utils';

const main = async () => {
  await run('tsup', `--format esm,cjs --clean --dts`.split(' '), __dirname);
  await rimraf('dist-execute');
  await Promise.all([
    run(`pkg`, `dist/replace-asar.js --target node16-win-x64 --out-path dist-execute/windows`.split(' '), __dirname),
    run(`pkg`, `dist/replace-asar.js --target node16-macos-x64 --out-path dist-execute/mac`.split(' '), __dirname),
    run(`pkg`, `dist/replace-asar.js --target node16-linux-x64 --out-path dist-execute/linux`.split(' '), __dirname),
  ]);
};

main().catch(() => {
  process.exit(1);
});
