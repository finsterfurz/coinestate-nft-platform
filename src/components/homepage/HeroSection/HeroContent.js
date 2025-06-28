import React from 'react';
import PropTypes from 'prop-types';
import { Shield, Check, Award, Building, Key, ArrowRight } from '../../icons';
import { typography } from '../../../utils/typography';
import animations from '../../../styles/animations.module.css';
import components from '../../../styles/components.module.css';

const HeroContent = ({ theme, onNavigate }) => {
  const themeClasses = {
    badge: theme === 'dark' 
      ? 'bg-blue-900/30 border-blue-700/50 text-blue-300' 
      : 'bg-blue-100/80 border-blue-200/50 text-blue-700',
    text: theme === 'dark' ? 'text-white' : 'text-gray-900',
    secondaryButton: theme === 'dark' 
      ? components.buttonSecondaryDark 
      : components.buttonSecondary
  };

  const trustIndicators = [
    { icon: Check, text: 'KYC Verified Community', color: 'text-green-500' },
    { icon: Shield, text: 'Regulatory Compliant', color: 'text-blue-500' },
    { icon: Award, text: 'Transferable Rights', color: 'text-purple-500' }
  ];

  return (
    <div className={`space-y-8 ${animations.fadeIn}`}>
      {/* Regulatory Badge */}
      <div className={`inline-flex items-center space-x-3 px-6 py-3 rounded-full text-sm font-medium backdrop-blur-sm border ${themeClasses.badge}`}>
        <Shield className="h-5 w-5" />
        <span>CIMA Regulated • Cayman Islands</span>
        <div className={`w-2 h-2 bg-green-500 rounded-full ${animations.pulseSlow}`}></div>
      </div>
      
      {/* Main Headline */}
      <div className={`space-y-6 ${animations.slideUp} ${animations['delay-200']}`}>
        <h1 className={`${typography.h1(theme)} leading-tight`}>
          Unlock Premium
          <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Real Estate Governance
          </span>
          Through NFT Credentials
        </h1>
        
        <p className={`${typography.bodyLarge(theme)} leading-relaxed max-w-xl`}>
          Join an exclusive community of verified investors with direct voting rights 
          on premium European real estate. Each NFT grants governance access, 
          operational control, and transparent participation in property decisions.
        </p>
      </div>
      
      {/* Trust Indicators */}
      <div className={`flex flex-wrap items-center gap-6 text-sm ${animations.slideUp} ${animations['delay-300']}`}>
        {trustIndicators.map(({ icon: Icon, text, color }, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Icon className={`h-5 w-5 ${color}`} />
            <span className="font-medium">{text}</span>
          </div>
        ))}
      </div>
      
      {/* Action Buttons */}
      <div className={`flex flex-col sm:flex-row gap-4 ${animations.slideUp} ${animations['delay-500']}`}>
        <button 
          onClick={() => onNavigate('projects')}
          className={`${components.button} ${components.buttonPrimary} text-lg px-8 py-4 rounded-xl group`}
        >
          <Building className="h-6 w-6" />
          <span>Explore Properties</span>
          <ArrowRight className={`h-5 w-5 transition-transform group-hover:translate-x-1`} />
        </button>
        <button 
          onClick={() => onNavigate('dashboard')}
          className={`${components.button} ${themeClasses.secondaryButton} text-lg px-8 py-4 rounded-xl`}
        >
          <Key className="h-5 w-5" />
          <span>Get Access Now</span>
        </button>
      </div>

      {/* Live Stats Preview */}
      <HeroStats theme={theme} />
    </div>
  );
};

const HeroStats = ({ theme }) => {
  const statsCardClass = theme === 'dark' 
    ? components.statsCardDark 
    : components.statsCardLight;

  const stats = [
    { value: '€127.5M', label: 'Total Assets', color: 'text-blue-600' },
    { value: '1,847', label: 'Active Members', color: 'text-green-600' }
  ];

  return (
    <div className={`pt-4 ${animations.slideUp} ${animations['delay-1000']}`}>
      <div className="grid grid-cols-2 gap-4 max-w-md">
        {stats.map(({ value, label, color }, index) => (
          <div key={index} className={`${components.statsCard} ${statsCardClass}`}>
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-gray-500">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

HeroContent.propTypes = {
  theme: PropTypes.oneOf(['light', 'dark', 'blue']).isRequired,
  onNavigate: PropTypes.func.isRequired,
};

HeroStats.propTypes = {
  theme: PropTypes.oneOf(['light', 'dark', 'blue']).isRequired,
};

export default HeroContent;