import react from '@vitejs/plugin-react';

export default {
  base: './',
  plugins: [react()],
  server: { host: '127.0.0.1', port: 5177, strictPort: true },
  preview: { host: '127.0.0.1', port: 5177, strictPort: true },
  build: { emptyOutDir: false },
};
