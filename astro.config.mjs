import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import react from '@astrojs/react';

import vercel from '@astrojs/vercel/serverless';

// https://astro.build/config
export default defineConfig({
  integrations: [svelte(), react()],
  output: 'server',
  adapter: vercel(),
  vite: {
    server: {
      proxy: {
        '/api': {
          target: import.meta.env.VITE_API_URL,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  },
  devToolbar: {
    enabled: false,
  },
});
