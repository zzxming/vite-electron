import { readFileSync } from 'node:fs';
import { copyFile, mkdir, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';

interface Manifest {
  version: string;
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  releaseDate: string;
  releaseName: string;
  releaseLogs: string[];
}
export const getPackageManifest = (pkgPath: string): Manifest => {
  return JSON.parse(readFileSync(resolve(pkgPath, 'package.json'), 'utf8')) as Manifest;
};

export const copyDir = async (src: string, dest: string) => {
  const entries = await readdir(src, { withFileTypes: true });

  await mkdir(dest, { recursive: true });

  for (const entry of entries) {
    const srcPath = resolve(src, entry.name);
    const destPath = resolve(dest, entry.name);

    await (entry.isDirectory() ? copyDir(srcPath, destPath) : copyFile(srcPath, destPath));
  }
};
