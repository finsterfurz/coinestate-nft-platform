import React from 'react';
import PropTypes from 'prop-types';
import { Check, Key } from '../../icons';
import animations from '../../../styles/animations.module.css';
import components from '../../../styles/components.module.css';

const HeroDashboardPreview = ({ theme }) => {
  const themeClasses = {
    card: theme === 'dark' ? components.cardDark : components.cardLight,
    propertyCard: theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50/50',
    title: theme === 'dark' ? 'text-white' : 'text-gray-900',
    statusText: theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
  };

  const accessFeatures = [
    'Property Performance Analytics',
    'Governance Voting Rights', 
    'Community Decision Access',
    'Monthly Distribution Tracking'
  ];

  return (
    <div className={`relative ${animations.slideIn} ${animations['delay-500']}`}>
      <div className={`${components.card} ${themeClasses.card} rounded-3xl shadow-2xl p-8 backdrop-blur-sm border-2`}>
        {/* Dashboard Header */}
        <DashboardHeader theme={theme} themeClasses={themeClasses} />
        
        {/* Property Card */}
        <PropertyCard theme={theme} themeClasses={themeClasses} />
        
        {/* Access Features */}
        <AccessFeatures features={accessFeatures} />
      </div>
    </div>
  );
};

const DashboardHeader = ({ theme, themeClasses }) => (
  <div className="flex items-center justify-between mb-6">
    <div className="flex items-center space-x-3">
      <div className={`w-3 h-3 bg-green-500 rounded-full ${animations.pulseSlow}`}></div>
      <span className={`text-sm font-medium ${themeClasses.statusText}`}>
        Governance Dashboard
      </span>
    </div>
    <span className={`${components.badge} ${components.badgeSuccess}`}>
      Active Access
    </span>
  </div>
);

const PropertyCard = ({ theme, themeClasses }) => {
  const propertyData = [
    { label: 'NFT ID', value: '#0247/2500', mono: true },
    { label: 'Monthly Distribution', value: '€487.50', color: 'text-green-600' },
    { label: 'Voting Power', value: '1 Vote (0.04%)', weight: 'font-semibold' }
  ];

  return (
    <div className={`rounded-xl p-6 mb-4 ${themeClasses.propertyCard}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className={`font-semibold ${themeClasses.title}`}>
            Vienna Luxury #247
          </h4>
          <p className="text-sm text-gray-500">Prime District, Austria</p>
        </div>
        <Key className="h-6 w-6 text-blue-500" />
      </div>
      
      <div className="space-y-3">
        {propertyData.map(({ label, value, mono, color, weight }, index) => (
          <div key={index} className="flex justify-between">
            <span className="text-sm">{label}</span>
            <span className={`text-sm ${mono ? 'font-mono' : ''} ${color || ''} ${weight || ''}`}>
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const AccessFeatures = ({ features }) => (
  <div className="space-y-3">
    <h5 className="font-medium">Unlocked Features</h5>
    {features.map((feature, index) => (
      <div key={index} className="flex items-center justify-between">
        <span className="text-sm">{feature}</span>
        <Check className="h-4 w-4 text-green-500" />
      </div>
    ))}
  </div>
);

// PropTypes
DashboardHeader.propTypes = {
  theme: PropTypes.oneOf(['light', 'dark', 'blue']).isRequired,
  themeClasses: PropTypes.object.isRequired,
};

PropertyCard.propTypes = {
  theme: PropTypes.oneOf(['light', 'dark', 'blue']).isRequired,
  themeClasses: PropTypes.object.isRequired,
};

AccessFeatures.propTypes = {
  features: PropTypes.arrayOf(PropTypes.string).isRequired,
};

HeroDashboardPreview.propTypes = {
  theme: PropTypes.oneOf(['light', 'dark', 'blue']).isRequired,
};

export default HeroDashboardPreview;