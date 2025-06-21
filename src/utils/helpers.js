// src/utils/helpers.js

/**
 * Format currency values
 * @param {number} value - The numeric value to format
 * @param {string} currency - Currency symbol (default: '€')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value, currency = '€') => {
  if (value >= 1000000) {
    return `${currency}${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${currency}${(value / 1000).toFixed(0)}K`;
  }
  return `${currency}${value.toLocaleString()}`;
};

/**
 * Format percentage values
 * @param {number} value - The numeric value to format as percentage
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, decimals = 1) => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Truncate wallet address for display
 * @param {string} address - Full wallet address
 * @param {number} startChars - Characters to show at start (default: 6)
 * @param {number} endChars - Characters to show at end (default: 4)
 * @returns {string} Truncated address
 */
export const truncateAddress = (address, startChars = 6, endChars = 4) => {
  if (!address) return '';
  if (address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
};

/**
 * Calculate NFT price per unit
 * @param {number} totalValue - Total property value
 * @param {number} nftCount - Number of NFTs
 * @returns {number} Price per NFT
 */
export const calculateNftPrice = (totalValue, nftCount) => {
  return totalValue / nftCount;
};

/**
 * Generate mock chart data for performance metrics
 * @param {number} months - Number of months of data
 * @param {number} baseValue - Starting value
 * @param {number} volatility - Volatility factor (0-1)
 * @returns {Array} Chart data array
 */
export const generateChartData = (months = 12, baseValue = 100, volatility = 0.1) => {
  const data = [];
  let currentValue = baseValue;
  
  for (let i = 0; i < months; i++) {
    const change = (Math.random() - 0.5) * volatility * currentValue;
    currentValue += change;
    
    const date = new Date();
    date.setMonth(date.getMonth() - (months - i - 1));
    
    data.push({
      month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      value: Math.round(currentValue * 100) / 100,
      change: change > 0 ? '+' + formatPercentage(Math.abs(change / (currentValue - change)) * 100) : '-' + formatPercentage(Math.abs(change / (currentValue - change)) * 100)
    });
  }
  
  return data;
};

/**
 * Validate Ethereum address format
 * @param {string} address - Address to validate
 * @returns {boolean} Whether address is valid
 */
export const isValidEthereumAddress = (address) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

/**
 * Get status color based on project status
 * @param {string} status - Project status
 * @returns {object} Tailwind classes for status display
 */
export const getStatusColor = (status) => {
  const statusColors = {
    'Fully Allocated': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
    'Available': { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
    'Coming Soon': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
    'Planning': { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
    'Maintenance': { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' }
  };
  
  return statusColors[status] || { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' };
};

/**
 * Delay function for async operations
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} Promise that resolves after delay
 */
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Local storage helpers with error handling
 */
export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Error writing to localStorage:', error);
      return false;
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      return false;
    }
  }
};