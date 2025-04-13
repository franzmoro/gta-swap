import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import svgr from 'vite-plugin-svgr';
import rollupNodePolyFill from 'rollup-plugin-node-polyfills';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tsconfigPaths(),
    react({
      babel: {
        presets: [],
      },
    }),
    tailwindcss(),
    cssInjectedByJsPlugin(),
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
      '@': path.resolve(__dirname, './src'),
      process: 'process/browser',
      path: 'path-browserify',
      os: 'os-browserify',
      stream: 'stream-browserify',
    },
  },
  build: {
    sourcemap: false, // Set to false for production to reduce size
    rollupOptions: {
      plugins: [(rollupNodePolyFill as any)()],
      external: ['react', 'react-dom'], // Keep only React and ReactDOM external
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
        manualChunks: undefined, // Disable code splitting
        inlineDynamicImports: true, // Bundle dynamic imports
      },
    },
    lib: {
      entry: path.resolve(__dirname, 'src/main.tsx'),
      name: 'GOATAISwap',
      fileName: () => `goatai-swap.js`, // Single filename
      formats: ['es'],
    },
  },
});
