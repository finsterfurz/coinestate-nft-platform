/**
 * Global Test Setup
 * Runs once before all tests
 */

module.exports = async () => {
  // Set timezone for consistent date testing
  process.env.TZ = 'UTC';
  
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.REACT_APP_ENVIRONMENT = 'test';
  
  // Mock environment variables for testing
  process.env.REACT_APP_NETWORK = 'sepolia';
  process.env.REACT_APP_CHAIN_ID = '11155111';
  process.env.REACT_APP_NFT_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000';
  
  // Performance setup
  if (typeof global.performance === 'undefined') {
    global.performance = {
      now: jest.fn(() => Date.now()),
      mark: jest.fn(),
      measure: jest.fn(),
      getEntriesByType: jest.fn(() => []),
      getEntriesByName: jest.fn(() => [])
    };
  }
  
  console.log('🧪 Global test setup completed');
};