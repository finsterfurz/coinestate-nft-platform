/**
 * File Mock for Jest Tests
 * Handles static asset imports in tests
 */

module.exports = {
  // Default export for static files
  __esModule: true,
  default: 'test-file-stub',
  
  // Named exports for different file types
  src: 'test-file-stub',
  url: 'test-file-stub',
  
  // SVG specific mock
  ReactComponent: 'svg'
};