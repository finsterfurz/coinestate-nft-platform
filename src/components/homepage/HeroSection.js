import React from 'react';
import PropTypes from 'prop-types';
import { Shield, Check, Award, Building, Key, ArrowRight } from '../icons';
import { typography } from '../../utils/typography';
import animations from '../../styles/animations.module.css';
import components from '../../styles/components.module.css';

const HeroSection = ({ theme, onNavigate }) => {
  // Enhanced navigation handler with analytics and accessibility
  const handleNavigation = (route, analyticsEvent = '') => {
    // Analytics tracking
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'click', {
        event_category: 'Navigation',
        event_label: analyticsEvent || route,
        value: 1
      });
    }

    // Announce navigation to screen readers
    const announcement = `Navigating to ${route} page`;
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(announcement);
      utterance.volume = 0; // Silent for accessibility only
      window.speechSynthesis.speak(utterance);
    }

    onNavigate(route);
  };

  return (
    <section 
      className={`relative pt-24 pb-20 overflow-hidden ${ 
        theme === 'dark' 
          ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900' 
          : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'
      }`}
      aria-labelledby="hero-heading"
      role="banner"
    >
      {/* Animated Background Elements - Decorative only */}
      <div className=\"absolute inset-0 overflow-hidden\" aria-hidden=\"true\">
        <div className={`absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 ${animations.pulseSlow}`}></div>
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 ${animations.pulseSlow} ${animations['delay-200']}`}></div>
      </div>

      <div className=\"relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8\">
        <div className=\"grid lg:grid-cols-2 gap-16 items-center\">
          <div className={`space-y-8 ${animations.fadeIn}`}>
            {/* Regulatory Badge */}
            <div 
              className={`inline-flex items-center space-x-3 px-6 py-3 rounded-full text-sm font-medium backdrop-blur-sm border ${ 
                theme === 'dark' 
                  ? 'bg-blue-900/30 border-blue-700/50 text-blue-300' 
                  : 'bg-blue-100/80 border-blue-200/50 text-blue-700'
              }`}
              role=\"img\"
              aria-label=\"Regulatory compliance indicator\"
            >
              <Shield className=\"h-5 w-5\" aria-hidden=\"true\" />
              <span>CIMA Regulated • Cayman Islands</span>
              <div 
                className={`w-2 h-2 bg-green-500 rounded-full ${animations.pulseSlow}`}
                aria-label=\"Active status indicator\"
                role=\"status\"
              ></div>
            </div>
            
            {/* Main Headline with improved semantic structure */}
            <header className={`space-y-6 ${animations.slideUp} ${animations['delay-200']}`}>
              <h1 
                id=\"hero-heading\"
                className={`${typography.h1(theme)} leading-tight`}
                role=\"heading\"
                aria-level=\"1\"
              >
                Unlock Premium
                <span className=\"block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent\">
                  Real Estate Governance
                </span>
                Through NFT Credentials
              </h1>
              
              <p 
                className={`${typography.bodyLarge(theme)} leading-relaxed max-w-xl`}
                id=\"hero-description\"
                role=\"text\"
              >
                Join an exclusive community of verified investors with direct voting rights 
                on premium European real estate. Each NFT grants governance access, 
                operational control, and transparent participation in property decisions.
              </p>
            </header>
            
            {/* Trust Indicators with improved accessibility */}
            <div 
              className={`flex flex-wrap items-center gap-6 text-sm ${animations.slideUp} ${animations['delay-300']}`}
              role=\"list\"
              aria-label=\"Platform trust indicators\"
            >
              <div className=\"flex items-center space-x-2\" role=\"listitem\">
                <Check className=\"h-5 w-5 text-green-500\" aria-hidden=\"true\" />
                <span className=\"font-medium\">KYC Verified Community</span>
              </div>
              <div className=\"flex items-center space-x-2\" role=\"listitem\">
                <Shield className=\"h-5 w-5 text-blue-500\" aria-hidden=\"true\" />
                <span className=\"font-medium\">Regulatory Compliant</span>
              </div>
              <div className=\"flex items-center space-x-2\" role=\"listitem\">
                <Award className=\"h-5 w-5 text-purple-500\" aria-hidden=\"true\" />
                <span className=\"font-medium\">Transferable Rights</span>
              </div>
            </div>
            
            {/* Action Buttons with enhanced accessibility */}
            <div className={`flex flex-col sm:flex-row gap-4 ${animations.slideUp} ${animations['delay-500']}`}>
              <button 
                onClick={() => handleNavigation('projects', 'Explore Properties CTA')}
                className={`${components.button} ${components.buttonPrimary} text-lg px-8 py-4 rounded-xl group`}
                aria-label=\"Explore available properties\"
                aria-describedby=\"properties-button-description\"
                type=\"button\"
              >
                <Building className=\"h-6 w-6\" aria-hidden=\"true\" />
                <span>Explore Properties</span>
                <ArrowRight className={`h-5 w-5 ${animations.translateHover} group-hover:translate-x-1 transition-transform`} aria-hidden=\"true\" />
              </button>
              <div id=\"properties-button-description\" className=\"sr-only\">
                View available real estate projects and their governance opportunities
              </div>
              
              <button 
                onClick={() => handleNavigation('dashboard', 'Get Access CTA')}
                className={`${components.button} ${
                  theme === 'dark' ? components.buttonSecondaryDark : components.buttonSecondary
                } text-lg px-8 py-4 rounded-xl`}
                aria-label=\"Get access to platform dashboard\"
                aria-describedby=\"access-button-description\"
                type=\"button\"
              >
                <Key className=\"h-5 w-5\" aria-hidden=\"true\" />
                <span>Get Access Now</span>
              </button>
              <div id=\"access-button-description\" className=\"sr-only\">
                Start the KYC verification process to join the platform
              </div>
            </div>

            {/* Live Stats Preview with accessibility */}
            <div className={`pt-4 ${animations.slideUp} ${animations['delay-1000']}`}>
              <div 
                className=\"grid grid-cols-2 gap-4 max-w-md\"
                role=\"region\"
                aria-label=\"Platform statistics\"
              >
                <div 
                  className={`${components.statsCard} ${
                    theme === 'dark' ? components.statsCardDark : components.statsCardLight
                  }`}
                  role=\"figure\"
                  aria-labelledby=\"total-assets-label\"
                >
                  <div className=\"text-2xl font-bold text-blue-600\" aria-describedby=\"total-assets-value\">
                    €127.5M
                  </div>
                  <div id=\"total-assets-label\" className=\"text-xs text-gray-500\">Total Assets</div>
                  <div id=\"total-assets-value\" className=\"sr-only\">
                    127.5 million euros in total managed assets
                  </div>
                </div>
                <div 
                  className={`${components.statsCard} ${
                    theme === 'dark' ? components.statsCardDark : components.statsCardLight
                  }`}
                  role=\"figure\"
                  aria-labelledby=\"active-members-label\"
                >
                  <div className=\"text-2xl font-bold text-green-600\" aria-describedby=\"active-members-value\">
                    1,847
                  </div>
                  <div id=\"active-members-label\" className=\"text-xs text-gray-500\">Active Members</div>
                  <div id=\"active-members-value\" className=\"sr-only\">
                    1,847 active community members
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Enhanced Dashboard Preview with improved accessibility */}
          <div className={`relative ${animations.slideIn} ${animations['delay-500']}`}>
            <div 
              className={`${components.card} ${
                theme === 'dark' ? components.cardDark : components.cardLight
              } rounded-3xl shadow-2xl p-8 backdrop-blur-sm border-2`}
              role=\"complementary\"
              aria-labelledby=\"dashboard-preview-heading\"
            >
              {/* Header */}
              <div className=\"flex items-center justify-between mb-6\">
                <div className=\"flex items-center space-x-3\">
                  <div 
                    className={`w-3 h-3 bg-green-500 rounded-full ${animations.pulseSlow}`}
                    role=\"status\"
                    aria-label=\"Online status indicator\"
                  ></div>
                  <span 
                    className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}
                    id=\"dashboard-preview-heading\"
                  >
                    Governance Dashboard
                  </span>
                </div>
                <span 
                  className={`${components.badge} ${components.badgeSuccess}`}
                  role=\"status\"
                  aria-label=\"Access status active\"
                >
                  Active Access
                </span>
              </div>
              
              {/* Property Card */}
              <div 
                className={`rounded-xl p-6 mb-4 ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50/50'}`}
                role=\"article\"
                aria-labelledby=\"property-247-title\"
              >
                <div className=\"flex justify-between items-start mb-4\">
                  <div>
                    <h4 
                      id=\"property-247-title\"
                      className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                    >
                      Vienna Luxury #247
                    </h4>
                    <p className=\"text-sm text-gray-500\">Prime District, Austria</p>
                  </div>
                  <Key className=\"h-6 w-6 text-blue-500\" aria-label=\"NFT access key\" />
                </div>
                
                <div className=\"space-y-3\" role=\"list\" aria-label=\"Property details\">
                  <div className=\"flex justify-between\" role=\"listitem\">
                    <span className=\"text-sm\">NFT ID</span>
                    <span className=\"font-mono text-sm\">#0247/2500</span>
                  </div>
                  <div className=\"flex justify-between\" role=\"listitem\">
                    <span className=\"text-sm\">Monthly Distribution</span>
                    <span className=\"font-semibold text-green-600\" aria-label=\"487 euros and 50 cents monthly\">
                      €487.50
                    </span>
                  </div>
                  <div className=\"flex justify-between\" role=\"listitem\">
                    <span className=\"text-sm\">Voting Power</span>
                    <span className=\"font-semibold\" aria-label=\"1 vote representing 0.04 percent\">
                      1 Vote (0.04%)
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Access Features */}
              <div className=\"space-y-3\">
                <h5 className=\"font-medium\" id=\"unlocked-features-heading\">Unlocked Features</h5>
                <ul role=\"list\" aria-labelledby=\"unlocked-features-heading\">
                  {[
                    'Property Performance Analytics',
                    'Governance Voting Rights', 
                    'Community Decision Access',
                    'Monthly Distribution Tracking'
                  ].map((feature, i) => (
                    <li key={i} className=\"flex items-center justify-between\" role=\"listitem\">
                      <span className=\"text-sm\">{feature}</span>
                      <Check className=\"h-4 w-4 text-green-500\" aria-label=\"Available\" />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Floating Elements - Decorative */}
            <div 
              className={`absolute -top-6 -right-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-xl shadow-lg ${animations.bounceSubtle}`}
              aria-hidden=\"true\"
            >
              <Shield className=\"h-8 w-8\" />
            </div>
            <div 
              className={`absolute -bottom-6 -left-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-xl shadow-lg ${animations.bounceSubtle} ${animations['delay-1000']}`}
              aria-hidden=\"true\"
            >
              <Key className=\"h-8 w-8\" />
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