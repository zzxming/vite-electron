import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['replace-asar.ts'],
  shims: true,
});
