const { defineConfig } = require('vite');

module.exports = defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://g-track-backend-94gv.onrender.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
