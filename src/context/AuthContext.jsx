import React, { createContext, useContext, useReducer, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ethers } from 'ethers';

// Contract ABIs (these will be imported from the smart-contracts/abis folder)
import { CoinEstateNFT_ABI, CoinEstateGovernance_ABI } from '../contracts/abis';
import { getContractAddress } from '../contracts/abis/addresses';

// Initial authentication state
const initialState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  walletAddress: null,
  networkId: null,
  chainId: null,
  balance: '0',
  kycStatus: 'pending',
  error: null,
  isConnecting: false,
  votingPower: 0,
  ownedNFTs: [],
  isContractsInitialized: false,
  provider: null,
  signer: null,
  nftContract: null,
  governanceContract: null,
};

// Action types
const ActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_CONNECTING: 'SET_CONNECTING',
  WALLET_CONNECTED: 'WALLET_CONNECTED',
  WALLET_DISCONNECTED: 'WALLET_DISCONNECTED',
  NETWORK_CHANGED: 'NETWORK_CHANGED',
  BALANCE_UPDATED: 'BALANCE_UPDATED',
  KYC_STATUS_UPDATED: 'KYC_STATUS_UPDATED',
  USER_DATA_UPDATED: 'USER_DATA_UPDATED',
  CONTRACTS_INITIALIZED: 'CONTRACTS_INITIALIZED',
  ERROR_OCCURRED: 'ERROR_OCCURRED',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_LOADING:
      return { ...state, isLoading: action.payload };
    
    case ActionTypes.SET_CONNECTING:
      return { ...state, isConnecting: action.payload, error: null };
    
    case ActionTypes.WALLET_CONNECTED:
      return {
        ...state,
        isAuthenticated: true,
        isLoading: false,
        isConnecting: false,
        walletAddress: action.payload.address,
        networkId: action.payload.networkId,
        chainId: action.payload.chainId,
        balance: action.payload.balance,
        user: action.payload.user,
        provider: action.payload.provider,
        signer: action.payload.signer,
        nftContract: action.payload.nftContract,
        governanceContract: action.payload.governanceContract,
        error: null,
      };
    
    case ActionTypes.WALLET_DISCONNECTED:
      return {
        ...initialState,
        isLoading: false,
      };
    
    case ActionTypes.NETWORK_CHANGED:
      return {
        ...state,
        networkId: action.payload.networkId,
        chainId: action.payload.chainId,
        nftContract: action.payload.nftContract,
        governanceContract: action.payload.governanceContract,
      };
    
    case ActionTypes.BALANCE_UPDATED:
      return { ...state, balance: action.payload };
    
    case ActionTypes.KYC_STATUS_UPDATED:
      return {
        ...state,
        kycStatus: action.payload,
        user: state.user ? { ...state.user, kycVerified: action.payload === 'verified' } : null,
      };
    
    case ActionTypes.USER_DATA_UPDATED:
      return {
        ...state,
        votingPower: action.payload.votingPower,
        ownedNFTs: action.payload.ownedNFTs,
        user: { ...state.user, ...action.payload.userData },
      };
    
    case ActionTypes.CONTRACTS_INITIALIZED:
      return { ...state, isContractsInitialized: true };
    
    case ActionTypes.ERROR_OCCURRED:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
        isConnecting: false,
      };
    
    case ActionTypes.CLEAR_ERROR:
      return { ...state, error: null };
    
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext(undefined);

// Helper function to check if MetaMask is available
const isMetaMaskAvailable = () => {
  return typeof window !== 'undefined' && window.ethereum && window.ethereum.isMetaMask;
};

// Helper function to get network name from chain ID
const getNetworkName = (chainId) => {
  const networks = {
    1: 'mainnet',
    11155111: 'sepolia',
    5: 'goerli',
    137: 'polygon',
    80001: 'mumbai',
    31337: 'localhost',
  };
  return networks[chainId] || 'unknown';
};

// Helper function to format ETH balance
const formatETH = (balance) => {
  return parseFloat(ethers.formatEther(balance)).toFixed(4);
};

// Helper function to format wallet address
const formatAddress = (address) => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

// Auth Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize contracts
  const initializeContracts = async (provider, signer, networkName) => {
    try {
      // Get contract addresses for current network
      const nftAddress = getContractAddress('CoinEstateNFT', networkName);
      const governanceAddress = getContractAddress('CoinEstateGovernance', networkName);

      // Create contract instances
      const nftContract = new ethers.Contract(nftAddress, CoinEstateNFT_ABI, signer);
      const governanceContract = new ethers.Contract(governanceAddress, CoinEstateGovernance_ABI, signer);

      return { nftContract, governanceContract };
    } catch (error) {
      console.error('Failed to initialize contracts:', error);
      throw new Error(`Failed to initialize contracts: ${error.message}`);
    }
  };

  // Check for existing wallet connection on mount
  useEffect(() => {
    const checkExistingConnection = async () => {
      try {
        if (!isMetaMaskAvailable()) {
          dispatch({ type: ActionTypes.SET_LOADING, payload: false });
          return;
        }

        // Check if already connected
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        
        if (accounts.length > 0) {
          // Auto-connect to existing connection
          await connectToWallet(false); // false = don't show connection prompt
        } else {
          dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        }
      } catch (error) {
        console.error('Error checking existing connection:', error);
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      }
    };

    checkExistingConnection();
  }, []);

  // Connect to wallet (internal function)
  const connectToWallet = async (requestConnection = true) => {
    try {
      let accounts;
      
      if (requestConnection) {
        // Request new connection
        accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      } else {
        // Use existing connection
        accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length === 0) return;
      }

      const walletAddress = accounts[0];

      // Create provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Get network info
      const network = await provider.getNetwork();
      const networkName = getNetworkName(Number(network.chainId));
      const balance = await provider.getBalance(walletAddress);

      // Initialize contracts
      const { nftContract, governanceContract } = await initializeContracts(provider, signer, networkName);

      // Get user data from contracts
      const userData = await getUserDataFromContracts(walletAddress, nftContract);

      dispatch({
        type: ActionTypes.WALLET_CONNECTED,
        payload: {
          address: walletAddress,
          networkId: networkName,
          chainId: network.chainId.toString(),
          balance: formatETH(balance),
          user: userData,
          provider,
          signer,
          nftContract,
          governanceContract,
        },
      });

      return { success: true, address: walletAddress };
    } catch (error) {
      console.error('Wallet connection failed:', error);
      
      let errorMessage = 'Failed to connect wallet';
      if (error.code === 4001) {
        errorMessage = 'Connection rejected by user';
      } else if (error.message?.includes('MetaMask')) {
        errorMessage = 'MetaMask not available. Please install MetaMask.';
      } else if (error.message?.includes('Contract')) {
        errorMessage = 'Smart contracts not deployed on this network';
      }

      dispatch({
        type: ActionTypes.ERROR_OCCURRED,
        payload: errorMessage,
      });

      return { success: false, error: errorMessage };
    }
  };

  // Public connect wallet function
  const connectWallet = async () => {
    if (!isMetaMaskAvailable()) {
      const error = 'MetaMask not installed. Please install MetaMask to continue.';
      dispatch({ type: ActionTypes.ERROR_OCCURRED, payload: error });
      return { success: false, error };
    }

    dispatch({ type: ActionTypes.SET_CONNECTING, payload: true });
    return await connectToWallet(true);
  };

  // Disconnect wallet
  const disconnectWallet = async () => {
    try {
      dispatch({ type: ActionTypes.WALLET_DISCONNECTED });
    } catch (error) {
      console.error('Disconnect failed:', error);
    }
  };

  // Switch network
  const switchNetwork = async (targetChainId) => {
    try {
      const chainIdHex = `0x${targetChainId.toString(16)}`;
      
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }],
      });

      return { success: true };
    } catch (error) {
      if (error.code === 4902) {
        // Network not added to MetaMask
        return { success: false, error: 'Network not added to MetaMask' };
      }
      
      console.error('Network switch failed:', error);
      dispatch({
        type: ActionTypes.ERROR_OCCURRED,
        payload: `Failed to switch network: ${error.message}`,
      });
      return { success: false, error: error.message };
    }
  };

  // Get user data from smart contracts
  const getUserDataFromContracts = async (address, nftContract) => {
    try {
      if (!nftContract) {
        return { kycVerified: false, votingPower: 0, ownedNFTs: [] };
      }

      // Get KYC status
      const kycVerified = await nftContract.kycVerified(address);
      
      // Get voting power
      const votingPower = await nftContract.getVotingPower(address);
      
      // Get owned NFTs (simplified - in production, you'd want to get all token details)
      const balance = await nftContract.balanceOf(address);
      const ownedNFTs = []; // TODO: Implement full NFT enumeration

      // Update KYC status in state
      dispatch({
        type: ActionTypes.KYC_STATUS_UPDATED,
        payload: kycVerified ? 'verified' : 'pending',
      });

      // Update user data
      dispatch({
        type: ActionTypes.USER_DATA_UPDATED,
        payload: {
          votingPower: votingPower.toString(),
          ownedNFTs,
          userData: { kycVerified },
        },
      });

      return {
        kycVerified,
        votingPower: votingPower.toString(),
        ownedNFTs,
        roles: ['user'],
        joinedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Failed to get user data from contracts:', error);
      return {
        kycVerified: false,
        votingPower: '0',
        ownedNFTs: [],
        roles: ['user'],
        joinedAt: new Date().toISOString(),
      };
    }
  };

  // Refresh user data
  const refreshUserData = async () => {
    if (!state.walletAddress || !state.nftContract) return;

    try {
      await getUserDataFromContracts(state.walletAddress, state.nftContract);
      
      // Also refresh balance
      if (state.provider) {
        const balance = await state.provider.getBalance(state.walletAddress);
        dispatch({ type: ActionTypes.BALANCE_UPDATED, payload: formatETH(balance) });
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
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

  // Clear error
  const clearError = () => {
    dispatch({ type: ActionTypes.CLEAR_ERROR });
  };

  // Setup wallet event listeners
  useEffect(() => {
    if (!isMetaMaskAvailable() || !state.isAuthenticated) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else if (accounts[0] !== state.walletAddress) {
        // Account changed, reconnect
        connectToWallet(false);
      }
    };

    const handleChainChanged = async (chainId) => {
      try {
        const networkName = getNetworkName(parseInt(chainId, 16));
        
        if (state.provider && state.signer) {
          const { nftContract, governanceContract } = await initializeContracts(
            state.provider, 
            state.signer, 
            networkName
          );
          
          dispatch({
            type: ActionTypes.NETWORK_CHANGED,
            payload: {
              networkId: networkName,
              chainId: chainId,
              nftContract,
              governanceContract,
            },
          });
          
          // Refresh user data after network change
          await refreshUserData();
        }
      } catch (error) {
        console.error('Chain change error:', error);
        dispatch({
          type: ActionTypes.ERROR_OCCURRED,
          payload: 'Failed to switch to new network',
        });
      }
    };

    const handleDisconnect = () => {
      disconnectWallet();
    };

    // Add event listeners
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    window.ethereum.on('disconnect', handleDisconnect);

    // Cleanup
    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('disconnect', handleDisconnect);
      }
    };
  }, [state.isAuthenticated, state.walletAddress]);

  // Auto-refresh user data every 30 seconds
  useEffect(() => {
    if (!state.isAuthenticated) return;

    const interval = setInterval(refreshUserData, 30000);
    return () => clearInterval(interval);
  }, [state.isAuthenticated, state.nftContract]);

  // Context value
  const value = {
    // State
    ...state,
    
    // Wallet actions
    connectWallet,
    disconnectWallet,
    switchNetwork,
    refreshUserData,
    
    // Utility actions
    clearError,
    
    // Role checking utilities
    hasRole,
    hasAnyRole,
    hasAllRoles,
    
    // Web3 utilities
    isMetaMaskAvailable: isMetaMaskAvailable(),
    formatETH,
    formatAddress,
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

export default AuthContext;