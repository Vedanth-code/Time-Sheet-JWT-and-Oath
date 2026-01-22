import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://timesheet-backend-env.eba-ybvuyg3m.eu-north-1.elasticbeanstalk.com',
        changeOrigin: true,
        secure: false,
      },
      '/auth': {
        target: 'http://timesheet-backend-env.eba-ybvuyg3m.eu-north-1.elasticbeanstalk.com',
        changeOrigin: true,
        secure: false,
      },
      '/login': {
        target: 'http://timesheet-backend-env.eba-ybvuyg3m.eu-north-1.elasticbeanstalk.com',
        changeOrigin: true,
        secure: false,
      },
      '/saveUser': {
        target: 'http://timesheet-backend-env.eba-ybvuyg3m.eu-north-1.elasticbeanstalk.com',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
