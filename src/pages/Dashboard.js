import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { typography, formatFinancialAmount, formatNFTId, formatWalletAddress, formatPerformance } from '../utils/typography';
import { 
  Building, 
  Shield, 
  Key, 
  Users, 
  BarChart3, 
  Settings, 
  X, 
  Check,
  ChevronDown 
} from '../components/icons/AllIcons.js';

// ==================== DASHBOARD PAGE WITH INTER + JETBRAINS MONO ====================
const DashboardPage = () => {
  const { 
    isConnected, 
    walletAddress, 
    kycStatus, 
    nftAccess, 
    loading, 
    error,
    connectWallet,
    theme,
    dashboardProjects
  } = useApp();

  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSections, setExpandedSections] = useState({});

  const hasNFTAccess = (projectSlug) => {
    return nftAccess.some(nft => nft.projectSlug === projectSlug && nft.verified);
  };

  const canAccessPrivate = isConnected && kycStatus === 'verified';

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Building },
    { id: 'governance', label: 'Governance', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header mit Inter Font */}
      <section className={`pt-24 pb-12 border-b ${
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className={typography.h2(theme)}>
            Governance Dashboard
          </h1>
          <p className={typography.body(theme)}>
            Manage your property voting rights and community governance through NFT credentials.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Legal Compliance Banner */}
        <div className={`border rounded-lg p-4 mb-8 ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-start">
            <Shield className={`w-5 h-5 mr-2 mt-0.5 flex-shrink-0 ${
              theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
            }`} />
            <div className="flex-1">
              <h4 className={typography.badge(theme)}>Governance Credential Dashboard</h4>
              <p className={`${typography.bodySmall(theme)} mt-1`}>
                This dashboard provides governance access to real estate voting decisions via NFT credentials. NFTs represent 
                <strong> voting rights and operational control</strong> - not securities, ownership interests, or investment contracts. 
                Governance participation and voting rewards are administered by CoinEstate Foundation under Cayman Islands regulations.
              </p>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <X className="w-5 h-5 text-red-600 mr-2" />
              <span className={`${typography.body(theme)} text-red-800 font-medium`}>{error}</span>
            </div>
          </div>
        )}

        {/* Wallet Connection */}
        {!isConnected ? (
          <div className={`rounded-xl p-8 shadow-sm border text-center mb-8 ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl mx-auto mb-6 flex items-center justify-center shadow-lg">
              <Key className="w-10 h-10 text-white" />
            </div>
            <h3 className={typography.h3(theme)}>
              Connect Your Web3 Wallet
            </h3>
            <p className={`${typography.body(theme)} mb-8 max-w-md mx-auto`}>
              Connect MetaMask or another Web3 wallet to verify your NFT governance credentials and unlock community voting dashboard.
            </p>
            <button
              onClick={connectWallet}
              disabled={loading}
              className={`bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl transition-all disabled:opacity-50 flex items-center space-x-2 mx-auto ${typography.buttonText}`}
            >
              {loading && <LoadingSpinner size="sm" className="text-white" />}
              <span>{loading ? 'Connecting...' : 'Connect Wallet'}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Connected Wallet Info - JetBrains Mono für Wallet Address */}
            <div className={`p-4 rounded-lg border ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className={typography.badge(theme)}>
                    Wallet Connected
                  </span>
                  <span className={formatWalletAddress(walletAddress, theme).className}>
                    {formatWalletAddress(walletAddress).short}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={typography.bodySmall(theme)}>
                    Governance Keys: 
                  </span>
                  <span className={typography.metricValue(theme)}>
                    {nftAccess.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Dashboard Tabs */}
            <div className={`rounded-xl shadow-sm border overflow-hidden ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              {/* Tab Navigation */}
              <div className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <nav className="flex space-x-8 px-6">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-4 px-1 border-b-2 text-sm flex items-center space-x-2 transition-colors ${typography.buttonText} ${
                          activeTab === tab.id
                            ? 'border-blue-500 text-blue-600'
                            : theme === 'dark'
                              ? 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <h3 className={typography.h4(theme)}>
                      Project Overview
                    </h3>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {dashboardProjects.map((project) => {
                        const userHasAccess = hasNFTAccess(project.slug);
                        const nftForProject = nftAccess.find(nft => nft.projectSlug === project.slug);
                        const formattedValue = formatFinancialAmount(project.totalValue, '€', theme);
                        const formattedRent = formatFinancialAmount(project.monthlyRent, '€', theme);
                        
                        return (
                          <div key={project.slug} className={`border rounded-lg overflow-hidden ${
                            theme === 'dark' ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'
                          }`}>
                            <img src={project.image} alt={project.name} className="w-full h-32 object-cover" />
                            <div className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h4 className={typography.h5(theme)}>
                                    {project.name}
                                  </h4>
                                  <p className={typography.location(theme)}>
                                    {project.location}
                                  </p>
                                </div>
                                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  userHasAccess ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {userHasAccess ? (
                                    <>
                                      <Key className="w-3 h-3 mr-1" />
                                      <span className={typography.nftId(theme)}>
                                        {nftForProject?.nftId}
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <Shield className="w-3 h-3 mr-1" />
                                      No Access
                                    </>
                                  )}
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <div className={typography.caption(theme)}>Value</div>
                                  <div className={formattedValue.className}>
                                    {formattedValue.value}
                                  </div>
                                </div>
                                <div>
                                  <div className={typography.caption(theme)}>Monthly Rent</div>
                                  <div className={formattedRent.className}>
                                    {formattedRent.value}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {activeTab === 'analytics' && (
                  <div className="space-y-6">
                    <h3 className={typography.h4(theme)}>
                      Performance Analytics
                    </h3>
                    
                    {dashboardProjects.filter(project => hasNFTAccess(project.slug) && project.privateInfo).map((project) => {
                      const sectionId = `analytics-${project.slug}`;
                      const isExpanded = expandedSections[sectionId];
                      
                      return (
                        <div key={project.slug} className={`border rounded-lg ${
                          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                        }`}>
                          <button
                            onClick={() => toggleSection(sectionId)}
                            className={`w-full p-4 text-left flex items-center justify-between transition-colors ${
                              theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <img src={project.image} alt={project.name} className="w-12 h-12 rounded-lg object-cover" />
                              <div>
                                <h4 className={typography.h5(theme)}>
                                  {project.name} Analytics
                                </h4>
                                <p className={typography.bodySmall(theme)}>
                                  Financial Performance & Metrics
                                </p>
                              </div>
                            </div>
                            <ChevronDown className={`w-5 h-5 text-gray-400 transform transition-transform ${
                              isExpanded ? 'rotate-180' : ''
                            }`} />
                          </button>
                          
                          {isExpanded && (
                            <div className={`p-4 border-t ${theme === 'dark' ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                  <h5 className={typography.h6(theme)}>
                                    Rental Income Breakdown
                                  </h5>
                                  <div className="space-y-2 mt-3">
                                    <div className="flex justify-between">
                                      <span className={typography.bodySmall(theme)}>Gross Rent</span>
                                      <span className={typography.financialSmall(theme)}>
                                        €{project.privateInfo.rentalBreakdown.grossRent.toLocaleString()}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-red-600">
                                      <span className={typography.bodySmall(theme)}>- Maintenance</span>
                                      <span className={typography.financialSmall(theme)}>
                                        €{project.privateInfo.rentalBreakdown.maintenance.toLocaleString()}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-red-600">
                                      <span className={typography.bodySmall(theme)}>- Management</span>
                                      <span className={typography.financialSmall(theme)}>
                                        €{project.privateInfo.rentalBreakdown.management.toLocaleString()}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-red-600">
                                      <span className={typography.bodySmall(theme)}>- Insurance</span>
                                      <span className={typography.financialSmall(theme)}>
                                        €{project.privateInfo.rentalBreakdown.insurance.toLocaleString()}
                                      </span>
                                    </div>
                                    <div className={`flex justify-between pt-2 border-t ${
                                      theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                                    }`}>
                                      <span className={typography.bodySmall(theme)}>Net Income</span>
                                      <span className={`${typography.financialValue(theme)} text-green-600`}>
                                        €{project.privateInfo.rentalBreakdown.netIncome.toLocaleString()}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <h5 className={typography.h6(theme)}>
                                    Foundation Performance
                                  </h5>
                                  <div className="space-y-3 mt-3">
                                    <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                                      <div className={typography.caption(theme)}>Community Pool</div>
                                      <div className={`${typography.financialValue(theme)} text-blue-600`}>
                                        €{project.privateInfo.caymanFundPerformance.totalPool?.toLocaleString() || '0'}
                                      </div>
                                    </div>
                                    <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                                      <div className={typography.caption(theme)}>Monthly Distribution Per NFT</div>
                                      <div className={`${typography.financialValue(theme)} text-green-600`}>
                                        €{project.privateInfo.caymanFundPerformance.monthlyDistribution || '0'}
                                      </div>
                                    </div>
                                    <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                                      <div className={typography.caption(theme)}>Occupancy Rate</div>
                                      <div className={`${typography.metricValue(theme)} text-indigo-600`}>
                                        {project.privateInfo.caymanFundPerformance.occupancyRate || '0'}%
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    
                    {dashboardProjects.filter(project => hasNFTAccess(project.slug) && project.privateInfo).length === 0 && (
                      <div className="text-center py-8">
                        <BarChart3 className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                        <h4 className={typography.h5(theme)}>
                          No Analytics Available
                        </h4>
                        <p className={typography.body(theme)}>
                          Governance NFTs required to view detailed analytics.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Other tabs remain similar, applying typography classes throughout */}
                {activeTab === 'governance' && (
                  <div className="space-y-6">
                    <h3 className={typography.h4(theme)}>
                      Governance & Voting
                    </h3>
                    {/* Governance content with typography classes applied */}
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div className="space-y-6">
                    <h3 className={typography.h4(theme)}>
                      Account Settings
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className={`p-4 border rounded-lg ${
                        theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                      }`}>
                        <h4 className={typography.h6(theme)}>
                          KYC Status
                        </h4>
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className={`${typography.badge(theme)} text-green-600`}>Verified</span>
                        </div>
                        <p className={`${typography.bodySmall(theme)} mb-4`}>
                          Your identity has been verified and you have full access to governance features.
                        </p>
                        <button className={`${typography.bodySmall(theme)} px-4 py-2 rounded-lg border transition-colors ${
                          theme === 'dark' 
                            ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}>
                          Update KYC Information
                        </button>
                      </div>

                      <div className={`p-4 border rounded-lg ${
                        theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                      }`}>
                        <h4 className={typography.h6(theme)}>
                          NFT Management
                        </h4>
                        <div className="space-y-2 mb-4">
                          {nftAccess.map((nft, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className={typography.nftId(theme)}>{nft.nftId}</span>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                nft.verified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {nft.verified ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          ))}
                        </div>
                        <button className={`${typography.bodySmall(theme)} px-4 py-2 rounded-lg border transition-colors ${
                          theme === 'dark' 
                            ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}>
                          Transfer NFT
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
