/**
 * Enhanced Property Dashboard Component
 * Demonstrates integration of all enterprise frameworks:
 * - TypeScript with enhanced types
 * - Security framework with validation
 * - Performance optimization with monitoring
 * - Accessibility compliance
 * - Comprehensive testing support
 */

import React, { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

// Enhanced Types
import type { 
  Property, 
  User, 
  ComponentBaseProps, 
  ThemeProps, 
  NavigationProps,
  LoadingProps,
  ErrorProps 
} from '../../types/enhanced';

// Security Framework
import { 
  validateAndSanitize, 
  ValidationSchemas, 
  SecurityLogger,
  CSRFProtection 
} from '../../utils/security';

// Performance Framework
import { 
  OptimizedImage, 
  PerformanceMonitor,
  useOptimizedCallback,
  useMemoryOptimized,
  withPerformanceTracking 
} from '../../utils/performance';

// Testing Support
import { createMockProperty, createMockUser } from '../../__tests__/setup/testUtils';

// Styles
import styles from './PropertyDashboard.module.css';
import animations from '../../styles/animations.module.css';

// ================ INTERFACES ================

interface PropertyDashboardProps extends ComponentBaseProps, ThemeProps, NavigationProps, LoadingProps, ErrorProps {
  user: User;
  properties: Property[];
  onPropertySelect?: (property: Property) => void;
  onRefresh?: () => Promise<void>;
  enableRealTimeUpdates?: boolean;
  showAnalytics?: boolean;
}

interface PropertyCardProps extends ComponentBaseProps, ThemeProps {
  property: Property;
  onClick: (property: Property) => void;
  user: User;
}

interface FilterState {
  status: string;
  type: string;
  searchTerm: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

// ================ SUB-COMPONENTS ================

/**
 * Optimized Property Card with performance tracking
 */
const PropertyCard: React.FC<PropertyCardProps> = memo(({ 
  property, 
  onClick, 
  user, 
  theme = 'light',
  className = '',
  testId,
  ariaLabel 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Optimized click handler
  const handleClick = useOptimizedCallback(() => {
    // Security: Log user interaction
    SecurityLogger.logEvent({
      type: 'user_interaction',
      severity: 'low',
      userId: user.id,
      details: { 
        action: 'property_card_click', 
        propertyId: property.id,
        timestamp: new Date().toISOString()
      },
      ipAddress: '', // Would be populated by backend
      userAgent: navigator.userAgent,
      resolved: true
    });

    onClick(property);
  }, [property, user.id, onClick]);

  // Performance: Memoized property calculations
  const propertyMetrics = useMemoryOptimized(() => ({
    monthlyReturn: ((property.financials.netCashFlow / property.financials.acquisitionPrice) * 100).toFixed(2),
    occupancyColor: property.financials.occupancyRate >= 95 ? 'text-green-600' : 
                   property.financials.occupancyRate >= 85 ? 'text-yellow-600' : 'text-red-600',
    statusColor: property.status === 'active' ? 'bg-green-100 text-green-800' :
                property.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800',
    imageUrl: property.multimedia?.[0]?.url || '/images/property-placeholder.jpg'
  }), [property]);

  return (
    <div
      className={`
        ${styles.propertyCard}
        ${styles[`theme-${theme}`]}
        ${animations.fadeIn}
        ${className}
        transform transition-all duration-300 hover:scale-105 hover:shadow-lg
        ${isHovered ? 'shadow-xl' : 'shadow-md'}
      `}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel || `Property at ${property.address.street}`}
      data-testid={testId || `property-card-${property.id}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Property Image with Optimization */}
      <div className="relative h-48 overflow-hidden rounded-t-lg">
        <OptimizedImage
          src={propertyMetrics.imageUrl}
          alt={`Property at ${property.address.street}`}
          width={400}
          height={200}
          className="w-full h-full object-cover"
          onLoad={() => setImageLoaded(true)}
        />
        
        {/* Status Badge */}
        <div className={`
          absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium
          ${propertyMetrics.statusColor}
        `}>
          {property.status.replace('_', ' ').toUpperCase()}
        </div>

        {/* Performance Overlay */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Property Details */}
      <div className="p-4">
        {/* Address */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
          {property.address.street}
        </h3>
        <p className="text-sm text-gray-600 mb-3">
          {property.address.city}, {property.address.state} {property.address.postalCode}
        </p>

        {/* Financial Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Monthly Return</p>
            <p className="text-lg font-bold text-green-600">{propertyMetrics.monthlyReturn}%</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Occupancy</p>
            <p className={`text-lg font-bold ${propertyMetrics.occupancyColor}`}>
              {property.financials.occupancyRate}%
            </p>
          </div>
        </div>

        {/* Property Type and Value */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {property.type.replace('_', ' ').toUpperCase()}
          </span>
          <span className="text-lg font-bold text-gray-900">
            ${property.financials.currentValue.toLocaleString()}
          </span>
        </div>

        {/* Governance Info */}
        {property.governance && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Active Voters: {property.governance.activeVoters}</span>
              <span>Proposals: {property.governance.proposalCount}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

PropertyCard.displayName = 'PropertyCard';

PropertyCard.propTypes = {
  property: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
  theme: PropTypes.oneOf(['light', 'dark', 'blue']),
  className: PropTypes.string,
  testId: PropTypes.string,
  ariaLabel: PropTypes.string
};

// ================ MAIN COMPONENT ================

/**
 * Main Property Dashboard Component
 */
const PropertyDashboard: React.FC<PropertyDashboardProps> = ({
  user,
  properties: initialProperties,
  onPropertySelect,
  onRefresh,
  onNavigate,
  theme = 'light',
  isLoading = false,
  error,
  retry,
  enableRealTimeUpdates = false,
  showAnalytics = true,
  className = '',
  testId = 'property-dashboard',
  ariaLabel = 'Property Dashboard'
}) => {
  const navigate = useNavigate();

  // ================ STATE MANAGEMENT ================

  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>(initialProperties);
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    type: 'all',
    searchTerm: '',
    sortBy: 'currentValue',
    sortOrder: 'desc'
  });
  const [csrfToken, setCsrfToken] = useState<string>('');

  // ================ SECURITY IMPLEMENTATION ================

  // Initialize CSRF protection
  useEffect(() => {
    const sessionId = localStorage.getItem('sessionId') || 'demo-session';
    const token = CSRFProtection.generateToken(sessionId);
    setCsrfToken(token);
  }, []);

  // ================ PERFORMANCE MONITORING ================

  // Track component performance
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      PerformanceMonitor.recordMetrics({
        pageLoadTime: endTime - startTime,
        component: 'PropertyDashboard'
      } as any);
    };
  }, []);

  // ================ SEARCH AND FILTERING ================

  // Optimized search handler with validation
  const handleSearchChange = useOptimizedCallback(async (searchTerm: string) => {
    // Security: Validate and sanitize search input
    const validationResult = validateAndSanitize(
      searchTerm, 
      ValidationSchemas.username // Using username schema for basic string validation
    );

    if (!validationResult.isValid) {
      console.warn('Invalid search input:', validationResult.errors);
      return;
    }

    const sanitizedSearchTerm = validationResult.sanitizedData || '';
    
    setFilters(prev => ({ ...prev, searchTerm: sanitizedSearchTerm }));
  }, []);

  // Optimized filter handler
  const handleFilterChange = useOptimizedCallback((key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // Memoized filtered and sorted properties
  const filteredAndSortedProperties = useMemoryOptimized(() => {
    let filtered = properties;

    // Apply filters
    if (filters.status !== 'all') {
      filtered = filtered.filter(p => p.status === filters.status);
    }

    if (filters.type !== 'all') {
      filtered = filtered.filter(p => p.type === filters.type);
    }

    if (filters.searchTerm) {
      filtered = filtered.filter(p =>
        p.address.street.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        p.address.city.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a.financials[filters.sortBy as keyof typeof a.financials] as number;
      const bValue = b.financials[filters.sortBy as keyof typeof b.financials] as number;
      
      return filters.sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return filtered;
  }, [properties, filters]);

  // Update filtered properties when filters change
  useEffect(() => {
    setFilteredProperties(filteredAndSortedProperties);
  }, [filteredAndSortedProperties]);

  // ================ EVENT HANDLERS ================

  const handlePropertyClick = useOptimizedCallback((property: Property) => {
    // Security: Log property access
    SecurityLogger.logEvent({
      type: 'property_access',
      severity: 'low',
      userId: user.id,
      details: { propertyId: property.id, action: 'view' },
      ipAddress: '',
      userAgent: navigator.userAgent,
      resolved: true
    });

    // Performance: Track user interaction
    PerformanceMonitor.recordMetrics({
      userInteraction: 'property_click',
      timestamp: Date.now()
    } as any);

    if (onPropertySelect) {
      onPropertySelect(property);
    } else {
      onNavigate(`/properties/${property.id}`, 'property_detail_view');
    }
  }, [user.id, onPropertySelect, onNavigate]);

  const handleRefresh = useOptimizedCallback(async () => {
    if (onRefresh) {
      try {
        await onRefresh();
      } catch (error) {
        console.error('Failed to refresh properties:', error);
      }
    }
  }, [onRefresh]);

  // ================ REAL-TIME UPDATES ================

  useEffect(() => {
    if (!enableRealTimeUpdates) return;

    const interval = setInterval(async () => {
      // In production, this would connect to WebSocket or poll API
      console.log('Checking for property updates...');
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [enableRealTimeUpdates]);

  // ================ ERROR HANDLING ================

  if (error) {
    return (
      <div 
        className={`${styles.errorContainer} ${className}`}
        data-testid={`${testId}-error`}
        role="alert"
        aria-label="Error loading properties"
      >
        <div className="text-center py-12">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Failed to Load Properties
          </h3>
          <p className="text-gray-600 mb-4">
            {typeof error === 'string' ? error : 'An unexpected error occurred'}
          </p>
          {retry && (
            <button
              onClick={retry}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              data-testid={`${testId}-retry-button`}
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  // ================ LOADING STATE ================

  if (isLoading) {
    return (
      <div 
        className={`${styles.loadingContainer} ${className}`}
        data-testid={`${testId}-loading`}
        aria-label="Loading properties"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-lg"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-8 bg-gray-200 rounded"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ================ MAIN RENDER ================

  return (
    <div 
      className={`
        ${styles.propertyDashboard}
        ${styles[`theme-${theme}`]}
        ${animations.fadeIn}
        ${className}
      `}
      data-testid={testId}
      aria-label={ariaLabel}
      role="main"
    >
      {/* Dashboard Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">
            Property Portfolio
          </h1>
          
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            data-testid={`${testId}-refresh-button`}
            aria-label="Refresh properties"
          >
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Portfolio Summary */}
        {showAnalytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-500">Total Properties</p>
              <p className="text-2xl font-bold text-gray-900">{properties.length}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-500">Total Value</p>
              <p className="text-2xl font-bold text-green-600">
                ${properties.reduce((sum, p) => sum + p.financials.currentValue, 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-500">Monthly Income</p>
              <p className="text-2xl font-bold text-blue-600">
                ${properties.reduce((sum, p) => sum + p.financials.netCashFlow, 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-500">Avg Occupancy</p>
              <p className="text-2xl font-bold text-purple-600">
                {(properties.reduce((sum, p) => sum + p.financials.occupancyRate, 0) / properties.length).toFixed(1)}%
              </p>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search properties by address..."
              value={filters.searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              data-testid={`${testId}-search-input`}
              aria-label="Search properties"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            data-testid={`${testId}-status-filter`}
            aria-label="Filter by status"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="maintenance">Maintenance</option>
            <option value="acquisition">Acquisition</option>
          </select>

          {/* Sort */}
          <select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-');
              setFilters(prev => ({ ...prev, sortBy, sortOrder: sortOrder as 'asc' | 'desc' }));
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            data-testid={`${testId}-sort-select`}
            aria-label="Sort properties"
          >
            <option value="currentValue-desc">Value (High to Low)</option>
            <option value="currentValue-asc">Value (Low to High)</option>
            <option value="netCashFlow-desc">Income (High to Low)</option>
            <option value="occupancyRate-desc">Occupancy (High to Low)</option>
          </select>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map(property => (
          <PropertyCard
            key={property.id}
            property={property}
            onClick={handlePropertyClick}
            user={user}
            theme={theme}
            testId={`property-card-${property.id}`}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredProperties.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🏠</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Properties Found
          </h3>
          <p className="text-gray-600">
            {filters.searchTerm || filters.status !== 'all' 
              ? 'Try adjusting your filters or search terms.'
              : 'Start by adding your first property to the portfolio.'
            }
          </p>
        </div>
      )}

      {/* Security Token (Hidden) */}
      <input 
        type="hidden" 
        name="csrf_token" 
        value={csrfToken}
        data-testid={`${testId}-csrf-token`}
      />
    </div>
  );
};

PropertyDashboard.displayName = 'PropertyDashboard';

PropertyDashboard.propTypes = {
  user: PropTypes.object.isRequired,
  properties: PropTypes.array.isRequired,
  onPropertySelect: PropTypes.func,
  onRefresh: PropTypes.func,
  onNavigate: PropTypes.func.isRequired,
  theme: PropTypes.oneOf(['light', 'dark', 'blue']),
  isLoading: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Error)]),
  retry: PropTypes.func,
  enableRealTimeUpdates: PropTypes.bool,
  showAnalytics: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string,
  ariaLabel: PropTypes.string
};

// ================ PERFORMANCE TRACKING ================

const EnhancedPropertyDashboard = withPerformanceTracking(
  PropertyDashboard,
  'PropertyDashboard'
);

// ================ MOCK DATA FOR DEMO ================

export const createMockProps = (): PropertyDashboardProps => ({
  user: createMockUser(),
  properties: [
    createMockProperty({ id: '1' }),
    createMockProperty({ id: '2', status: 'maintenance' }),
    createMockProperty({ id: '3', type: 'commercial_office' })
  ],
  onNavigate: (route: string, event?: string) => {
    console.log('Navigate to:', route, 'Event:', event);
  },
  theme: 'light',
  isLoading: false,
  enableRealTimeUpdates: true,
  showAnalytics: true
});

export default EnhancedPropertyDashboard;
export { PropertyCard, type PropertyDashboardProps, type PropertyCardProps };
