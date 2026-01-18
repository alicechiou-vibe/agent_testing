import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  // Priority: Check .env files first (via loadEnv), then fallback to system process.env (for GitHub Actions)
  const apiKey = env.API_KEY || process.env.API_KEY;
  
  return {
    plugins: [react()],
    // Handle the specific repo name for GitHub Pages deployment
    base: './', 
    define: {
      // Polyfill process.env for the app code
      'process.env.API_KEY': JSON.stringify(apiKey),
    },
  }
})
