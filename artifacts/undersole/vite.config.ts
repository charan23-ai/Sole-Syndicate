import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

import runtimeErrorOverlay from '@replit/vite-plugin-runtime-error-modal';

export default defineConfig(async ({ command, mode }) => {
  const isReplitDev =
    process.env.REPL_ID !== undefined && mode !== 'production';

  let port = 5173;
  if (process.env.PORT) {
    const parsedPort = Number(process.env.PORT);
    if (!Number.isNaN(parsedPort) && parsedPort > 0) {
      port = parsedPort;
    } else if (isReplitDev) {
      throw new Error(`Invalid PORT value: "${process.env.PORT}"`);
    }
  } else if (isReplitDev) {
    throw new Error(
      'PORT environment variable is required but was not provided.',
    );
  }

  const basePath = process.env.BASE_PATH || '/';
  if (!process.env.BASE_PATH && isReplitDev) {
    throw new Error(
      'BASE_PATH environment variable is required but was not provided.',
    );
  }

  return {
    base: basePath,
    plugins: [
      react(),
      tailwindcss(),
      runtimeErrorOverlay(),
      ...(mode !== 'production' && process.env.REPL_ID !== undefined
        ? [
            await import('@replit/vite-plugin-cartographer').then((m) =>
              m.cartographer({
                root: path.resolve(import.meta.dirname, '..'),
              }),
            ),
            await import('@replit/vite-plugin-dev-banner').then((m) =>
              m.devBanner(),
            ),
          ]
        : []),
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, 'src'),
        '@assets': path.resolve(
          import.meta.dirname,
          '..',
          '..',
          'attached_assets',
        ),
      },
      dedupe: ['react', 'react-dom'],
    },
    root: path.resolve(import.meta.dirname),
    build: {
      outDir: path.resolve(import.meta.dirname, 'dist/public'),
      emptyOutDir: true,
    },
    server: {
      port,
      strictPort: true,
      host: '0.0.0.0',
      allowedHosts: true,
      fs: {
        strict: true,
      },
    },
    preview: {
      port,
      host: '0.0.0.0',
      allowedHosts: true,
    },
  };
});
