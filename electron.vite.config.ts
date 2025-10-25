import path from 'node:path';
import { defineConfig, externalizeDepsPlugin, defineViteConfig } from 'electron-vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { loadEnv } from 'vite';
import svgLoader from 'vite-svg-loader';

const CWD = process.cwd();

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
  },
  renderer: defineViteConfig(({ mode }) => {
    const { VITE_BASE_URL, VITE_API_URL_PREFIX } = loadEnv(mode, CWD);
    return {
      root: 'src/renderer',
      base: VITE_BASE_URL,
      resolve: {
        alias: {
          '@renderer': path.resolve('src/renderer/src'),
          '@': path.resolve(__dirname, 'src/renderer/src'),
        },
      },

      css: {
        preprocessorOptions: {
          less: {
            modifyVars: {
              hack: `true; @import (reference) "${path.resolve('src/renderer/src/style/variables.less')}";`,
            },
            math: 'strict',
            javascriptEnabled: true,
          },
        },
      },

      plugins: [vue(), vueJsx(), svgLoader()],

      server: {
        port: 3002,
        host: '0.0.0.0',
        proxy: {
          [VITE_API_URL_PREFIX]: 'http://127.0.0.1:3000/',
        },
      },
    };
  }),
});
