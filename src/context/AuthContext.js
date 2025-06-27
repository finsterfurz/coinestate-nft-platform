import React, { createContext, useContext, useReducer, useEffect } from 'react';
import PropTypes from 'prop-types';

// Initial authentication state
const initialState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  walletAddress: null,
  networkId: null,
  kycStatus: 'pending', // 'pending', 'verified', 'rejected', 'required'
  error: null,
  isConnecting: false,
};

// Action types
const ActionTypes = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_ERROR: 'LOGIN_ERROR',
  LOGOUT: 'LOGOUT',
  SET_KYC_STATUS: 'SET_KYC_STATUS',
  SET_NETWORK: 'SET_NETWORK',
  SET_CONNECTING: 'SET_CONNECTING',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    
    case ActionTypes.SET_CONNECTING:
      return {
        ...state,
        isConnecting: action.payload,
        error: null,
      };
    
    case ActionTypes.LOGIN_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        isLoading: false,
        isConnecting: false,
        user: action.payload.user,
        walletAddress: action.payload.walletAddress,
        networkId: action.payload.networkId,
        error: null,
      };
    
    case ActionTypes.LOGIN_ERROR:
      return {
        ...state,
        isAuthenticated: false,
        isLoading: false,
        isConnecting: false,
        user: null,
        walletAddress: null,
        error: action.payload,
      };
    
    case ActionTypes.LOGOUT:
      return {
        ...initialState,
        isLoading: false,
      };
    
    case ActionTypes.SET_KYC_STATUS:
      return {
        ...state,
        kycStatus: action.payload,
        user: state.user ? {
          ...state.user,
          kycVerified: action.payload === 'verified',
        } : null,
      };
    
    case ActionTypes.SET_NETWORK:
      return {
        ...state,
        networkId: action.payload,
      };
    
    case ActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext(undefined);

// Auth Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  
  // Check for existing authentication on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Check for stored wallet address (mock implementation)
        const storedWalletAddress = localStorage.getItem('mockWalletAddress');
        const storedKYCStatus = localStorage.getItem('mockKYCStatus') || 'pending';
        
        if (storedWalletAddress) {
          const userData = {
            walletAddress: storedWalletAddress,
            kycVerified: storedKYCStatus === 'verified',
            roles: ['user'],
            joinedAt: new Date().toISOString(),
          };
          
          dispatch({
            type: ActionTypes.LOGIN_SUCCESS,
            payload: {
              user: userData,
              walletAddress: storedWalletAddress,
              networkId: 1, // Mainnet by default
            },
          });
          
          dispatch({
            type: ActionTypes.SET_KYC_STATUS,
            payload: storedKYCStatus,
          });
        } else {
          dispatch({
            type: ActionTypes.SET_LOADING,
            payload: false,
          });
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        dispatch({
          type: ActionTypes.LOGIN_ERROR,
          payload: 'Failed to check authentication status',
        });
      }
    };
    
    checkAuthStatus();
  }, []);
  
  // Mock wallet connection function
  const connectWallet = async () => {
    dispatch({ type: ActionTypes.SET_CONNECTING, payload: true });
    
    try {
      // Simulate wallet connection delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock wallet connection
      const mockWalletAddress = '0x' + Math.random().toString(16).substr(2, 40);
      const mockKYCStatus = Math.random() > 0.5 ? 'verified' : 'pending';
      
      // Store in localStorage for persistence
      localStorage.setItem('mockWalletAddress', mockWalletAddress);
      localStorage.setItem('mockKYCStatus', mockKYCStatus);
      
      const userData = {
        walletAddress: mockWalletAddress,
        kycVerified: mockKYCStatus === 'verified',
        roles: ['user'],
        joinedAt: new Date().toISOString(),
      };
      
      dispatch({
        type: ActionTypes.LOGIN_SUCCESS,
        payload: {
          user: userData,
          walletAddress: mockWalletAddress,
          networkId: 1,
        },
      });
      
      dispatch({
        type: ActionTypes.SET_KYC_STATUS,
        payload: mockKYCStatus,
      });
      
      return { success: true };
    } catch (error) {
      dispatch({
        type: ActionTypes.LOGIN_ERROR,
        payload: error.message || 'Failed to connect wallet',
      });
      return { success: false, error: error.message };
    }
  };
  
  // Disconnect wallet function
  const disconnectWallet = () => {
    localStorage.removeItem('mockWalletAddress');
    localStorage.removeItem('mockKYCStatus');
    dispatch({ type: ActionTypes.LOGOUT });
  };
  
  // Update KYC status
  const updateKYCStatus = (status) => {
    localStorage.setItem('mockKYCStatus', status);
    dispatch({
      type: ActionTypes.SET_KYC_STATUS,
      payload: status,
    });
  };
  
  // Clear error
  const clearError = () => {
    dispatch({ type: ActionTypes.CLEAR_ERROR });
  };
  
  // Check if user has specific role
  const hasRole = (role) => {
    return state.user?.roles?.includes(role) || false;
  };
  
  // Check if user has any of the specified roles
  const hasAnyRole = (roles) => {
    return roles.some(role => hasRole(role));
  };
  
  // Check if user has all specified roles
  const hasAllRoles = (roles) => {
    return roles.every(role => hasRole(role));
  };
  
  // Context value
  const value = {
    // State
    ...state,
    
    // Actions
    connectWallet,
    disconnectWallet,
    updateKYCStatus,
    clearError,
    
    // Utilities
    hasRole,
    hasAnyRole,
    hasAllRoles,
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// Higher-order component for providing auth context
export const withAuth = (Component) => {
  const AuthenticatedComponent = (props) => (
    <AuthProvider>
      <Component {...props} />
    </AuthProvider>
  );
  
  AuthenticatedComponent.displayName = `withAuth(${Component.displayName || Component.name})`;
  
  return AuthenticatedComponent;
};

// Utility function to get mock wallet address
export const getMockWalletAddress = () => {
  return localStorage.getItem('mockWalletAddress');
};

// Utility function to check if user is authenticated (for use outside components)
export const isUserAuthenticated = () => {
  return !!localStorage.getItem('mockWalletAddress');
};

export default AuthContext;
