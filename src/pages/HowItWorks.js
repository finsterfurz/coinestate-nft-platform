import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { typography } from '../utils/typography';
import { 
  Key, 
  Shield, 
  Building, 
  Users, 
  Check, 
  ArrowRight,
  Globe,
  ChevronDown 
} from '../components/icons/AllIcons.js';

// ==================== HOW IT WORKS PAGE ====================
const HowItWorksPage = () => {
  const { theme, updateState } = useApp();
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: 0,
      title: "Explore Projects",
      subtitle: "Browse Premium Properties",
      icon: Building,
      description: "Start by exploring our curated portfolio of premium real estate projects across major European markets. Each property has been carefully selected for its investment potential and governance opportunities.",
      details: [
        "View detailed property information and market data",
        "Review governance structure and voting rights",
        "Understand revenue distribution mechanisms",
        "Check NFT availability and pricing"
      ],
      visual: "property-showcase"
    },
    {
      id: 1,
      title: "Acquire NFT Credentials",
      subtitle: "Purchase Governance Access",
      icon: Key,
      description: "Purchase NFT credentials that serve as your access keys to property governance. Each NFT represents voting rights and operational control for a specific real estate project.",
      details: [
        "NFTs are governance credentials, not securities",
        "Each NFT = 1 vote (max 10% control per wallet)",
        "Transferable with proper KYC re-verification",
        "Stored securely on blockchain infrastructure"
      ],
      visual: "nft-acquisition"
    },
    {
      id: 2,
      title: "Complete KYC Verification",
      subtitle: "Identity Verification Required",
      icon: Shield,
      description: "Complete our secure KYC process to link your wallet to verified credentials. This ensures compliance and enables full access to governance features.",
      details: [
        "Identity verification through secure partners",
        "AML compliance and regulatory requirements",
        "Links wallet address to verified identity",
        "Required for all governance participation"
      ],
      visual: "kyc-process"
    },
    {
      id: 3,
      title: "Participate in Governance",
      subtitle: "Vote on Property Decisions",
      icon: Users,
      description: "Use your verified NFT credentials to participate in community governance. Vote on operational decisions, maintenance approvals, and strategic initiatives.",
      details: [
        "Vote on maintenance and repair decisions (<€5k)",
        "Strategic decisions require 90% quorum (>€20k)",
        "Active participation expected with reward/penalty system",
        "12-month inactivity triggers community buyback"
      ],
      visual: "governance-participation"
    }
  ];

  const features = [
    {
      title: "Operational Voting",
      description: "Vote on day-to-day property management decisions including repairs, maintenance, and contractor selection.",
      icon: Building
    },
    {
      title: "Strategic Decisions",  
      description: "Participate in major decisions like property acquisition, disposal, and significant capital improvements.",
      icon: Users
    },
    {
      title: "Foundation Governance",
      description: "Vote on CoinEstate Foundation matters, policy changes, and community initiatives.",
      icon: Shield
    },
    {
      title: "Performance Monitoring",
      description: "Access detailed analytics, financial reports, and real-time property performance data.",
      icon: Globe
    }
  ];

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <section className={`pt-24 pb-12 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className={`text-4xl md:text-5xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            How It Works
          </h1>
          <p className={`text-xl ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Your step-by-step guide to community governance in real estate through NFT credentials
          </p>
        </div>
      </section>

      {/* Interactive Steps */}
      <section className={`py-16 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Step Navigator */}
            <div className="space-y-4">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = activeStep === index;
                
                return (
                  <button
                    key={step.id}
                    onClick={() => setActiveStep(index)}
                    className={`w-full text-left p-6 rounded-xl border-2 transition-all duration-300 ${
                      isActive
                        ? theme === 'dark'
                          ? 'border-blue-500 bg-blue-900/20'
                          : 'border-blue-500 bg-blue-50'
                        : theme === 'dark'
                          ? 'border-gray-700 bg-gray-800 hover:border-gray-600'
                          : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : theme === 'dark'
                            ? 'bg-gray-700 text-gray-400'
                            : 'bg-gray-200 text-gray-600'
                      }`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className={`font-semibold ${
                              isActive
                                ? theme === 'dark' ? 'text-blue-300' : 'text-blue-700'
                                : theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                              Step {index + 1}: {step.title}
                            </h3>
                            <p className={`text-sm ${
                              isActive
                                ? theme === 'dark' ? 'text-blue-200' : 'text-blue-600'
                                : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {step.subtitle}
                            </p>
                          </div>
                          <ArrowRight className={`w-5 h-5 ${
                            isActive
                              ? theme === 'dark' ? 'text-blue-300' : 'text-blue-600'
                              : theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                          }`} />
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Step Content */}
            <div className={`p-8 rounded-2xl ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
            }`}>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {activeStep + 1}
                    </div>
                    <h3 className={`${typography.h3(theme)}`}>
                      {steps[activeStep].title}
                    </h3>
                  </div>
                  <p className={`${typography.body(theme)} leading-relaxed mb-6`}>
                    {steps[activeStep].description}
                  </p>
                </div>

                <div>
                  <h4 className={`${typography.h5(theme)} mb-4`}>Key Points:</h4>
                  <div className="space-y-3">
                    {steps[activeStep].details.map((detail, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className={`${typography.bodySmall(theme)}`}>
                          {detail}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-4">
                  <button 
                    onClick={() => {
                      if (activeStep === 0) updateState({ currentPage: 'projects' });
                      else if (activeStep === 1 || activeStep === 2) updateState({ currentPage: 'dashboard' });
                      else updateState({ currentPage: 'about' });
                    }}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <span>
                      {activeStep === 0 ? 'Browse Projects' :
                       activeStep === 1 ? 'Get NFT Access' :
                       activeStep === 2 ? 'Start KYC' :
                       'Learn More'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Governance Features */}
      <section className={`py-16 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className={`${typography.h2(theme)} mb-4`}>
              Governance Features
            </h2>
            <p className={`${typography.bodyLarge(theme)} max-w-3xl mx-auto`}>
              Once you have verified NFT credentials, you can participate in various governance activities
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className={`text-center p-6 rounded-xl ${
                  theme === 'dark' ? 'bg-gray-900' : 'bg-white'
                } shadow-lg hover:shadow-xl transition-all duration-300`}>
                  <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className={`${typography.h5(theme)} mb-3`}>
                    {feature.title}
                  </h3>
                  <p className={`${typography.bodySmall(theme)} leading-relaxed`}>
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Legal Framework */}
      <section className={`py-16 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className={`${typography.h2(theme)} mb-4`}>
              Legal & Compliance Framework
            </h2>
            <p className={`${typography.bodyLarge(theme)} max-w-3xl mx-auto`}>
              Understanding the legal structure that enables secure governance participation
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className={`p-6 rounded-xl border-2 ${
              theme === 'dark' 
                ? 'bg-gray-800 border-blue-600' 
                : 'bg-blue-50 border-blue-200'
            }`}>
              <div className="w-12 h-12 bg-blue-600 rounded-full mb-4 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className={`${typography.h4(theme)} mb-3`}>
                NFT Positioning
              </h3>
              <p className={`${typography.body(theme)} mb-4`}>
                NFTs are clearly positioned as governance credentials and access keys, not as securities or investment contracts.
              </p>
              <ul className={`space-y-2 ${typography.bodySmall(theme)}`}>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Software access credentials</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Voting rights only</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>No ownership claims</span>
                </li>
              </ul>
            </div>

            <div className={`p-6 rounded-xl border-2 ${
              theme === 'dark' 
                ? 'bg-gray-800 border-green-600' 
                : 'bg-green-50 border-green-200'
            }`}>
              <div className="w-12 h-12 bg-green-600 rounded-full mb-4 flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <h3 className={`${typography.h4(theme)} mb-3`}>
                Cayman Structure
              </h3>
              <p className={`${typography.body(theme)} mb-4`}>
                Operations under Cayman Islands Private Fund + Foundation structure with CIMA regulation.
              </p>
              <ul className={`space-y-2 ${typography.bodySmall(theme)}`}>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>CIMA registered foundation</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Off-chain governance</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Regulatory compliance</span>
                </li>
              </ul>
            </div>

            <div className={`p-6 rounded-xl border-2 ${
              theme === 'dark' 
                ? 'bg-gray-800 border-purple-600' 
                : 'bg-purple-50 border-purple-200'
            }`}>
              <div className="w-12 h-12 bg-purple-600 rounded-full mb-4 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className={`${typography.h4(theme)} mb-3`}>
                Participation Rights
              </h3>
              <p className={`${typography.body(theme)} mb-4`}>
                All governance participation is voluntary and administered off-chain by the Foundation.
              </p>
              <ul className={`space-y-2 ${typography.bodySmall(theme)}`}>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Voluntary participation</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Foundation administered</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>KYC verification required</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Your Governance Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join the future of community-driven real estate governance through secure NFT credentials.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => updateState({ currentPage: 'projects' })}
              className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2"
            >
              <Building className="h-5 w-5" />
              <span>Explore Projects</span>
            </button>
            <button 
              onClick={() => updateState({ currentPage: 'dashboard' })}
              className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/10 transition-colors flex items-center justify-center space-x-2"
            >
              <Key className="h-5 w-5" />
              <span>Get Access Now</span>
            </button>
          </div>
          
          <div className="mt-8 text-blue-100 text-sm">
            * All governance activities are administered off-chain under Cayman Islands regulatory framework
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorksPage;
