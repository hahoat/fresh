import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const accessToken = String(process.env.FRESH_ACCESS_TOKEN || '').trim();

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
        configure(proxy) {
          proxy.on('proxyReq', (proxyRequest) => {
            if (accessToken) proxyRequest.setHeader('X-Fresh-Token', accessToken);
          });
        },
      },
    },
  },
});
