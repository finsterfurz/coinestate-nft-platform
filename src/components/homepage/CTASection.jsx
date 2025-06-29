import React from 'react';
import PropTypes from 'prop-types';
import { 
  ArrowRight, 
  Shield, 
  Building, 
  Users, 
  TrendingUp,
  Star,
  Clock,
  CheckCircle
} from '../../icons';
import { typography } from '../../../utils/typography';
import animations from '../../../styles/animations.module.css';
import components from '../../../styles/components.module.css';

const CTASection = ({ theme, onNavigate }) => {
  const urgencyIndicators = [
    {
      icon: Users,
      stat: "1,847",
      label: "Active Members",
      subtext: "Join the community"
    },
    {
      icon: Building,
      stat: "€127.5M",
      label: "Assets Under Management",
      subtext: "Proven track record"
    },
    {
      icon: Star,
      stat: "4.9/5",
      label: "Member Satisfaction",
      subtext: "Trusted platform"
    }
  ];

  const benefits = [
    "KYC-verified exclusive community",
    "Direct voting rights on property decisions",
    "Monthly distributions from rental income",
    "Transferable NFT governance credentials",
    "Cayman Islands regulatory protection",
    "Transparent property performance data"
  ];

  const limitedOfferFeatures = [
    {
      title: "Early Member Benefits",
      description: "Founding members receive priority access to new properties and enhanced voting weight."
    },
    {
      title: "Waived Platform Fees",
      description: "First 6 months of platform fees waived for early adopters (€50/month value)."
    },
    {
      title: "Exclusive Property Access",
      description: "Access to premium properties before public launch, including Vienna and Amsterdam projects."
    }
  ];

  const sectionClasses = {
    background: theme === 'dark' 
      ? 'bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 text-white' 
      : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white'
  };

  return (
    <section className={`py-20 relative overflow-hidden ${sectionClasses.background}`}>
      {/* Background Pattern */}
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white rounded-full mix-blend-overlay filter blur-xl opacity-10 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white rounded-full mix-blend-overlay filter blur-xl opacity-10 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Urgency Stats */}
        <div className={`grid grid-cols-3 gap-8 mb-16 ${animations.slideUp}`}>
          {urgencyIndicators.map(({ icon: Icon, stat, label, subtext }, index) => (
            <div key={index} className="text-center">
              <div className="flex justify-center mb-3">
                <Icon className="h-8 w-8 text-blue-200" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stat}</div>
              <div className="text-blue-200 text-sm font-medium">{label}</div>
              <div className="text-blue-300 text-xs">{subtext}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Main CTA */}
          <div className={`space-y-8 ${animations.slideIn}`}>
            {/* Limited Time Badge */}
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-orange-500 rounded-full text-sm font-medium">
              <Clock className="h-4 w-4" />
              <span>Limited Early Access</span>
            </div>

            <div>
              <h2 className={`${typography.h1('dark')} mb-6 leading-tight`}>
                Ready to Own Your Share of
                <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  Premium Real Estate?
                </span>
              </h2>
              
              <p className="text-xl text-blue-100 leading-relaxed mb-8">
                Join 1,847 verified investors who are already earning returns and participating 
                in governance decisions on €127.5M worth of premium European properties.
              </p>
            </div>

            {/* Benefits Checklist */}
            <div className="space-y-3">
              {benefits.map((benefit, index) => (
                <div 
                  key={index} 
                  className={`flex items-center space-x-3 ${animations.slideUp}`}
                  style={{ animationDelay: `${200 + index * 100}ms` }}
                >
                  <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                  <span className="text-blue-100">{benefit}</span>
                </div>
              ))}
            </div>

            {/* Primary CTA Buttons */}
            <div className={`flex flex-col sm:flex-row gap-4 ${animations.slideUp} ${animations['delay-800']}`}>
              <button
                onClick={() => onNavigate('kyc')}
                className="flex items-center justify-center space-x-3 px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all transform hover:scale-105 shadow-lg"
              >
                <Shield className="h-6 w-6" />
                <span>Start KYC Verification</span>
                <ArrowRight className="h-5 w-5" />
              </button>
              
              <button
                onClick={() => onNavigate('properties')}
                className="flex items-center justify-center space-x-3 px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-bold text-lg hover:bg-white hover:text-blue-600 transition-all"
              >
                <Building className="h-6 w-6" />
                <span>Explore Properties</span>
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center space-x-6 text-sm text-blue-200">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>CIMA Regulated</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4" />
                <span>4.9/5 Rating</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>Proven Returns</span>
              </div>
            </div>
          </div>

          {/* Right Column - Limited Offer Features */}
          <div className={`${animations.slideIn} ${animations['delay-400']}`}>
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
              <div className="text-center mb-8">
                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-black rounded-full text-sm font-bold mb-4">
                  <Star className="h-4 w-4" />
                  <span>Early Member Exclusive</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  Founding Member Benefits
                </h3>
                <p className="text-blue-200">
                  Limited time offer for the first 2,500 members
                </p>
              </div>

              <div className="space-y-6">
                {limitedOfferFeatures.map(({ title, description }, index) => (
                  <div 
                    key={index}
                    className={`${animations.slideUp}`}
                    style={{ animationDelay: `${600 + index * 150}ms` }}
                  >
                    <h4 className="text-lg font-bold text-white mb-2">{title}</h4>
                    <p className="text-blue-200 text-sm leading-relaxed">{description}</p>
                  </div>
                ))}
              </div>

              {/* Urgency Timer */}
              <div className="mt-8 p-4 bg-orange-500/20 rounded-xl border border-orange-400/30">
                <div className="text-center">
                  <div className="text-orange-300 text-sm font-medium mb-2">
                    Early Access Ends In:
                  </div>
                  <div className="text-2xl font-bold text-white">
                    47 Days Remaining
                  </div>
                  <div className="text-orange-300 text-xs mt-1">
                    Only 653 spots left
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Disclaimer */}
        <div className={`text-center mt-16 ${animations.fadeIn} ${animations['delay-1200']}`}>
          <p className="text-xs text-blue-300 max-w-3xl mx-auto leading-relaxed">
            <strong>Important:</strong> CoinEstate NFTs represent governance credentials, not securities or investment contracts. 
            Participation requires KYC verification and compliance with applicable regulations. 
            Past performance does not guarantee future results. Consult professional advisors before investing.
          </p>
        </div>
      </div>
    </section>
  );
};

CTASection.propTypes = {
  theme: PropTypes.oneOf(['light', 'dark', 'blue']).isRequired,
  onNavigate: PropTypes.func.isRequired,
};

export default CTASection;