import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";
import path from 'node:path'
import { pathToFileURL } from 'node:url'

// Dev-only middleware that runs the SAME knowledge-base-augmented chat logic as
// the Vercel function (api/_lib/chat-core.js), so /chat behaves identically in
// dev and production. Imported dynamically by absolute path so the module keeps
// its real import.meta.url (needed to locate kb-index.json).
function devChatApi(env: Record<string, string>): Plugin {
  return {
    name: 'dev-chat-api',
    configureServer(server) {
      server.middlewares.use('/api/chat', (req, res, next) => {
        if (req.method !== 'POST') return next();
        let raw = '';
        req.on('data', (c) => { raw += c; });
        req.on('end', async () => {
          try {
            const body = raw ? JSON.parse(raw) : {};
            const coreUrl = pathToFileURL(path.resolve(process.cwd(), 'api/_lib/chat-core.js')).href;
            const { runChat } = await import(coreUrl);
            const { status, json } = await runChat(body, env);
            res.statusCode = status;
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Cache-Control', 'no-store');
            res.end(JSON.stringify(json));
          } catch (e) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: e instanceof Error ? e.message : 'dev chat handler failed' }));
          }
        });
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    build: {
      sourcemap: 'hidden',
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          },
        },
      },
    },
    plugins: [
      devChatApi(env),
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
