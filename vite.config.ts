import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';
import rollupNodePolyFill from 'rollup-plugin-node-polyfills';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

const fileNames = [
  'src',
  'components',
  'assets',
  'hooks',
  'screens',
  'theme',
  'app-types',
  'utils',
  'constants',
  'routes',
  'adapters',
  'integrations',
  'abis',
  'atoms',
];

const filePaths = fileNames.reduce(
  (filePathAcc, currentFileName) => ({
    ...filePathAcc,
    [`@${currentFileName}`]: `/${
      currentFileName === 'src' ? currentFileName : `src/${currentFileName}`
    }`,
  }),
  {}
);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tsconfigPaths(),
    react({
      babel: {
        presets: ['jotai/babel/preset'],
      },
    }),
    nodePolyfills({
      exclude: ['fs'],
      // Whether to polyfill specific globals.
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      // Whether to polyfill `node:` protocol imports.
      protocolImports: true,
    }),
    svgr(),
  ],
  optimizeDeps: {
    esbuildOptions: {
      define: { global: 'globalThis' },
    },
    include: ['react-icons'],
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
  resolve: {
    alias: {
      ...filePaths,
      process: 'process/browser',
      path: 'path-browserify',
      os: 'os-browserify',
      stream: 'stream-browserify',
    },
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      plugins: [(rollupNodePolyFill as any)()],
    },
  },
  // esbuild: {
  //   drop: ['console', 'debugger'],
  // },
});
