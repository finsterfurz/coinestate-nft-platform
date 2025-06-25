import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
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
} from '../components/icons/AllIcons';

// ==================== DASHBOARD PAGE ====================
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
      {/* Header */}
      <section className={`pt-24 pb-12 border-b ${
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Governance Dashboard
          </h1>
          <p className={`mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
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
              <h4 className={`text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-blue-300' : 'text-blue-900'
              }`}>Governance Credential Dashboard</h4>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-blue-200' : 'text-blue-700'
              }`}>
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
              <span className="text-red-800 font-medium">{error}</span>
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
            <h3 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Connect Your Web3 Wallet
            </h3>
            <p className={`mb-8 max-w-md mx-auto ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Connect MetaMask or another Web3 wallet to verify your NFT governance credentials and unlock community voting dashboard.
            </p>
            <button
              onClick={connectWallet}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center space-x-2 mx-auto"
            >
              {loading && <LoadingSpinner size="sm" className="text-white" />}
              <span>{loading ? 'Connecting...' : 'Connect Wallet'}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Connected Wallet Info */}
            <div className={`p-4 rounded-lg border ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-green-800'
                  }`}>
                    Wallet Connected
                  </span>
                  <span className={`text-xs font-mono ${
                    theme === 'dark' ? 'text-gray-400' : 'text-green-600'
                  }`}>
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-green-700'}`}>
                    Governance Keys: {nftAccess.length}
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
                        className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
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
                    <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Project Overview
                    </h3>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {dashboardProjects.map((project) => {
                        const userHasAccess = hasNFTAccess(project.slug);
                        const nftForProject = nftAccess.find(nft => nft.projectSlug === project.slug);
                        
                        return (
                          <div key={project.slug} className={`border rounded-lg overflow-hidden ${
                            theme === 'dark' ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'
                          }`}>
                            <img src={project.image} alt={project.name} className="w-full h-32 object-cover" />
                            <div className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    {project.name}
                                  </h4>
                                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {project.location}
                                  </p>
                                </div>
                                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  userHasAccess ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {userHasAccess ? (
                                    <>
                                      <Key className="w-3 h-3 mr-1" />
                                      {nftForProject?.nftId}
                                    </>
                                  ) : (
                                    <>
                                      <Shield className="w-3 h-3 mr-1" />
                                      No Access
                                    </>
                                  )}
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <div className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Value</div>
                                  <div className="font-semibold">€{(project.totalValue / 1000000).toFixed(1)}M</div>
                                </div>
                                <div>
                                  <div className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Monthly Rent</div>
                                  <div className="font-semibold">€{project.monthlyRent.toLocaleString()}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {activeTab === 'governance' && (
                  <div className="space-y-6">
                    <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Governance & Voting
                    </h3>
                    
                    {dashboardProjects.filter(project => hasNFTAccess(project.slug)).map((project) => {
                      const sectionId = `governance-${project.slug}`;
                      const isExpanded = expandedSections[sectionId];
                      const nftForProject = nftAccess.find(nft => nft.projectSlug === project.slug);
                      
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
                                <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                  {project.name}
                                </h4>
                                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                  NFT: {nftForProject?.nftId}
                                </p>
                              </div>
                            </div>
                            <ChevronDown className={`w-5 h-5 text-gray-400 transform transition-transform ${
                              isExpanded ? 'rotate-180' : ''
                            }`} />
                          </button>
                          
                          {isExpanded && (
                            <div className={`p-4 border-t ${theme === 'dark' ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}>
                              <div className="space-y-4">
                                <div>
                                  <h5 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    Active Governance Rights
                                  </h5>
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="flex items-center space-x-2">
                                      <Check className="w-4 h-4 text-green-500" />
                                      <span>Property Management Voting</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Check className="w-4 h-4 text-green-500" />
                                      <span>Rental Strategy Decisions</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Check className="w-4 h-4 text-green-500" />
                                      <span>Maintenance Approvals</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Check className="w-4 h-4 text-green-500" />
                                      <span>Foundation Governance</span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div>
                                  <h5 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    Recent Proposals
                                  </h5>
                                  <div className="space-y-2">
                                    <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <p className="font-medium text-sm">Roof Maintenance Approval</p>
                                          <p className="text-xs text-gray-500">Proposed by Property Manager</p>
                                        </div>
                                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                                          Passed
                                        </span>
                                      </div>
                                    </div>
                                    <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <p className="font-medium text-sm">Rental Rate Adjustment</p>
                                          <p className="text-xs text-gray-500">Voting ends in 3 days</p>
                                        </div>
                                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                          Active
                                        </span>
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
                    
                    {dashboardProjects.filter(project => hasNFTAccess(project.slug)).length === 0 && (
                      <div className="text-center py-8">
                        <Users className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                        <h4 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          No Governance Access
                        </h4>
                        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                          Connect governance NFTs to participate in community voting.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'analytics' && (
                  <div className="space-y-6">
                    <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
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
                                <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                  {project.name} Analytics
                                </h4>
                                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
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
                                  <h5 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    Rental Income Breakdown
                                  </h5>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span>Gross Rent</span>
                                      <span className="font-medium">€{project.privateInfo.rentalBreakdown.grossRent.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-red-600">
                                      <span>- Maintenance</span>
                                      <span>€{project.privateInfo.rentalBreakdown.maintenance.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-red-600">
                                      <span>- Management</span>
                                      <span>€{project.privateInfo.rentalBreakdown.management.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-red-600">
                                      <span>- Insurance</span>
                                      <span>€{project.privateInfo.rentalBreakdown.insurance.toLocaleString()}</span>
                                    </div>
                                    <div className={`flex justify-between font-semibold pt-2 border-t ${
                                      theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                                    }`}>
                                      <span>Net Income</span>
                                      <span className="text-green-600">€{project.privateInfo.rentalBreakdown.netIncome.toLocaleString()}</span>
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <h5 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    Foundation Performance
                                  </h5>
                                  <div className="space-y-3">
                                    <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                                      <div className="text-xs text-gray-500 mb-1">Community Pool</div>
                                      <div className="text-lg font-semibold text-blue-600">
                                        €{project.privateInfo.caymanFundPerformance.totalPool?.toLocaleString() || '0'}
                                      </div>
                                    </div>
                                    <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                                      <div className="text-xs text-gray-500 mb-1">Monthly Distribution Per NFT</div>
                                      <div className="text-lg font-semibold text-green-600">
                                        €{project.privateInfo.caymanFundPerformance.monthlyDistribution || '0'}
                                      </div>
                                    </div>
                                    <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                                      <div className="text-xs text-gray-500 mb-1">Occupancy Rate</div>
                                      <div className="text-lg font-semibold text-indigo-600">
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
                        <h4 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          No Analytics Available
                        </h4>
                        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                          Governance NFTs required to view detailed analytics.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div className="space-y-6">
                    <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Account Settings
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className={`p-4 border rounded-lg ${
                        theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                      }`}>
                        <h4 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          KYC Status
                        </h4>
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-sm font-medium text-green-600">Verified</span>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">
                          Your identity has been verified and you have full access to governance features.
                        </p>
                        <button className={`text-sm px-4 py-2 rounded-lg border transition-colors ${
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
                        <h4 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          NFT Management
                        </h4>
                        <div className="space-y-2 mb-4">
                          {nftAccess.map((nft, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="text-sm">{nft.nftId}</span>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                nft.verified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {nft.verified ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          ))}
                        </div>
                        <button className={`text-sm px-4 py-2 rounded-lg border transition-colors ${
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
