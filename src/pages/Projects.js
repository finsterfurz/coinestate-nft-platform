import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Globe, Key, Check, Building } from '../icons/AllIcons.js';

// ==================== PROJECTS PAGE ====================
const ProjectsPage = () => {
  const { theme, updateState, projects = [] } = useApp(); // 🔥 DEFAULT ARRAY
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('success');

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    // 🔥 DEFENSIVE CHECK
    if (!projects || !Array.isArray(projects) || projects.length === 0) {
      return [];
    }
    
    let filtered = [...projects];
    
    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(project => 
        filter === 'available' ? project.status === 'Available' :
        filter === 'allocated' ? project.status === 'Fully Allocated' :
        filter === 'coming-soon' ? project.status === 'Coming Soon' || project.status === 'Planning' :
        true
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'success':
          return (b.marketData?.successRate || 0) - (a.marketData?.successRate || 0);
        case 'value':
          return (b.totalValue || 0) - (a.totalValue || 0);
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [projects, filter, sortBy]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available':
        return 'bg-green-100 text-green-800';
      case 'Fully Allocated':
        return 'bg-blue-100 text-blue-800';
      case 'Coming Soon':
        return 'bg-yellow-100 text-yellow-800';
      case 'Planning':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 🔥 SAFE CALCULATIONS WITH DEFAULTS
  const totalValue = projects?.reduce((sum, p) => sum + (p.totalValue || 0), 0) || 0;
  const totalNFTs = projects?.reduce((sum, p) => sum + (p.nftCount || 0), 0) || 0;
  const avgSuccessRate = projects?.length ? 
    (projects.reduce((sum, p) => sum + (p.marketData?.successRate || 0), 0) / projects.length) : 0;

  // 🔥 LOADING STATE
  if (!projects || projects.length === 0) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="text-center">
          <Building className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-2">Loading Projects...</h3>
          <p className="text-gray-500">Please wait while we load the project data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <section className={`pt-24 pb-12 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className={`text-4xl md:text-5xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Real Estate Projects
            </h1>
            <p className={`text-xl max-w-3xl mx-auto ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Explore our portfolio of premium real estate dashboard access opportunities across major European markets.
            </p>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-1">
                €{(totalValue / 1000000).toFixed(1)}M
              </div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Total Portfolio Value</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-green-600 mb-1">
                {totalNFTs.toLocaleString()}
              </div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Total NFT Keys</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-indigo-600 mb-1">
                {projects?.length || 0}
              </div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Active Projects</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-purple-600 mb-1">
                {avgSuccessRate.toFixed(1)}%
              </div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Average Success Rate</div>
            </div>
          </div>

          {/* Filters and Sorting */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'All Projects' },
                { key: 'available', label: 'Available' },
                { key: 'allocated', label: 'Allocated' },
                { key: 'coming-soon', label: 'Coming Soon' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === key
                      ? 'bg-blue-600 text-white'
                      : theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-gray-300'
                    : 'bg-white border-gray-300 text-gray-700'
                }`}
              >
                <option value="success">Success Rate (High to Low)</option>
                <option value="value">Value (High to Low)</option>
                <option value="name">Name (A to Z)</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* 🔥 SAFE MAP WITH DEFAULT */}
            {(filteredProjects || []).map((project) => (
              <div key={project.slug} className={`rounded-xl shadow-lg border overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <div className="relative">
                  <img
                    src={project.image || '/placeholder.jpg'}
                    alt={project.name || 'Project'}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                      {project.status || 'Unknown'}
                    </span>
                  </div>
                  {(project.marketData?.successRate || 0) >= 4.5 && (
                    <div className="absolute top-4 left-4">
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                        High Success Rate
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {project.name || 'Unnamed Project'}
                  </h3>
                  <p className={`text-sm mb-4 flex items-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    <Globe className="w-4 h-4 mr-1" />
                    {project.location || 'Location TBD'}
                  </p>
                  <p className={`text-sm mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {project.description || 'Description coming soon...'}
                  </p>
                  
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <div className="text-lg font-bold text-blue-600">
                        €{((project.totalValue || 0) / 1000000).toFixed(1)}M
                      </div>
                      <div className="text-xs text-gray-500">Total Value</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-600">
                        {(project.marketData?.successRate || 0)}%
                      </div>
                      <div className="text-xs text-gray-500">Success Rate</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-indigo-600">
                        {(project.nftCount || 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">NFT Keys</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-purple-600">
                        €{(project.monthlyRent || 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">Monthly Rent</div>
                    </div>
                  </div>

                  {/* Highlights */}
                  <div className="mb-6">
                    <h4 className={`font-semibold mb-2 text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Key Features
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {(project.highlights || []).map((highlight, index) => (
                        <span key={index} className={`px-2 py-1 text-xs rounded ${
                          theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {highlight}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => updateState({ currentPage: 'dashboard' })}
                    className={`w-full py-3 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
                      project.status === 'Available'
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : project.status === 'Fully Allocated'
                          ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                          : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                    }`}
                    disabled={project.status === 'Fully Allocated'}
                  >
                    {project.status === 'Available' && (
                      <>
                        <Key className="w-4 h-4" />
                        <span>Get Governance NFT</span>
                      </>
                    )}
                    {project.status === 'Fully Allocated' && (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Fully Allocated</span>
                      </>
                    )}
                    {(project.status === 'Coming Soon' || project.status === 'Planning') && (
                      <>
                        <Building className="w-4 h-4" />
                        <span>Join Waitlist</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <Building className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
              <h3 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                No projects found
              </h3>
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                Try adjusting your filters to see more projects.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Join Community Governance?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join institutional participants in community-governed real estate through our compliant governance platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => updateState({ currentPage: 'dashboard' })}
              className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2"
            >
              <Key className="h-5 w-5" />
              <span>Access Governance</span>
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/10 transition-colors">
              Contact Sales Team
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProjectsPage;
