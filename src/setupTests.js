import '@testing-library/jest-dom';

// ==================== GLOBAL TEST SETUP ====================

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock window.performance
Object.defineProperty(window, 'performance', {
  value: {
    now: jest.fn(() => Date.now()),
    getEntriesByType: jest.fn(() => [
      {
        domContentLoadedEventEnd: 1000,
        domContentLoadedEventStart: 900,
        loadEventEnd: 1200,
        loadEventStart: 1100,
        fetchStart: 800
      }
    ])
  }
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock console methods to reduce noise in tests
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// Mock Image constructor for lazy loading tests
global.Image = class {
  constructor() {
    setTimeout(() => {
      this.onload && this.onload();
    }, 100);
  }
};

// Mock fetch for API tests
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  })
);

// Mock Web3 and MetaMask
global.ethereum = {
  isMetaMask: true,
  request: jest.fn(),
  on: jest.fn(),
  removeListener: jest.fn(),
};

// Extend Jest matchers for better assertions
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});

// Global test utilities
global.testUtils = {
  // Generate mock NFT data
  mockNFT: (overrides = {}) => ({
    id: 'test-nft-1',
    tokenId: '1',
    name: 'Test Property NFT #1',
    propertyId: 'prop-1',
    owner: '0x1234567890123456789012345678901234567890',
    verified: true,
    ...overrides
  }),

  // Generate mock property data
  mockProperty: (overrides = {}) => ({
    id: 'prop-1',
    name: 'Test Property',
    location: 'Test City, Test Country',
    value: '€1,000,000',
    yield: '7.5%',
    status: 'Active',
    nfts: '1000 NFTs',
    image: 'https://example.com/test-image.jpg',
    ...overrides
  }),

  // Wait for animations to complete
  waitForAnimation: () => new Promise(resolve => setTimeout(resolve, 500)),

  // Simulate user delay
  userDelay: () => new Promise(resolve => setTimeout(resolve, 100)),
};

// Set up test environment
process.env.NODE_ENV = 'test';
process.env.REACT_APP_API_URL = 'http://localhost:3001';
process.env.REACT_APP_CHAIN_ID = '1';
