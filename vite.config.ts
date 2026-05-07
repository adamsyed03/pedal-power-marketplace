process.env.ROLLUP_USE_ESM = 'true'; // 👈 Force JS fallback instead of native Rollup

import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
const DEFAULT_SITE_URL = "https://www.ridepogon.com";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const siteUrl = env.VITE_SITE_URL || DEFAULT_SITE_URL;

  return {
    define: {
      "import.meta.env.VITE_SITE_URL": JSON.stringify(siteUrl),
    },
    server: {
    port: 8080,
    host: true,
    strictPort: false,
    headers: {
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
    },
    fs: {
      strict: false,
      allow: ['..']
    },
    watch: {
      usePolling: true
    }
    },
    publicDir: 'public',
    base: '/',
    plugins: [
      {
        name: "site-url-html-env",
        transformIndexHtml(html) {
          return html.replace(/%VITE_SITE_URL%/g, siteUrl);
        },
      },
      react(),
      mode === 'development' &&
      componentTagger(),
    ].filter(Boolean),
    resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
    },
    build: {
    target: 'esnext',
    minify: 'esbuild',
    cssMinify: true,
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      external: ['@rollup/rollup-linux-x64-gnu'], // prevent native dependency from being bundled
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
    },
  };
});
