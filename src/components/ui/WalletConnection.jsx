import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../context/AuthContext';

const WalletConnection = ({ className = '' }) => {
  const {
    isAuthenticated,
    isConnecting,
    isLoading,
    walletAddress,
    balance,
    networkId,
    chainId,
    kycStatus,
    votingPower,
    error,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    refreshUserData,
    clearError,
    isMetaMaskAvailable,
    formatAddress,
  } = useAuth();

  const [showDetails, setShowDetails] = useState(false);
  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false);

  // Handle wallet connection
  const handleConnect = async () => {
    if (!isMetaMaskAvailable) {
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    const result = await connectWallet();
    if (result.success) {
      console.log('Wallet connected successfully');
    }
  };

  // Handle wallet disconnection
  const handleDisconnect = async () => {
    await disconnectWallet();
    setShowDetails(false);
  };

  // Handle network switch
  const handleNetworkSwitch = async (targetChainId) => {
    setIsSwitchingNetwork(true);
    try {
      await switchNetwork(targetChainId);
    } finally {
      setIsSwitchingNetwork(false);
    }
  };

  // Get network display info
  const getNetworkInfo = () => {
    if (!networkId) return { name: 'Unknown', color: 'gray', chainId: null };
    
    const networks = {
      'mainnet': { name: 'Ethereum Mainnet', color: 'green', chainId: 1 },
      'sepolia': { name: 'Sepolia Testnet', color: 'blue', chainId: 11155111 },
      'goerli': { name: 'Goerli Testnet', color: 'blue', chainId: 5 },
      'localhost': { name: 'Local Network', color: 'purple', chainId: 31337 },
      'polygon': { name: 'Polygon', color: 'purple', chainId: 137 },
      'mumbai': { name: 'Mumbai Testnet', color: 'orange', chainId: 80001 },
    };
    
    return networks[networkId] || { name: networkId, color: 'gray', chainId: null };
  };

  // Get KYC status display
  const getKYCStatusDisplay = () => {
    switch (kycStatus) {
      case 'verified':
        return { text: 'KYC Verified', color: 'green', icon: '✓' };
      case 'pending':
        return { text: 'KYC Pending', color: 'yellow', icon: '⏳' };
      case 'rejected':
        return { text: 'KYC Rejected', color: 'red', icon: '✗' };
      default:
        return { text: 'KYC Required', color: 'gray', icon: '?' };
    }
  };

  const networkInfo = getNetworkInfo();
  const kycInfo = getKYCStatusDisplay();

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-600">Loading...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className={`space-y-3 ${className}`}>
        {/* Error display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <span className="text-red-400">⚠️</span>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm text-red-700">{error}</p>
                <button
                  onClick={clearError}
                  className="mt-1 text-xs text-red-600 hover:text-red-800 underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Connection button */}
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className={`
            w-full flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-all
            ${isConnecting 
              ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
            }
          `}
        >
          {isConnecting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 mr-2"></div>
              Connecting...
            </>
          ) : (
            <>
              <span className="mr-2">🦊</span>
              {isMetaMaskAvailable ? 'Connect MetaMask' : 'Install MetaMask'}
            </>
          )}
        </button>

        {/* MetaMask installation help */}
        {!isMetaMaskAvailable && (
          <div className="text-xs text-gray-500 text-center">
            MetaMask is required to connect your wallet
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Main wallet info */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-sm font-bold">
                {walletAddress?.[2]?.toUpperCase() || 'W'}
              </span>
            </div>
            <div>
              <div className="font-medium text-gray-900">
                {formatAddress(walletAddress)}
              </div>
              <div className="text-sm text-gray-500">
                {balance} ETH
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span className={`transform transition-transform ${showDetails ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
        </div>

        {/* Network & KYC status */}
        <div className="mt-3 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1">
            <span className={`w-2 h-2 rounded-full bg-${networkInfo.color}-400`}></span>
            <span className="text-gray-600">{networkInfo.name}</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>{kycInfo.icon}</span>
            <span className={`text-${kycInfo.color}-600`}>{kycInfo.text}</span>
          </div>
        </div>
      </div>

      {/* Detailed view */}
      {showDetails && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
          {/* Voting Power */}
          <div>
            <div className="text-sm font-medium text-gray-700 mb-1">Voting Power</div>
            <div className="text-lg font-bold text-blue-600">{votingPower} votes</div>
          </div>

          {/* Network info */}
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">Network</div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{networkInfo.name}</span>
              {networkId !== 'mainnet' && (
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleNetworkSwitch(1)}
                    disabled={isSwitchingNetwork}
                    className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 disabled:opacity-50"
                  >
                    Mainnet
                  </button>
                  <button
                    onClick={() => handleNetworkSwitch(11155111)}
                    disabled={isSwitchingNetwork}
                    className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 disabled:opacity-50"
                  >
                    Sepolia
                  </button>
                  <button
                    onClick={() => handleNetworkSwitch(31337)}
                    disabled={isSwitchingNetwork}
                    className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200 disabled:opacity-50"
                  >
                    Local
                  </button>
                </div>
              )}
            </div>
            {isSwitchingNetwork && (
              <div className="text-xs text-blue-600 mt-1">Switching network...</div>
            )}
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            <button
              onClick={refreshUserData}
              className="flex-1 text-sm bg-blue-50 text-blue-700 px-3 py-2 rounded hover:bg-blue-100 transition-colors"
            >
              🔄 Refresh
            </button>
            <button
              onClick={handleDisconnect}
              className="flex-1 text-sm bg-red-50 text-red-700 px-3 py-2 rounded hover:bg-red-100 transition-colors"
            >
              🔌 Disconnect
            </button>
          </div>

          {/* Additional info */}
          <div className="text-xs text-gray-500 space-y-1">
            <div>Chain ID: {chainId}</div>
            <div>Address: {walletAddress}</div>
            {networkInfo.chainId && (
              <div>Network ID: {networkInfo.chainId}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

WalletConnection.propTypes = {
  className: PropTypes.string,
};

export default WalletConnection;