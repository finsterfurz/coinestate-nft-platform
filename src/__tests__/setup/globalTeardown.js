/**
 * Global Test Teardown
 * Runs once after all tests
 */

module.exports = async () => {
  // Clean up any global resources
  
  // Reset environment variables
  delete process.env.TZ;
  
  console.log('🧹 Global test teardown completed');
};