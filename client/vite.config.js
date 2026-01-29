import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import { compression } from 'vite-plugin-compression2'

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production'
  
  return {
    plugins: [
      react({
        // Enable Fast Refresh in development
        fastRefresh: !isProduction,
        // Use automatic JSX runtime
        jsxRuntime: 'automatic',
      }),
      
      // Gzip compression for production
      isProduction && compression({
        algorithm: 'gzip',
        exclude: [/\.(br)$/, /\.(gz)$/],
      }),
      
      // Brotli compression for production
      isProduction && compression({
        algorithm: 'brotliCompress',
        exclude: [/\.(br)$/, /\.(gz)$/],
      }),
      
      // Bundle analyzer in production build
      isProduction && visualizer({
        filename: './dist/stats.html',
        open: false,
        gzipSize: true,
        brotliSize: true,
      }),
    ].filter(Boolean),
    
    server: {
      port: 5173,
      strictPort: false,
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true
        }
      }
    },
    
    build: {
      // Target modern browsers
      target: 'es2020',
      
      // Optimize chunk size
      chunkSizeWarningLimit: 1000,
      
      rollupOptions: {
        output: {
          // Manual chunk splitting for better caching
          manualChunks: {
            // Vendor chunks
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
            'ui-vendor': ['lucide-react'],
            
            // Code splitting by route
            'auth-pages': [
              './src/pages/Login.jsx',
              './src/pages/Register.jsx',
            ],
            'dashboard-pages': [
              './src/pages/DashboardPage.jsx',
              './src/pages/Profile.jsx',
              './src/pages/Settings.jsx',
            ],
            'project-pages': [
              './src/pages/ProjectView.jsx',
              './src/pages/Marketplace.jsx',
            ],
            'communication-pages': [
              './src/pages/MessagesPage.jsx',
              './src/pages/TeamPage.jsx',
            ],
          },
          
          // Hash filenames for cache busting
          entryFileNames: 'assets/[name].[hash].js',
          chunkFileNames: 'assets/[name].[hash].js',
          assetFileNames: 'assets/[name].[hash].[ext]',
        },
      },
      
      // Minification options
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: isProduction, // Remove console.logs in production
          drop_debugger: true,
          pure_funcs: isProduction ? ['console.log', 'console.debug'] : [],
        },
        format: {
          comments: false, // Remove comments
        },
      },
      
      // Source maps for production debugging
      sourcemap: isProduction ? 'hidden' : true,
      
      // Report compressed size
      reportCompressedSize: true,
      
      // CSS code splitting
      cssCodeSplit: true,
    },
    
    // Optimize dependencies
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'firebase/app',
        'firebase/auth',
        'firebase/firestore',
        'firebase/storage',
      ],
    },
    
    // Define global constants
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    },
  }
})
