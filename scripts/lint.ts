import { ESLint } from 'eslint';

export const lintFiles = async (filePaths: string | string[]) => {
  const eslint = new ESLint({ fix: true });
  const results = await eslint.lintFiles(Array.isArray(filePaths) ? (filePaths) : [filePaths]);
  await ESLint.outputFixes(results);
};
