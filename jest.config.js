/**
 * Jest Configuration for CoinEstate NFT Platform
 * Comprehensive testing setup with coverage and accessibility testing
 */

module.exports = {
  // Test environment
  testEnvironment: 'jsdom',
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  
  // Module name mapping for imports
  moduleNameMapping: {
    // CSS and CSS modules
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    
    // Static assets
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/src/__mocks__/fileMock.js',
    
    // Module path mapping
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@styles/(.*)$': '<rootDir>/src/styles/$1'
  },
  
  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/index.js',
    '!src/reportWebVitals.js',
    '!src/**/*.stories.{js,jsx}',
    '!src/**/*.test.{js,jsx}',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**',
    '!src/data/**/*.js', // Static data files
    '!**/node_modules/**'
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    },
    // Higher thresholds for critical components
    'src/components/security/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    },
    'src/utils/validation.js': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },
  
  // Coverage reporters
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json-summary'
  ],
  
  // Test match patterns
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx}'
  ],
  
  // Transform configuration
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  
  // Transform ignore patterns
  transformIgnorePatterns: [
    'node_modules/(?!(axios|recharts)/)',
    '^.+\\.module\\.(css|sass|scss)$'
  ],
  
  // Module file extensions
  moduleFileExtensions: [
    'js',
    'jsx',
    'json',
    'node'
  ],
  
  // Test timeout
  testTimeout: 10000,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Restore mocks after each test
  restoreMocks: true,
  
  // Verbose output
  verbose: true,
  
  // Error handling
  errorOnDeprecated: true,
  
  // Watch plugins for better development experience
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ],
  
  // Global setup and teardown
  globalSetup: '<rootDir>/src/__tests__/setup/globalSetup.js',
  globalTeardown: '<rootDir>/src/__tests__/setup/globalTeardown.js',
  
  // Test environment options
  testEnvironmentOptions: {
    url: 'http://localhost:3000'
  },
  
  // Max workers for performance
  maxWorkers: '50%',
  
  // Cache directory
  cacheDirectory: '<rootDir>/.jest-cache'
};