import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react-swc';
import {PORT} from './server/server_constants';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/ws': {
        target: `ws://localhost:${PORT}`,
        ws: true,
        changeOrigin: true,
      },
    },
  },
});
