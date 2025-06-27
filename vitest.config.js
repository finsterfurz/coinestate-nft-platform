/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  
  test: {
    // Test environment
    environment: 'jsdom',
    
    // Setup files
    setupFiles: ['./src/setupTests.js'],
    
    // Global test settings
    globals: true,
    
    // Coverage settings
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        'build/',
        'src/setupTests.js',
        'src/reportWebVitals.js',
        'src/main.jsx',
        'src/index.js',
        'src/**/*.stories.{js,jsx}',
        'src/data/**',
        '**/*.test.{js,jsx}',
        '**/*.spec.{js,jsx}',
        'cypress/',
        'public/',
        '*.config.js',
        'vite.config.js',
        'vitest.config.js'
      ],
      // Coverage thresholds (same as Jest)
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70
        }
      }
    },
    
    // Test file patterns
    include: [
      'src/**/*.{test,spec}.{js,jsx}',
      'src/**/__tests__/**/*.{js,jsx}'
    ],
    
    // Test exclusions
    exclude: [
      'node_modules',
      'dist',
      'build',
      '.git',
      '.vscode',
      'cypress'
    ],
    
    // Test timeout
    testTimeout: 10000,
    
    // Watch mode settings
    watch: {
      exclude: ['node_modules', 'dist', 'build']
    },
    
    // Reporter settings
    reporter: [
      'verbose',
      'json',
      'html'
    ],
    
    // Output settings
    outputFile: {
      json: './coverage/test-results.json',
      html: './coverage/test-results.html'
    },
    
    // Mock settings
    deps: {
      inline: ['@testing-library/jest-dom']
    }
  },
  
  // Path resolution (same as main vite config)
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
  
  // CSS handling in tests
  css: {
    modules: {
      localsConvention: 'camelCaseOnly'
    }
  },
  
  // Define test environment variables
  define: {
    'import.meta.vitest': 'undefined'
  }
});
