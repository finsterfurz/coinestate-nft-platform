/**
 * Enterprise Testing Utilities for CoinEstate NFT Platform
 * Comprehensive testing infrastructure with security and accessibility testing
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import { axe, toHaveNoViolations } from 'jest-axe';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';
import { AppProvider } from '../context/AppContext';
import type { User, Property, NFTToken, Proposal } from '../types/enhanced';

// Add jest-axe matchers
expect.extend(toHaveNoViolations);

// ================ TEST UTILITIES ================

export interface TestWrapperProps {
  children: React.ReactNode;
  initialRoute?: string;
  theme?: 'light' | 'dark' | 'blue';
  authenticated?: boolean;
  user?: Partial<User>;
}

/**
 * Enhanced test wrapper with all providers
 * Provides theme, auth, and routing context for components
 */
export const TestWrapper: React.FC<TestWrapperProps> = ({
  children,
  initialRoute = '/',
  theme = 'light',
  authenticated = false,
  user = null
}) => {
  const mockAuthContext = {
    isAuthenticated: authenticated,
    user: user as User,
    login: jest.fn(),
    logout: jest.fn(),
    loading: false,
    error: null
  };

  const mockAppContext = {
    loading: false,
    error: null,
    settings: {
      theme,
      language: 'en',
      currency: 'USD'
    }
  };

  return (
    <MemoryRouter initialEntries={[initialRoute]}>
      <HelmetProvider>
        <ThemeProvider value={{ theme, setTheme: jest.fn() }}>
          <AuthProvider value={mockAuthContext}>
            <AppProvider value={mockAppContext}>
              {children}
            </AppProvider>
          </AuthProvider>
        </ThemeProvider>
      </HelmetProvider>
    </MemoryRouter>
  );
};

/**
 * Custom render function with TestWrapper
 */
export const renderWithProviders = (
  ui: React.ReactElement,
  options: Omit<TestWrapperProps, 'children'> = {}
) => {
  return render(ui, {
    wrapper: ({ children }) => (
      <TestWrapper {...options}>{children}</TestWrapper>
    )
  });
};

// ================ ACCESSIBILITY TESTING ================

/**
 * Test component for accessibility violations
 */
export const testAccessibility = async (component: HTMLElement) => {
  const results = await axe(component);
  expect(results).toHaveNoViolations();
};

/**
 * Enhanced accessibility test with WCAG 2.1 AA compliance
 */
export const testWCAGCompliance = async (
  ui: React.ReactElement,
  options: Omit<TestWrapperProps, 'children'> = {}
) => {
  const { container } = renderWithProviders(ui, options);
  
  // Test for WCAG violations
  const results = await axe(container, {
    rules: {
      // Enable specific WCAG 2.1 AA rules
      'color-contrast': { enabled: true },
      'keyboard-navigation': { enabled: true },
      'aria-labels': { enabled: true },
      'focus-management': { enabled: true }
    }
  });
  
  expect(results).toHaveNoViolations();
  
  return { container, results };
};

// ================ SECURITY TESTING ================

/**
 * Test for XSS vulnerabilities in component inputs
 */
export const testXSSPrevention = async (
  component: React.ReactElement,
  inputSelector: string
) => {
  const xssPayloads = [
    '<script>alert("XSS")</script>',
    'javascript:alert("XSS")',
    '<img src="x" onerror="alert(\'XSS\')">',
    '<svg onload="alert(\'XSS\')">',
    '"><script>alert("XSS")</script>'
  ];

  renderWithProviders(component);
  const input = screen.getByRole('textbox', { name: inputSelector });

  for (const payload of xssPayloads) {
    await userEvent.clear(input);
    await userEvent.type(input, payload);
    
    // Verify payload is sanitized
    expect(input.value).not.toContain('<script>');
    expect(input.value).not.toContain('javascript:');
    expect(input.value).not.toContain('onerror');
    expect(input.value).not.toContain('onload');
  }
};

/**
 * Test CSRF token validation
 */
export const testCSRFProtection = () => {
  // Mock fetch to verify CSRF token is included
  const mockFetch = jest.spyOn(global, 'fetch');
  
  return {
    expectCSRFToken: () => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-CSRF-Token': expect.any(String)
          })
        })
      );
    },
    cleanup: () => mockFetch.mockRestore()
  };
};

// ================ WEB3 TESTING UTILITIES ================

/**
 * Mock Web3 provider for testing
 */
export const createMockWeb3Provider = () => ({
  isMetaMask: true,
  chainId: '0xaa36a7', // Sepolia testnet
  selectedAddress: '0x1234567890123456789012345678901234567890',
  request: jest.fn(),
  on: jest.fn(),
  removeListener: jest.fn(),
  send: jest.fn(),
  sendAsync: jest.fn()
});

/**
 * Mock ethers.js provider
 */
export const createMockEthersProvider = () => ({
  getNetwork: jest.fn().mockResolvedValue({
    name: 'sepolia',
    chainId: 11155111
  }),
  getBalance: jest.fn().mockResolvedValue('1000000000000000000'), // 1 ETH
  getTransactionCount: jest.fn().mockResolvedValue(42),
  getGasPrice: jest.fn().mockResolvedValue('20000000000'),
  estimateGas: jest.fn().mockResolvedValue('21000'),
  sendTransaction: jest.fn().mockResolvedValue({
    hash: '0xabc123',
    wait: jest.fn().mockResolvedValue({ status: 1 })
  })
});

/**
 * Test Web3 wallet connection
 */
export const testWalletConnection = async (
  component: React.ReactElement,
  connectButtonText = 'Connect Wallet'
) => {
  // Mock MetaMask
  const mockProvider = createMockWeb3Provider();
  (global as any).ethereum = mockProvider;

  renderWithProviders(component);
  
  const connectButton = screen.getByText(connectButtonText);
  await userEvent.click(connectButton);

  await waitFor(() => {
    expect(mockProvider.request).toHaveBeenCalledWith({
      method: 'eth_requestAccounts'
    });
  });
};

// ================ PERFORMANCE TESTING ================

/**
 * Test component render performance
 */
export const testRenderPerformance = (
  component: React.ReactElement,
  maxRenderTime = 16 // 60fps target
) => {
  const startTime = performance.now();
  renderWithProviders(component);
  const endTime = performance.now();
  
  const renderTime = endTime - startTime;
  expect(renderTime).toBeLessThan(maxRenderTime);
  
  return renderTime;
};

/**
 * Test component memory usage
 */
export const testMemoryUsage = async (
  component: React.ReactElement,
  iterations = 100
) => {
  const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
  
  // Render component multiple times
  for (let i = 0; i < iterations; i++) {
    const { unmount } = renderWithProviders(component);
    unmount();
  }
  
  // Force garbage collection if available
  if ((global as any).gc) {
    (global as any).gc();
  }
  
  const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
  const memoryIncrease = finalMemory - initialMemory;
  
  // Memory should not increase significantly
  expect(memoryIncrease).toBeLessThan(1024 * 1024); // 1MB threshold
  
  return memoryIncrease;
};

// ================ DATA MOCKING ================

/**
 * Create mock user data
 */
export const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: 'user_123',
  walletAddress: '0x1234567890123456789012345678901234567890',
  email: 'test@example.com',
  kycStatus: 'approved',
  kycLevel: 'enhanced',
  registrationDate: new Date('2024-01-01'),
  lastLoginDate: new Date(),
  preferences: {
    theme: 'light',
    language: 'en',
    currency: 'USD',
    notifications: {
      email: true,
      push: true,
      sms: false
    },
    privacy: {
      shareData: false,
      analytics: true
    }
  },
  governance: {
    votingPower: 100,
    nftTokens: [],
    votingHistory: [],
    participationScore: 85,
    reputationScore: 92,
    lastVoteDate: new Date('2024-06-01')
  },
  ...overrides
});

/**
 * Create mock property data
 */
export const createMockProperty = (overrides: Partial<Property> = {}): Property => ({
  id: 'property_456',
  address: {
    street: '123 Main St',
    city: 'New York',
    state: 'NY',
    postalCode: '10001',
    country: 'USA',
    coordinates: {
      latitude: 40.7128,
      longitude: -74.0060
    }
  },
  type: 'residential_single',
  status: 'active',
  financials: {
    acquisitionPrice: 500000,
    currentValue: 550000,
    monthlyRent: 3000,
    monthlyExpenses: 1200,
    netCashFlow: 1800,
    roi: 4.32,
    cap_rate: 6.5,
    occupancyRate: 95,
    lastUpdated: new Date()
  },
  management: {
    manager: 'Property Management Co',
    contact: 'manager@example.com',
    maintenanceSchedule: []
  },
  governance: {
    totalTokens: 1000,
    activeVoters: 750,
    proposalCount: 12,
    lastVote: new Date('2024-06-15')
  },
  documents: [],
  multimedia: [],
  metadata: {
    description: 'Modern single-family home',
    amenities: ['Parking', 'Garden', 'Modern Kitchen'],
    yearBuilt: 2015,
    sqft: 2500
  },
  ...overrides
});

/**
 * Create mock NFT token data
 */
export const createMockNFTToken = (overrides: Partial<NFTToken> = {}): NFTToken => ({
  tokenId: 'token_789',
  contractAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
  propertyId: 'property_456',
  votingWeight: 10,
  acquisitionDate: new Date('2024-03-01'),
  transferHistory: [],
  metadata: {
    name: 'CoinEstate NFT #789',
    description: 'Voting rights for Property #456',
    image: 'https://example.com/nft/789.png',
    attributes: [
      { trait_type: 'Property Type', value: 'Residential' },
      { trait_type: 'Voting Weight', value: '10' }
    ]
  },
  ...overrides
});

/**
 * Create mock proposal data
 */
export const createMockProposal = (overrides: Partial<Proposal> = {}): Proposal => ({
  id: 'proposal_321',
  propertyId: 'property_456',
  title: 'Roof Maintenance Project',
  description: 'Proposal to repair and maintain the property roof',
  category: 'maintenance',
  proposer: 'user_123',
  status: 'active',
  votingStart: new Date('2024-06-01'),
  votingEnd: new Date('2024-06-30'),
  quorumRequired: 50,
  threshold: 50,
  votes: {
    yes: 45,
    no: 15,
    abstain: 5
  },
  participants: ['user_123', 'user_456', 'user_789'],
  ...overrides
});

// ================ CUSTOM MATCHERS ================

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeAccessible(): Promise<R>;
      toHaveValidHTML(): R;
      toBeSecureInput(): R;
      toHaveCSRFProtection(): R;
    }
  }
}

// Custom matcher for accessibility
expect.extend({
  async toBeAccessible(received: HTMLElement) {
    const results = await axe(received);
    const pass = results.violations.length === 0;
    
    return {
      pass,
      message: () => pass 
        ? `Expected element to have accessibility violations` 
        : `Expected element to be accessible, but found ${results.violations.length} violations:\n${results.violations.map(v => v.description).join('\n')}`
    };
  },
  
  toHaveValidHTML(received: HTMLElement) {
    // Basic HTML validation
    const hasRequiredAttributes = received.hasAttribute('role') || received.tagName.toLowerCase() === 'div';
    const hasAccessibleName = received.hasAttribute('aria-label') || received.hasAttribute('aria-labelledby') || received.textContent?.trim();
    
    const pass = hasRequiredAttributes && hasAccessibleName;
    
    return {
      pass,
      message: () => pass 
        ? `Expected element to have invalid HTML`
        : `Expected element to have valid HTML structure`
    };
  }
});

// ================ EXPORT ALL UTILITIES ================

export {
  renderWithProviders as render,
  TestWrapper,
  testAccessibility,
  testWCAGCompliance,
  testXSSPrevention,
  testCSRFProtection,
  createMockWeb3Provider,
  createMockEthersProvider,
  testWalletConnection,
  testRenderPerformance,
  testMemoryUsage,
  createMockUser,
  createMockProperty,
  createMockNFTToken,
  createMockProposal,
  screen,
  fireEvent,
  waitFor,
  userEvent
};

export default {
  render: renderWithProviders,
  TestWrapper,
  testAccessibility,
  testWCAGCompliance,
  testXSSPrevention,
  testCSRFProtection,
  createMockWeb3Provider,
  createMockEthersProvider,
  testWalletConnection,
  testRenderPerformance,
  testMemoryUsage,
  createMockUser,
  createMockProperty,
  createMockNFTToken,
  createMockProposal
};
