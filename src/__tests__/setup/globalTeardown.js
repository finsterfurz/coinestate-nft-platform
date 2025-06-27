/**
 * Global Test Teardown for CoinEstate NFT Platform
 * Cleanup after all tests are completed
 */

module.exports = async () => {
  // Clean up any global test artifacts
  console.log('Starting global test teardown...');

  // Clear all timers and intervals
  if (global.clearAllTimers) {
    global.clearAllTimers();
  }

  // Cleanup any test databases or external resources
  if (global.testCleanup) {
    await global.testCleanup();
  }

  // Force garbage collection if available
  if (global.gc) {
    global.gc();
  }

  // Reset global mocks
  if (global.ethereum) {
    delete global.ethereum;
  }

  if (global.crypto) {
    delete global.crypto;
  }

  // Clean up DOM if JSDOM is being used
  if (global.document) {
    global.document.body.innerHTML = '';
  }

  // Reset console methods
  if (global.consoleRestore) {
    global.consoleRestore();
  }

  console.log('Global test teardown completed - CoinEstate NFT Platform');
};