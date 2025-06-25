import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { typography } from '../utils/typography';
import { 
  Globe, 
  Building, 
  ArrowRight, 
  Check, 
  Shield, 
  Key, 
  Users, 
  ChevronDown 
} from '../components/icons/AllIcons';

// ==================== HOMEPAGE ====================
const Homepage = () => {
  const { updateState, theme } = useApp();
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "What exactly do CoinEstate NFTs represent?",
      answer: "CoinEstate NFTs are digital access credentials that grant you exclusive dashboard access to specific real estate projects. They are not equity shares, securities, or investment contracts, but rather software access keys linked to your verified identity."
    },
    {
      question: "How does the KYC process work?",
      answer: "After acquiring an NFT, you must complete our KYC verification process to link your wallet to verified credentials. This enables dashboard access and eligibility for off-chain participation under our Cayman structure. KYC is required for all access features."
    },
    {
      question: "Can I transfer my NFT to someone else?",
      answer: "Yes, NFTs are transferable. However, the current holder must first deregister via our platform, making the NFT unlinked. The new holder must then complete their own KYC process to activate dashboard access rights."
    },
    {
      question: "What is the legal structure behind CoinEstate?",
      answer: "CoinEstate operates under a Cayman Islands Private Fund + Foundation structure. The CoinEstate Foundation governs distributions and participation rights, which are administered off-chain and separate from the NFT smart contracts."
    },
    {
      question: "How are participation rights handled?",
      answer: "Participation in revenue distributions is voluntary and administered off-chain under Cayman law by the CoinEstate Foundation. Only wallets with verified KYC and valid NFT access credentials are eligible for participation opportunities."
    }
  ];

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      {/* Hero Section */}
      <section className={`pt-24 pb-16 ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900' 
          : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium mb-6 ${
                theme === 'dark' 
                  ? 'bg-blue-900/50 text-blue-300' 
                  : 'bg-blue-100 text-blue-700'
              }`}>
                <Globe className="h-4 w-4" />
                <span>Cayman Islands Regulated</span>
              </div>
              
              <h1 className={`${typography.h1(theme)} leading-tight mb-6`}>
                Access Premium
                <span className={typography.gradient}> Real Estate</span>
                <br />Through NFT Keys
              </h1>
              
              <p className={`${typography.bodyLarge(theme)} mb-8 leading-relaxed`}>
                CoinEstateNFT provides community governance access to real estate projects through KYC-verified NFT credentials. Each NFT serves as your voting key to property decisions, operational control, and community participation opportunities.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button 
                  onClick={() => updateState({ currentPage: 'projects' })}
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <Building className="h-5 w-5" />
                  <span>View Projects</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => updateState({ currentPage: 'dashboard' })}
                  className={`border-2 border-blue-600 text-blue-600 px-6 py-4 rounded-lg text-base font-medium transition-colors flex items-center justify-center space-x-2 ${
                    theme === 'dark' ? 'hover:bg-blue-600 hover:text-white' : 'hover:bg-blue-50'
                  }`}
                >
                  <Key className="h-4 w-4" />
                  <span>Get Access</span>
                </button>
              </div>
              
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>KYC Verified Access</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Transferable Rights</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Cayman Regulated</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className={`rounded-2xl shadow-2xl p-8 border ${
                theme === 'dark' 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-100'
              }`}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Property Access
                    </span>
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">Active</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className={`rounded-lg p-4 ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                    }`}>
                      <div className="flex justify-between items-center">
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                          Vienna Luxury #247
                        </span>
                        <Key className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className={`mt-2 text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        NFT #0247/2500
                      </div>
                    </div>
                    
                    <div className={`rounded-lg p-4 ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                    }`}>
                      <div className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        Dashboard Access
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Property Data</span>
                          <span className="text-green-600 text-sm">✓ Unlocked</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Performance Metrics</span>
                          <span className="text-green-600 text-sm">✓ Unlocked</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Participation Rights</span>
                          <span className="text-green-600 text-sm">✓ Active</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-blue-600 text-white p-3 rounded-lg shadow-lg">
                <Shield className="h-6 w-6" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-indigo-600 text-white p-3 rounded-lg shadow-lg">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Progress Tracker */}
      <section className={`py-12 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h3 className={`${typography.h3(theme)} mb-2`}>
              Your Governance Journey
            </h3>
            <p className={typography.body(theme)}>
              Four simple steps to community real estate governance
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0 md:space-x-4">
              {[
                {
                  step: 1,
                  title: "Explore Projects",
                  description: "Browse our portfolio of real estate opportunities",
                  icon: Building,
                  status: "available",
                  action: "Browse Now"
                },
                {
                  step: 2,
                  title: "Acquire NFT",
                  description: "Purchase governance access credentials",
                  icon: Key,
                  status: "pending",
                  action: "Get NFT"
                },
                {
                  step: 3,
                  title: "Complete KYC",
                  description: "Verify identity for compliance access",
                  icon: Shield,
                  status: "locked",
                  action: "Verify ID"
                },
                {
                  step: 4,
                  title: "Participate",
                  description: "Vote and monitor property performance",
                  icon: Users,
                  status: "locked",
                  action: "Start Voting"
                }
              ].map((item, index) => {
                const Icon = item.icon;
                const isActive = item.status === "available";
                const isCompleted = item.status === "completed";
                const isPending = item.status === "pending";
                
                return (
                  <div key={index} className="flex flex-col items-center text-center max-w-xs">
                    <div className={`relative w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all duration-300 ${
                      isCompleted 
                        ? 'bg-green-600 text-white'
                        : isActive 
                          ? 'bg-blue-600 text-white shadow-lg scale-110'
                          : isPending
                            ? theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-500'
                            : theme === 'dark' ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {isCompleted ? (
                        <Check className="w-6 h-6" />
                      ) : (
                        <Icon className="w-6 h-6" />
                      )}
                      
                      <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                        isActive 
                          ? 'bg-blue-700 text-white'
                          : isCompleted
                            ? 'bg-green-700 text-white'
                            : theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-300 text-gray-600'
                      }`}>
                        {item.step}
                      </div>
                    </div>
                    
                    <h4 className={`text-lg font-semibold mb-2 ${
                      isActive || isCompleted 
                        ? theme === 'dark' ? 'text-white' : 'text-gray-900'
                        : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {item.title}
                    </h4>
                    <p className={`text-sm mb-4 ${
                      isActive || isCompleted 
                        ? theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        : theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      {item.description}
                    </p>
                    
                    <button 
                      onClick={() => {
                        if (item.step === 1) updateState({ currentPage: 'projects' });
                        if (item.step === 2) updateState({ currentPage: 'dashboard' });
                      }}
                      disabled={!isActive && !isCompleted}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive 
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : isCompleted
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {isCompleted ? 'Completed' : item.action}
                    </button>
                  </div>
                );
              })}
            </div>
            
            <div className={`mt-8 h-2 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <div 
                className="h-full bg-gradient-to-r from-blue-600 to-green-600 rounded-full transition-all duration-500"
                style={{ width: '25%' }}
              />
            </div>
            
            <div className="text-center mt-4">
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Progress: 1 of 4 steps completed
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className={`py-16 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className={`${typography.h2(theme)} mb-4`}>
              Frequently Asked Questions
            </h2>
            <p className={typography.bodyLarge(theme)}>
              Understanding CoinEstate NFT access credentials
            </p>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className={`rounded-lg border overflow-hidden transition-all duration-200 ${
                theme === 'dark' 
                  ? 'bg-gray-900 border-gray-700' 
                  : 'bg-white border-gray-200'
              } ${openFaq === index ? 'shadow-lg' : 'shadow-sm'}`}>
                <button
                  className={`w-full px-6 py-4 text-left flex justify-between items-center transition-all duration-200 ${
                    theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                  } ${openFaq === index ? (theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50') : ''}`}
                  onClick={() => toggleFaq(index)}
                >
                  <span className={`${typography.h5(theme)} font-semibold`}>
                    {faq.question}
                  </span>
                  <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${
                    openFaq === index ? 'rotate-180' : ''
                  } ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
                <div className={`transition-all duration-300 ease-in-out ${
                  openFaq === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="px-6 pb-4">
                    <div className={`pt-2 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                      <p className={`leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Join Community Governance?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join our KYC-verified community and gain voting rights on real estate decisions through secure NFT governance credentials.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => updateState({ currentPage: 'dashboard' })}
              className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2"
            >
              <Key className="h-5 w-5" />
              <span>Get Your Governance NFT</span>
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/10 transition-colors">
              Contact Support
            </button>
          </div>
          
          <div className="mt-8 text-blue-100 text-sm">
            * NFTs serve as governance credentials only. Voting participation and rewards are administered off-chain under Cayman law.
          </div>
        </div>
      </section>
    </div>
  );
};

export default Homepage;
