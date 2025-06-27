/**
 * Jest Test Setup
 * Global test configuration and mocks
 */

import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import 'jest-axe/extend-expect'; // For accessibility testing

// Polyfills for jsdom
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock Web3 functions
global.ethereum = {
  request: jest.fn(),
  on: jest.fn(),
  removeListener: jest.fn(),
  isMetaMask: true
};

// Mock crypto.getRandomValues
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: jest.fn((arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    })
  }
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback, options) {
    this.callback = callback;
    this.options = options;
  }
  
  observe() {
    // Simulate intersection for testing
    this.callback([{ isIntersecting: true, target: {} }]);
  }
  
  unobserve() {}
  disconnect() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }
  
  observe() {
    // Simulate resize for testing
    this.callback([{ contentRect: { width: 1024, height: 768 } }]);
  }
  
  unobserve() {}
  disconnect() {}
};

// Mock matchMedia
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
    dispatchEvent: jest.fn()
  }))
});

// Mock scrollTo
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: jest.fn()
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
});

// Console suppression for tests
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  // Suppress React Router warnings in tests
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: React Router Future Flag Warning')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
  
  // Suppress specific warnings in tests
  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('componentWillReceiveProps') ||
       args[0].includes('componentWillMount'))
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// Clean up after each test
afterEach(() => {
  // Clear all mocks
  jest.clearAllMocks();
  
  // Clear localStorage mock
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
  
  // Clear sessionStorage mock
  sessionStorageMock.getItem.mockClear();
  sessionStorageMock.setItem.mockClear();
  sessionStorageMock.removeItem.mockClear();
  sessionStorageMock.clear.mockClear();
  
  // Reset document body
  document.body.innerHTML = '';
  
  // Reset window location
  delete window.location;
  window.location = {
    href: 'http://localhost:3000/',
    origin: 'http://localhost:3000',
    protocol: 'http:',
    hostname: 'localhost',
    port: '3000',
    pathname: '/',
    search: '',
    hash: ''
  };
});

// Custom matchers for better testing
export const customMatchers = {
  toBeAccessible: async (received) => {
    const { axe } = await import('jest-axe');
    const results = await axe(received);
    
    return {
      pass: results.violations.length === 0,
      message: () => {
        if (results.violations.length === 0) {
          return 'Expected element to have accessibility violations';
        }
        
        const violations = results.violations
          .map(violation => `${violation.id}: ${violation.description}`)
          .join('\n');
          
        return `Expected element to be accessible, but found violations:\n${violations}`;
      }
    };
  }
};

// Extend Jest matchers
expect.extend(customMatchers);

// Performance tracking in tests
global.performance = {
  ...global.performance,
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByType: jest.fn(() => []),
  getEntriesByName: jest.fn(() => [])
};

// Error boundary for tests
export const TestErrorBoundary = ({ children }) => {
  try {
    return children;
  } catch (error) {
    console.error('Test Error Boundary caught an error:', error);
    return null;
  }
};