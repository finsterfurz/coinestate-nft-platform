import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';

/**
 * ProtectedRoute Component
 * 
 * Protects routes that require authentication.
 * Redirects unauthenticated users to login/connect wallet.
 * 
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components to render when authenticated
 * @param {string} [props.redirectTo="/"] - Where to redirect if not authenticated
 * @param {Array<string>} [props.requiredRoles] - Required user roles for access
 * @param {boolean} [props.requireKYC=false] - Whether KYC verification is required
 */
const ProtectedRoute = ({ 
  children, 
  redirectTo = "/", 
  requiredRoles = [], 
  requireKYC = false 
}) => {
  const location = useLocation();
  
  // Check if we have auth context available
  let isAuthenticated = false;
  let isLoading = false;
  let user = null;
  
  try {
    const auth = useAuth();
    isAuthenticated = auth.isAuthenticated;
    isLoading = auth.isLoading;
    user = auth.user;
  } catch (error) {
    // Auth context not available - fall back to mock authentication
    console.warn('AuthContext not available, using mock authentication');
    
    // Mock authentication logic for development
    const mockWalletAddress = localStorage.getItem('mockWalletAddress');
    const mockKYCStatus = localStorage.getItem('mockKYCStatus') === 'verified';
    
    isAuthenticated = !!mockWalletAddress;
    user = mockWalletAddress ? {
      walletAddress: mockWalletAddress,
      kycVerified: mockKYCStatus,
      roles: ['user']
    } : null;
  }
  
  // Show loading spinner while checking authentication
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  // Redirect to home if not authenticated
  if (!isAuthenticated) {
    // Save the attempted location for redirect after login
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location }} 
        replace 
      />
    );
  }
  
  // Check role requirements
  if (requiredRoles.length > 0 && user) {
    const userRoles = user.roles || [];
    const hasRequiredRole = requiredRoles.some(role => 
      userRoles.includes(role)
    );
    
    if (!hasRequiredRole) {
      return (
        <Navigate 
          to="/" 
          state={{ 
            error: 'Insufficient permissions to access this page',
            from: location 
          }} 
          replace 
        />
      );
    }
  }
  
  // Check KYC requirements
  if (requireKYC && user && !user.kycVerified) {
    return (
      <Navigate 
        to="/kyc-required" 
        state={{ 
          message: 'KYC verification required to access this page',
          from: location 
        }} 
        replace 
      />
    );
  }
  
  // Render protected content
  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  redirectTo: PropTypes.string,
  requiredRoles: PropTypes.arrayOf(PropTypes.string),
  requireKYC: PropTypes.bool,
};

/**
 * Higher-order component for protecting routes
 * 
 * @param {ReactComponent} Component - Component to protect
 * @param {Object} protection - Protection configuration
 * @returns {ReactComponent} Protected component
 */
export const withAuth = (Component, protection = {}) => {
  const ProtectedComponent = (props) => (
    <ProtectedRoute {...protection}>
      <Component {...props} />
    </ProtectedRoute>
  );
  
  ProtectedComponent.displayName = `withAuth(${Component.displayName || Component.name})`;
  
  return ProtectedComponent;
};

/**
 * Hook for checking authentication status in components
 * 
 * @returns {Object} Authentication utilities
 */
export const useProtectedRoute = () => {
  const location = useLocation();
  
  let isAuthenticated = false;
  let user = null;
  
  try {
    const auth = useAuth();
    isAuthenticated = auth.isAuthenticated;
    user = auth.user;
  } catch (error) {
    // Fallback to mock authentication
    const mockWalletAddress = localStorage.getItem('mockWalletAddress');
    const mockKYCStatus = localStorage.getItem('mockKYCStatus') === 'verified';
    
    isAuthenticated = !!mockWalletAddress;
    user = mockWalletAddress ? {
      walletAddress: mockWalletAddress,
      kycVerified: mockKYCStatus,
      roles: ['user']
    } : null;
  }
  
  const checkPermission = (requiredRoles = [], requireKYC = false) => {
    if (!isAuthenticated) return false;
    
    // Check roles
    if (requiredRoles.length > 0 && user) {
      const userRoles = user.roles || [];
      const hasRequiredRole = requiredRoles.some(role => 
        userRoles.includes(role)
      );
      if (!hasRequiredRole) return false;
    }
    
    // Check KYC
    if (requireKYC && user && !user.kycVerified) return false;
    
    return true;
  };
  
  return {
    isAuthenticated,
    user,
    checkPermission,
    currentLocation: location,
  };
};

export default ProtectedRoute;
