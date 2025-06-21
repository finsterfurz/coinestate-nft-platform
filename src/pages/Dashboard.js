// src/pages/Dashboard.js
import React from 'react';
import { useApp } from '../context/AppContext';
import { themes } from '../utils/themes';
import { typography } from '../utils/typography';
import { LoadingSpinner } from '../components/ui';

const DashboardPage = () => {
  const { theme, connectWallet, isConnected, loading } = useApp();
  
  return (
    <div className={`min-h-screen ${themes[theme].primary}`}>
      <section className={`pt-24 pb-12 ${themes[theme].secondary}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className={`${typography.h1(theme)} mb-6`}>Dashboard</h1>
          <p className={typography.bodyLarge(theme)}>
            Connect your wallet and complete KYC to access your NFT property dashboards.
          </p>
        </div>
      </section>
      
      <section className={`py-16 ${themes[theme].primary}`}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {!isConnected ? (
            <div className={`p-8 rounded-lg border ${themes[theme].card}`}>
              <h2 className={`${typography.h3(theme)} mb-4`}>Connect Your Wallet</h2>
              <p className={`${typography.body(theme)} mb-6`}>
                Connect your MetaMask wallet to access your NFT access credentials.
              </p>
              <button
                onClick={connectWallet}
                disabled={loading}
                className={`px-8 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 mx-auto ${themes[theme].button.primary} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <span>Connect Wallet</span>
                )}
              </button>
            </div>
          ) : (
            <div className={`p-8 rounded-lg border ${themes[theme].card}`}>
              <h2 className={`${typography.h3(theme)} mb-4`}>Welcome Back!</h2>
              <p className={`${typography.body(theme)} mb-6`}>
                Your wallet is connected. Dashboard functionality will be available in the next update.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;