import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable React Fast Refresh
      fastRefresh: true,
      // Support for styled-jsx (falls noch verwendet)
      babel: {
        plugins: [
          ['styled-jsx/babel', { optimizeForSpeed: true }]
        ]
      }
    })
  ],
  
  // Development server configuration
  server: {
    port: 3000,
    open: true,
    host: true,
    cors: true,
    // HMR (Hot Module Replacement) configuration
    hmr: {
      overlay: true
    }
  },
  
  // Build configuration
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Optimize chunk size
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          react: ['react', 'react-dom'],
          web3: ['ethers', 'crypto-js'],
          ui: ['recharts'],
          validation: ['joi']
        }
      }
    },
    // Build performance optimizations
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true
      }
    },
    // Asset size warnings
    chunkSizeWarningLimit: 1000
  },
  
  // Path resolution
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@config': resolve(__dirname, 'src/config'),
      '@styles': resolve(__dirname, 'src/styles'),
      '@data': resolve(__dirname, 'src/data'),
      '@hooks': resolve(__dirname, 'src/hooks'),
      '@context': resolve(__dirname, 'src/context')
    }
  },
  
  // CSS configuration
  css: {
    modules: {
      // CSS Modules configuration
      localsConvention: 'camelCaseOnly',
      generateScopedName: '[name]__[local]___[hash:base64:5]'
    },
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer')
      ]
    },
    // CSS preprocessing options
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`
      }
    }
  },
  
  // Environment variables configuration
  envPrefix: 'VITE_',
  
  // Define global constants
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString())
  },
  
  // Dependency optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'ethers',
      'joi',
      'crypto-js',
      'recharts',
      'prop-types',
      'axios'
    ],
    exclude: ['@testing-library/jest-dom']
  },
  
  // Preview server configuration (for production testing)
  preview: {
    port: 4173,
    host: true,
    cors: true
  },
  
  // ESBuild configuration
  esbuild: {
    // Remove console.log in production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    // JSX configuration
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment'
  }
});
