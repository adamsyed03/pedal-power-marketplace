import { defineConfig, loadEnv, type Plugin } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id: string) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

// Plain Vite does not execute Vercel functions. This middleware is deliberately
// scoped to the read-only admin orders route so local CRM previews behave like
// deployment without involving checkout or payment endpoints.
function adminOrdersDevApi(): Plugin {
  return {
    name: 'admin-orders-dev-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/admin/orders', async (request, response) => {
        const { default: handler } = await server.ssrLoadModule('/api/admin/orders.ts')
        const apiResponse = {
          setHeader(name: string, value: string) {
            response.setHeader(name, value)
            return apiResponse
          },
          status(code: number) {
            response.statusCode = code
            return apiResponse
          },
          json(payload: unknown) {
            if (!response.hasHeader('Content-Type')) response.setHeader('Content-Type', 'application/json; charset=utf-8')
            response.end(JSON.stringify(payload))
            return apiResponse
          },
        }
        await handler(request, apiResponse)
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const serverEnv = loadEnv(mode, process.cwd(), '')
  process.env.SUPABASE_URL ||= serverEnv.SUPABASE_URL
  process.env.SUPABASE_SERVICE_ROLE_KEY ||= serverEnv.SUPABASE_SERVICE_ROLE_KEY

  return {
    plugins: [
      figmaAssetResolver(),
      adminOrdersDevApi(),
      // The React and Tailwind plugins are both required for Make, even if
      // Tailwind is not being actively used; do not remove them.
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        // Alias @ to the src directory
        '@': path.resolve(__dirname, './src'),
      },
    },

    // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
    assetsInclude: ['**/*.svg', '**/*.csv'],

    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'motion': ['motion/react'],
          },
        },
      },
    },
  }
})
