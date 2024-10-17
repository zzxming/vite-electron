import type { CommonServerOptions } from 'vite';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import UnoCSS from 'unocss/vite';
import AutoImport from 'unplugin-auto-import/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import Components from 'unplugin-vue-components/vite';
import { defineConfig } from 'vite';
import electron from 'vite-plugin-electron/simple';
import pkg from './package.json';
// import renderer from 'vite-plugin-electron-renderer'

const HOST = `http://localhost`;

export default defineConfig(({ command }) => {
  fs.rmSync('dist-electron', { recursive: true, force: true });

  const isServe = command === 'serve';
  const isBuild = command === 'build';
  const sourcemap = isServe;

  return {
    plugins: [
      vue(),
      vueJsx(),
      electron({
        main: {
          // Shortcut of `build.lib.entry`
          entry: 'electron/main/index.ts',
          onstart({ startup }) {
            startup();
          },
          vite: {
            build: {
              sourcemap,
              minify: isBuild,
              outDir: 'dist-electron/main',
              rollupOptions: {
                // Some third-party Node.js libraries may not be built correctly by Vite, especially `C/C++` addons,
                // we can use `external` to exclude them to ensure they work correctly.
                // Others need to put them in `dependencies` to ensure they are collected into `app.asar` after the app is built.
                // Of course, this is not absolute, just this way is relatively simple. :)
                external: Object.keys('dependencies' in pkg ? pkg.dependencies as Record<string, string> : {}),
              },
            },
          },
        },
        preload: {
          // Shortcut of `build.rollupOptions.input`.
          // Preload scripts may contain Web assets, so use the `build.rollupOptions.input` instead `build.lib.entry`.
          input: 'electron/preload/index.ts',
          vite: {
            build: {
              sourcemap: sourcemap ? 'inline' : undefined, // #332
              minify: isBuild,
              outDir: 'dist-electron/preload',
              rollupOptions: {
                external: Object.keys('dependencies' in pkg ? pkg.dependencies as Record<string, string> : {}),
              },
            },
          },
        },
        // Ployfill the Electron and Node.js API for Renderer process.
        // If you want use Node.js in Renderer process, the `nodeIntegration` needs to be enabled in the Main process.
        // See 👉 https://github.com/electron-vite/vite-plugin-electron-renderer
        renderer: {},
      }),
      AutoImport({
        imports: ['vue', 'vue-router'],
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        extensions: ['vue', 'tsx'],
        include: [/\.vue$/, /\.vue\?vue/, /\.[jt]sx$/],
        resolvers: [ElementPlusResolver()],
      }),
      UnoCSS(),
      // Use Node.js API in the Renderer process
      // renderer(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('src', import.meta.url)),
      },
    },
    server: (() => {
      const config: CommonServerOptions = {
        port: 3333,
        proxy: {
          '/api': {
            target: `${HOST}`,
            changeOrigin: true,
            rewrite: path => path.replace(/^\/api/, ''),
          },
        },
      };
      if (process.env.VSCODE_DEBUG) {
        const url = new URL(pkg.debug.env.VITE_DEV_SERVER_URL);
        Object.assign(config, {
          host: url.hostname,
          port: +url.port,
        });
      }
      return config;
    })(),
    clearScreen: false,
  };
});
