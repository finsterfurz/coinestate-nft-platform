import React from 'react';
import PropTypes from 'prop-types';
import { Shield, Check, Award, Building, Key, ArrowRight } from '../icons';
import { typography } from '../../utils/typography';
import animations from '../../styles/animations.module.css';
import components from '../../styles/components.module.css';

const HeroSection = ({ theme, onNavigate }) => {
  return (
    <section className={`relative pt-24 pb-20 overflow-hidden ${ 
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'
    }`}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 ${animations.pulseSlow}`}></div>
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 ${animations.pulseSlow} ${animations['delay-200']}`}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className={`space-y-8 ${animations.fadeIn}`}>
            {/* Regulatory Badge */}
            <div className={`inline-flex items-center space-x-3 px-6 py-3 rounded-full text-sm font-medium backdrop-blur-sm border ${ 
              theme === 'dark' 
                ? 'bg-blue-900/30 border-blue-700/50 text-blue-300' 
                : 'bg-blue-100/80 border-blue-200/50 text-blue-700'
            }`}>
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
              <div className="flex items-center space-x-2">
                <Check className="h-5 w-5 text-green-500" />
                <span className="font-medium">KYC Verified Community</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-blue-500" />
                <span className="font-medium">Regulatory Compliant</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-purple-500" />
                <span className="font-medium">Transferable Rights</span>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className={`flex flex-col sm:flex-row gap-4 ${animations.slideUp} ${animations['delay-500']}`}>
              <button 
                onClick={() => onNavigate('projects')}
                className={`${components.button} ${components.buttonPrimary} text-lg px-8 py-4 rounded-xl`}
              >
                <Building className="h-6 w-6" />
                <span>Explore Properties</span>
                <ArrowRight className={`h-5 w-5 ${animations.translateHover}`} />
              </button>
              <button 
                onClick={() => onNavigate('dashboard')}
                className={`${components.button} ${
                  theme === 'dark' ? components.buttonSecondaryDark : components.buttonSecondary
                } text-lg px-8 py-4 rounded-xl`}
              >
                <Key className="h-5 w-5" />
                <span>Get Access Now</span>
              </button>
            </div>

            {/* Live Stats Preview */}
            <div className={`pt-4 ${animations.slideUp} ${animations['delay-1000']}`}>
              <div className="grid grid-cols-2 gap-4 max-w-md">
                <div className={`${components.statsCard} ${
                  theme === 'dark' ? components.statsCardDark : components.statsCardLight
                }`}>
                  <div className="text-2xl font-bold text-blue-600">€127.5M</div>
                  <div className="text-xs text-gray-500">Total Assets</div>
                </div>
                <div className={`${components.statsCard} ${
                  theme === 'dark' ? components.statsCardDark : components.statsCardLight
                }`}>
                  <div className="text-2xl font-bold text-green-600">1,847</div>
                  <div className="text-xs text-gray-500">Active Members</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Enhanced Dashboard Preview */}
          <div className={`relative ${animations.slideIn} ${animations['delay-500']}`}>
            <div className={`${components.card} ${
              theme === 'dark' ? components.cardDark : components.cardLight
            } rounded-3xl shadow-2xl p-8 backdrop-blur-sm border-2`}>
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 bg-green-500 rounded-full ${animations.pulseSlow}`}></div>
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    Governance Dashboard
                  </span>
                </div>
                <span className={`${components.badge} ${components.badgeSuccess}`}>
                  Active Access
                </span>
              </div>
              
              {/* Property Card */}
              <div className={`rounded-xl p-6 mb-4 ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50/50'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Vienna Luxury #247
                    </h4>
                    <p className="text-sm text-gray-500">Prime District, Austria</p>
                  </div>
                  <Key className="h-6 w-6 text-blue-500" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">NFT ID</span>
                    <span className="font-mono text-sm">#0247/2500</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Monthly Distribution</span>
                    <span className="font-semibold text-green-600">€487.50</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Voting Power</span>
                    <span className="font-semibold">1 Vote (0.04%)</span>
                  </div>
                </div>
              </div>
              
              {/* Access Features */}
              <div className="space-y-3">
                <h5 className="font-medium">Unlocked Features</h5>
                {[
                  'Property Performance Analytics',
                  'Governance Voting Rights', 
                  'Community Decision Access',
                  'Monthly Distribution Tracking'
                ].map((feature, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm">{feature}</span>
                    <Check className="h-4 w-4 text-green-500" />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Floating Elements */}
            <div className={`absolute -top-6 -right-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-xl shadow-lg ${animations.bounceSubtle}`}>
              <Shield className="h-8 w-8" />
            </div>
            <div className={`absolute -bottom-6 -left-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-xl shadow-lg ${animations.bounceSubtle} ${animations['delay-1000']}`}>
              <Key className="h-8 w-8" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

HeroSection.propTypes = {
  theme: PropTypes.oneOf(['light', 'dark', 'blue']).isRequired,
  onNavigate: PropTypes.func.isRequired,
};

export default HeroSection;