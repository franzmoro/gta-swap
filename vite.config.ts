import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';
import rollupNodePolyFill from 'rollup-plugin-node-polyfills';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';

const isProd = process.env.NODE_ENV === 'production';
console.log('isProd:', isProd);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tsconfigPaths(),
    react({
      babel: {
        presets: [],
      },
      // Ensure React is in production mode
      ...(isProd && { jsxRuntime: 'automatic' }),
    }),
    tailwindcss(),
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
    viteStaticCopy({
      targets: [
        {
          src: 'src/assets/fonts/*',
          dest: 'fonts',
        },
      ],
    }),
  ],
  define: {
    ...(isProd && {
      // Force React to use production mode
      'process.env.NODE_ENV': JSON.stringify('production'),
      // This is important for React to use production mode
      'process.env': {},
    }),
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
        // TODO: verify if this is really needed
        // Force React to use production mode during dependency optimization
        ...(isProd && { 'process.env.NODE_ENV': JSON.stringify('production') }),
      },
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
    ...(isProd && {
      sourcemap: false,
      minify: true,
    }),
    rollupOptions: {
      plugins: [(rollupNodePolyFill as any)()],
      // external: ['react', 'react-dom'], // Keep only React and ReactDOM external
      external: [],
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
      formats: ['umd'], // Just UMD format for script tags
    },
  },
});
