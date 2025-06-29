/**
 * Comprehensive Test Suite for PropertyDashboard Component
 * Demonstrates enterprise-level testing with all frameworks:
 * - Unit testing with Vitest
 * - Accessibility testing with jest-axe
 * - Security testing with XSS/CSRF protection
 * - Performance testing with render timing
 * - Integration testing with user interactions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, fireEvent, waitFor, userEvent } from '@testing-library/react';

// Testing utilities with all frameworks
import {
  renderWithProviders,
  testAccessibility,
  testWCAGCompliance,
  testXSSPrevention,
  testCSRFProtection,
  testRenderPerformance,
  testMemoryUsage,
  createMockUser,
  createMockProperty,
  createMockProposal
} from '../../__tests__/setup/testUtils';

// Component under test
import PropertyDashboard, { 
  PropertyCard, 
  createMockProps,
  type PropertyDashboardProps 
} from '../examples/PropertyDashboard';

// Types
import type { Property, User } from '../../types/enhanced';

// Mock dependencies
vi.mock('../../utils/security', () => ({
  validateAndSanitize: vi.fn().mockReturnValue({ isValid: true, sanitizedData: 'clean-input' }),
  ValidationSchemas: { username: {} },
  SecurityLogger: { logEvent: vi.fn() },
  CSRFProtection: { generateToken: vi.fn().mockReturnValue('mock-csrf-token') }
}));

vi.mock('../../utils/performance', () => ({
  OptimizedImage: ({ src, alt, onLoad, ...props }: any) => {
    // Simulate image load
    setTimeout(() => onLoad?.(), 0);
    return <img src={src} alt={alt} {...props} data-testid="optimized-image" />;
  },
  PerformanceMonitor: { recordMetrics: vi.fn() },
  useOptimizedCallback: (fn: any) => fn,
  useMemoryOptimized: (fn: any) => fn(),
  withPerformanceTracking: (Component: any) => Component
}));

// ================ TEST DATA ================

const mockUser: User = createMockUser({
  id: 'user-123',
  walletAddress: '0x1234567890123456789012345678901234567890',
  governance: {
    votingPower: 100,
    nftTokens: [],
    votingHistory: [],
    participationScore: 85,
    reputationScore: 92
  }
});

const mockProperties: Property[] = [
  createMockProperty({
    id: 'property-1',
    address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'USA'
    },
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
    }
  }),
  createMockProperty({
    id: 'property-2',
    address: {
      street: '456 Oak Ave',
      city: 'Los Angeles',
      state: 'CA',
      postalCode: '90210',
      country: 'USA'
    },
    status: 'maintenance',
    type: 'commercial_office',
    financials: {
      acquisitionPrice: 750000,
      currentValue: 800000,
      monthlyRent: 4500,
      monthlyExpenses: 1800,
      netCashFlow: 2700,
      roi: 5.2,
      cap_rate: 7.1,
      occupancyRate: 88,
      lastUpdated: new Date()
    }
  })
];

const defaultProps: PropertyDashboardProps = {
  user: mockUser,
  properties: mockProperties,
  onNavigate: vi.fn(),
  theme: 'light',
  isLoading: false,
  enableRealTimeUpdates: false,
  showAnalytics: true
};

// ================ UNIT TESTS ================

describe('PropertyDashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ================ BASIC RENDERING TESTS ================

  describe('Basic Rendering', () => {
    it('should render without crashing', () => {
      renderWithProviders(<PropertyDashboard {...defaultProps} />);
      
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByText('Property Portfolio')).toBeInTheDocument();
    });

    it('should render all properties', () => {
      renderWithProviders(<PropertyDashboard {...defaultProps} />);
      
      expect(screen.getByText('123 Main St')).toBeInTheDocument();
      expect(screen.getByText('456 Oak Ave')).toBeInTheDocument();
    });

    it('should display portfolio analytics when enabled', () => {
      renderWithProviders(<PropertyDashboard {...defaultProps} showAnalytics={true} />);
      
      expect(screen.getByText('Total Properties')).toBeInTheDocument();
      expect(screen.getByText('Total Value')).toBeInTheDocument();
      expect(screen.getByText('Monthly Income')).toBeInTheDocument();
      expect(screen.getByText('Avg Occupancy')).toBeInTheDocument();
    });

    it('should hide analytics when disabled', () => {
      renderWithProviders(<PropertyDashboard {...defaultProps} showAnalytics={false} />);
      
      expect(screen.queryByText('Total Properties')).not.toBeInTheDocument();
    });
  });

  // ================ LOADING STATES ================

  describe('Loading States', () => {
    it('should display loading skeleton when isLoading is true', () => {
      renderWithProviders(<PropertyDashboard {...defaultProps} isLoading={true} />);
      
      expect(screen.getByTestId('property-dashboard-loading')).toBeInTheDocument();
      expect(screen.getAllByText('', { selector: '.animate-pulse' })).toHaveLength(6);
    });

    it('should display refresh button', () => {
      renderWithProviders(<PropertyDashboard {...defaultProps} />);
      
      const refreshButton = screen.getByTestId('property-dashboard-refresh-button');
      expect(refreshButton).toBeInTheDocument();
      expect(refreshButton).toHaveTextContent('Refresh');
    });

    it('should call onRefresh when refresh button is clicked', async () => {
      const mockRefresh = vi.fn();
      renderWithProviders(
        <PropertyDashboard {...defaultProps} onRefresh={mockRefresh} />
      );
      
      const refreshButton = screen.getByTestId('property-dashboard-refresh-button');
      await userEvent.click(refreshButton);
      
      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });
  });

  // ================ ERROR HANDLING ================

  describe('Error Handling', () => {
    it('should display error message when error prop is provided', () => {
      const errorMessage = 'Failed to load properties';
      renderWithProviders(
        <PropertyDashboard {...defaultProps} error={errorMessage} />
      );
      
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Failed to Load Properties')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('should display retry button when retry function is provided', () => {
      const mockRetry = vi.fn();
      renderWithProviders(
        <PropertyDashboard 
          {...defaultProps} 
          error="Network error" 
          retry={mockRetry} 
        />
      );
      
      const retryButton = screen.getByTestId('property-dashboard-retry-button');
      expect(retryButton).toBeInTheDocument();
    });

    it('should call retry function when retry button is clicked', async () => {
      const mockRetry = vi.fn();
      renderWithProviders(
        <PropertyDashboard 
          {...defaultProps} 
          error="Network error" 
          retry={mockRetry} 
        />
      );
      
      const retryButton = screen.getByTestId('property-dashboard-retry-button');
      await userEvent.click(retryButton);
      
      expect(mockRetry).toHaveBeenCalledTimes(1);
    });
  });

  // ================ SEARCH AND FILTERING ================

  describe('Search and Filtering', () => {
    it('should filter properties by search term', async () => {
      renderWithProviders(<PropertyDashboard {...defaultProps} />);
      
      const searchInput = screen.getByTestId('property-dashboard-search-input');
      await userEvent.type(searchInput, 'Main St');
      
      await waitFor(() => {
        expect(screen.getByText('123 Main St')).toBeInTheDocument();
        expect(screen.queryByText('456 Oak Ave')).not.toBeInTheDocument();
      });
    });

    it('should filter properties by status', async () => {
      renderWithProviders(<PropertyDashboard {...defaultProps} />);
      
      const statusFilter = screen.getByTestId('property-dashboard-status-filter');
      await userEvent.selectOptions(statusFilter, 'maintenance');
      
      await waitFor(() => {
        expect(screen.queryByText('123 Main St')).not.toBeInTheDocument();
        expect(screen.getByText('456 Oak Ave')).toBeInTheDocument();
      });
    });

    it('should sort properties correctly', async () => {
      renderWithProviders(<PropertyDashboard {...defaultProps} />);
      
      const sortSelect = screen.getByTestId('property-dashboard-sort-select');
      await userEvent.selectOptions(sortSelect, 'currentValue-asc');
      
      // Properties should be sorted by value (ascending)
      const propertyCards = screen.getAllByTestId(/property-card-/);
      expect(propertyCards[0]).toHaveTextContent('123 Main St'); // Lower value first
    });

    it('should display empty state when no properties match filters', async () => {
      renderWithProviders(<PropertyDashboard {...defaultProps} />);
      
      const searchInput = screen.getByTestId('property-dashboard-search-input');
      await userEvent.type(searchInput, 'Nonexistent Property');
      
      await waitFor(() => {
        expect(screen.getByText('No Properties Found')).toBeInTheDocument();
        expect(screen.getByText('Try adjusting your filters or search terms.')).toBeInTheDocument();
      });
    });
  });

  // ================ PROPERTY INTERACTIONS ================

  describe('Property Interactions', () => {
    it('should call onPropertySelect when property card is clicked', async () => {
      const mockPropertySelect = vi.fn();
      renderWithProviders(
        <PropertyDashboard 
          {...defaultProps} 
          onPropertySelect={mockPropertySelect} 
        />
      );
      
      const propertyCard = screen.getByTestId('property-card-property-1');
      await userEvent.click(propertyCard);
      
      expect(mockPropertySelect).toHaveBeenCalledWith(mockProperties[0]);
    });

    it('should call onNavigate when property card is clicked without onPropertySelect', async () => {
      const mockNavigate = vi.fn();
      renderWithProviders(
        <PropertyDashboard 
          {...defaultProps} 
          onNavigate={mockNavigate}
          onPropertySelect={undefined}
        />
      );
      
      const propertyCard = screen.getByTestId('property-card-property-1');
      await userEvent.click(propertyCard);
      
      expect(mockNavigate).toHaveBeenCalledWith('/properties/property-1', 'property_detail_view');
    });

    it('should support keyboard navigation on property cards', async () => {
      const mockPropertySelect = vi.fn();
      renderWithProviders(
        <PropertyDashboard 
          {...defaultProps} 
          onPropertySelect={mockPropertySelect} 
        />
      );
      
      const propertyCard = screen.getByTestId('property-card-property-1');
      propertyCard.focus();
      
      await userEvent.keyboard('{Enter}');
      expect(mockPropertySelect).toHaveBeenCalledWith(mockProperties[0]);
      
      vi.clearAllMocks();
      
      await userEvent.keyboard(' '); // Space key
      expect(mockPropertySelect).toHaveBeenCalledWith(mockProperties[0]);
    });
  });

  // ================ ACCESSIBILITY TESTS ================

  describe('Accessibility', () => {
    it('should pass WCAG 2.1 AA compliance tests', async () => {
      const { container } = await testWCAGCompliance(
        <PropertyDashboard {...defaultProps} />
      );
      
      // Additional accessibility checks
      expect(screen.getByRole('main')).toHaveAttribute('aria-label', 'Property Dashboard');
      expect(screen.getByTestId('property-dashboard-search-input')).toHaveAttribute('aria-label', 'Search properties');
    });

    it('should have proper ARIA labels and roles', () => {
      renderWithProviders(<PropertyDashboard {...defaultProps} />);
      
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /refresh properties/i })).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /search properties/i })).toBeInTheDocument();
    });

    it('should support screen readers with proper labels', () => {
      renderWithProviders(<PropertyDashboard {...defaultProps} />);
      
      const propertyCard = screen.getByTestId('property-card-property-1');
      expect(propertyCard).toHaveAttribute('aria-label', 'Property at 123 Main St');
      expect(propertyCard).toHaveAttribute('role', 'button');
    });

    it('should have proper focus management', async () => {
      renderWithProviders(<PropertyDashboard {...defaultProps} />);
      
      const searchInput = screen.getByTestId('property-dashboard-search-input');
      const propertyCard = screen.getByTestId('property-card-property-1');
      
      // Test tab navigation
      await userEvent.tab();
      expect(searchInput).toHaveFocus();
      
      await userEvent.tab(); // Move to status filter
      await userEvent.tab(); // Move to sort select
      await userEvent.tab(); // Move to refresh button
      await userEvent.tab(); // Move to first property card
      
      expect(propertyCard).toHaveFocus();
    });
  });

  // ================ SECURITY TESTS ================

  describe('Security', () => {
    it('should sanitize search input to prevent XSS', async () => {
      renderWithProviders(<PropertyDashboard {...defaultProps} />);
      
      const searchInput = screen.getByTestId('property-dashboard-search-input');
      
      // Test XSS prevention
      await testXSSPrevention(
        <PropertyDashboard {...defaultProps} />,
        'Search properties'
      );
    });

    it('should include CSRF token', () => {
      renderWithProviders(<PropertyDashboard {...defaultProps} />);
      
      const csrfToken = screen.getByTestId('property-dashboard-csrf-token');
      expect(csrfToken).toHaveValue('mock-csrf-token');
    });

    it('should log security events for property access', async () => {
      const { SecurityLogger } = await import('../../utils/security');
      
      renderWithProviders(<PropertyDashboard {...defaultProps} />);
      
      const propertyCard = screen.getByTestId('property-card-property-1');
      await userEvent.click(propertyCard);
      
      expect(SecurityLogger.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'property_access',
          severity: 'low',
          userId: mockUser.id
        })
      );
    });
  });

  // ================ PERFORMANCE TESTS ================

  describe('Performance', () => {
    it('should render within performance threshold', () => {
      const renderTime = testRenderPerformance(
        <PropertyDashboard {...defaultProps} />,
        50 // 50ms threshold
      );
      
      expect(renderTime).toBeLessThan(50);
    });

    it('should not have memory leaks', async () => {
      const memoryIncrease = await testMemoryUsage(
        <PropertyDashboard {...defaultProps} />,
        10 // 10 iterations
      );
      
      // Memory increase should be minimal
      expect(memoryIncrease).toBeLessThan(100000); // 100KB threshold
    });

    it('should record performance metrics', async () => {
      const { PerformanceMonitor } = await import('../../utils/performance');
      
      renderWithProviders(<PropertyDashboard {...defaultProps} />);
      
      // Simulate component unmount to trigger performance recording
      await waitFor(() => {
        expect(PerformanceMonitor.recordMetrics).toHaveBeenCalled();
      });
    });

    it('should optimize image loading', () => {
      renderWithProviders(<PropertyDashboard {...defaultProps} />);
      
      const optimizedImages = screen.getAllByTestId('optimized-image');
      expect(optimizedImages.length).toBeGreaterThan(0);
    });
  });

  // ================ INTEGRATION TESTS ================

  describe('Integration Tests', () => {
    it('should handle complete user workflow', async () => {
      const mockPropertySelect = vi.fn();
      const mockRefresh = vi.fn();
      
      renderWithProviders(
        <PropertyDashboard 
          {...defaultProps} 
          onPropertySelect={mockPropertySelect}
          onRefresh={mockRefresh}
        />
      );
      
      // 1. Search for a property
      const searchInput = screen.getByTestId('property-dashboard-search-input');
      await userEvent.type(searchInput, 'Main');
      
      // 2. Verify filtered results
      await waitFor(() => {
        expect(screen.getByText('123 Main St')).toBeInTheDocument();
        expect(screen.queryByText('456 Oak Ave')).not.toBeInTheDocument();
      });
      
      // 3. Click on property
      const propertyCard = screen.getByTestId('property-card-property-1');
      await userEvent.click(propertyCard);
      
      // 4. Verify property selection
      expect(mockPropertySelect).toHaveBeenCalledWith(mockProperties[0]);
      
      // 5. Clear search
      await userEvent.clear(searchInput);
      
      // 6. Verify all properties shown
      await waitFor(() => {
        expect(screen.getByText('123 Main St')).toBeInTheDocument();
        expect(screen.getByText('456 Oak Ave')).toBeInTheDocument();
      });
      
      // 7. Refresh data
      const refreshButton = screen.getByTestId('property-dashboard-refresh-button');
      await userEvent.click(refreshButton);
      
      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });

    it('should handle theme changes', () => {
      const { rerender } = renderWithProviders(
        <PropertyDashboard {...defaultProps} theme="light" />
      );
      
      expect(screen.getByTestId('property-dashboard')).toHaveClass('theme-light');
      
      rerender(
        <PropertyDashboard {...defaultProps} theme="dark" />
      );
      
      expect(screen.getByTestId('property-dashboard')).toHaveClass('theme-dark');
    });

    it('should handle property data updates', () => {
      const { rerender } = renderWithProviders(
        <PropertyDashboard {...defaultProps} properties={[mockProperties[0]]} />
      );
      
      expect(screen.getByText('123 Main St')).toBeInTheDocument();
      expect(screen.queryByText('456 Oak Ave')).not.toBeInTheDocument();
      
      rerender(
        <PropertyDashboard {...defaultProps} properties={mockProperties} />
      );
      
      expect(screen.getByText('123 Main St')).toBeInTheDocument();
      expect(screen.getByText('456 Oak Ave')).toBeInTheDocument();
    });
  });

  // ================ EDGE CASES ================

  describe('Edge Cases', () => {
    it('should handle empty properties array', () => {
      renderWithProviders(<PropertyDashboard {...defaultProps} properties={[]} />);
      
      expect(screen.getByText('No Properties Found')).toBeInTheDocument();
      expect(screen.getByText('Start by adding your first property to the portfolio.')).toBeInTheDocument();
    });

    it('should handle properties with missing data', () => {
      const incompleteProperty = {
        ...mockProperties[0],
        financials: {
          ...mockProperties[0].financials,
          occupancyRate: 0
        }
      };
      
      renderWithProviders(
        <PropertyDashboard {...defaultProps} properties={[incompleteProperty]} />
      );
      
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('should handle very long property addresses', () => {
      const longAddressProperty = {
        ...mockProperties[0],
        address: {
          ...mockProperties[0].address,
          street: 'This is a very long street address that might cause layout issues if not handled properly'
        }
      };
      
      renderWithProviders(
        <PropertyDashboard {...defaultProps} properties={[longAddressProperty]} />
      );
      
      const propertyCard = screen.getByTestId('property-card-property-1');
      expect(propertyCard).toBeInTheDocument();
    });
  });
});

// ================ PROPERTY CARD TESTS ================

describe('PropertyCard Component', () => {
  const mockOnClick = vi.fn();
  
  const cardProps = {
    property: mockProperties[0],
    onClick: mockOnClick,
    user: mockUser,
    theme: 'light' as const
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render property information correctly', () => {
    renderWithProviders(<PropertyCard {...cardProps} />);
    
    expect(screen.getByText('123 Main St')).toBeInTheDocument();
    expect(screen.getByText('New York, NY 10001')).toBeInTheDocument();
    expect(screen.getByText('$550,000')).toBeInTheDocument();
    expect(screen.getByText('95%')).toBeInTheDocument();
  });

  it('should calculate monthly return correctly', () => {
    renderWithProviders(<PropertyCard {...cardProps} />);
    
    // Monthly return should be (1800 / 500000) * 100 = 0.36%
    expect(screen.getByText('0.36%')).toBeInTheDocument();
  });

  it('should show correct status styling', () => {
    renderWithProviders(<PropertyCard {...cardProps} />);
    
    const statusBadge = screen.getByText('ACTIVE');
    expect(statusBadge).toHaveClass('bg-green-100', 'text-green-800');
  });

  it('should handle click events', async () => {
    renderWithProviders(<PropertyCard {...cardProps} />);
    
    const card = screen.getByTestId('property-card-property-1');
    await userEvent.click(card);
    
    expect(mockOnClick).toHaveBeenCalledWith(mockProperties[0]);
  });

  it('should be accessible', async () => {
    const { container } = renderWithProviders(<PropertyCard {...cardProps} />);
    
    await testAccessibility(container);
    
    const card = screen.getByTestId('property-card-property-1');
    expect(card).toHaveAttribute('role', 'button');
    expect(card).toHaveAttribute('tabIndex', '0');
  });
});

// ================ MOCK PROPS TESTS ================

describe('createMockProps', () => {
  it('should create valid mock props', () => {
    const mockProps = createMockProps();
    
    expect(mockProps).toHaveProperty('user');
    expect(mockProps).toHaveProperty('properties');
    expect(mockProps).toHaveProperty('onNavigate');
    expect(mockProps.properties).toHaveLength(3);
    expect(mockProps.user).toHaveProperty('id');
    expect(typeof mockProps.onNavigate).toBe('function');
  });

  it('should create realistic mock data', () => {
    const mockProps = createMockProps();
    
    expect(mockProps.user.walletAddress).toMatch(/^0x[a-fA-F0-9]{40}$/);
    expect(mockProps.properties[0]).toHaveProperty('financials');
    expect(mockProps.properties[0].financials).toHaveProperty('currentValue');
  });
});
