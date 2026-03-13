import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Vite configuration file for the React application
export default defineConfig({
  // Utilize the Vite React plugin for Fast Refresh and JSX support
  plugins: [react()],
  build: {
    // Utilize esbuild for faster and efficient minification
    minify: 'esbuild',
    // Enable CSS minification for optimized production builds
    cssMinify: true,
    rollupOptions: {
      output: {
        // Implement code splitting to reduce the initial bundle load time
        manualChunks: {
          vendor: ['react', 'react-dom', 'framer-motion'], // Core UI dependencies
          three: ['three', '@react-three/fiber'], // 3D graphics and rendering tools
        }
      }
    }
  }
})
