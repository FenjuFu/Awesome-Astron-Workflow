import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Used only for local dev proxy (keeps keys out of the browser bundle).
  const env = loadEnv(mode, process.cwd(), '');
  const maasApiKey = env.ASTRON_MAAS_API_KEY;

  return {
    build: {
      sourcemap: 'hidden',
    },
    server: maasApiKey
      ? {
          proxy: {
            '/api/chat': {
              target: 'https://maas-coding-api.cn-huabei-1.xf-yun.com',
              changeOrigin: true,
              secure: true,
              rewrite: (path) => path.replace(/^\/api\/chat$/, '/v2/chat/completions'),
              headers: {
                Authorization: `Bearer ${maasApiKey}`,
              },
            },
          },
        }
      : undefined,
    plugins: [
      react({
        babel: {
          plugins: [
            'react-dev-locator',
          ],
        },
      }),
      tsconfigPaths()
    ],
  };
})
