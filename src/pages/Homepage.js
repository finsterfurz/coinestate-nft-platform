// src/pages/Homepage.js
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building, 
  Globe, 
  Shield, 
  Key, 
  Users, 
  ArrowRight, 
  Check, 
  ChevronDown
} from '../components/icons';
import { themes } from '../utils/themes';
import { typography } from '../utils/typography';

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
    <div className={`min-h-screen ${themes[theme].primary}`}>
      {/* Hero Section */}
      <section className={`pt-24 pb-16 ${
        theme === 'coinblue' 
          ? 'bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950' 
          : theme === 'dark' 
            ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900' 
            : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium mb-6 ${
                theme === 'coinblue' ? 'bg-blue-900/50 text-blue-300' : 
                theme === 'dark' ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700'
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
                CoinEstateNFT provides community governance access to real estate projects through KYC-verified NFT credentials.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button 
                  onClick={() => updateState({ currentPage: 'projects' })}
                  className={`px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 flex items-center justify-center space-x-2 ${themes[theme].button.primary}`}
                >
                  <Building className="h-5 w-5" />
                  <span>View Projects</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => updateState({ currentPage: 'dashboard' })}
                  className={`px-6 py-4 rounded-lg text-base font-medium transition-colors flex items-center justify-center space-x-2 ${themes[theme].button.secondary}`}
                >
                  <Key className="h-4 w-4" />
                  <span>Get Access</span>
                </button>
              </div>
              
              <div className={`flex items-center space-x-6 text-sm ${themes[theme].text.tertiary}`}>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>KYC Verified</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Transferable</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Regulated</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className={`rounded-2xl shadow-2xl p-8 border ${themes[theme].card}`}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${themes[theme].text.tertiary}`}>Property Access</span>
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">Active</span>
                  </div>
                  
                  <div className={`rounded-lg p-4 ${themes[theme].secondary}`}>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${themes[theme].text.secondary}`}>Vienna Luxury #247</span>
                      <Key className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className={`mt-2 text-lg font-semibold ${themes[theme].text.primary}`}>NFT #0247/2500</div>
                  </div>
                </div>
              </div>
              
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

      {/* How It Works Section */}
      <section className={`py-16 ${themes[theme].primary}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`${typography.h2(theme)} mb-4`}>How CoinEstate NFT Works</h2>
            <p className={`${typography.bodyLarge(theme)} max-w-3xl mx-auto`}>
              Our NFTs serve as secure access credentials to exclusive real estate dashboards, not as financial instruments or equity shares.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className={`rounded-xl p-8 shadow-lg border-2 text-center transition-all hover:shadow-xl hover:border-blue-300 ${
              theme === 'coinblue' ? 'bg-blue-900/40 border-blue-600' : 
              theme === 'dark' ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'
            }`}>
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <Key className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className={`${typography.h4(theme)} mb-4`}>1. Acquire Access NFT</h3>
              <p className={theme === 'coinblue' ? 'text-blue-200' : theme === 'dark' ? 'text-blue-200' : 'text-blue-800'}>
                Purchase an NFT that corresponds to a specific real estate project. Each NFT serves as your unique access credential to that property's dashboard.
              </p>
            </div>
            
            <div className={`rounded-xl p-8 shadow-lg border-2 text-center transition-all hover:shadow-xl ${
              theme === 'coinblue' ? 'bg-blue-800/30 border-green-500 hover:border-green-400' : 
              theme === 'dark' ? 'bg-gray-800 border-green-600 hover:border-green-500' : 'bg-white border-green-300 hover:border-green-400'
            }`}>
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className={`${typography.h4(theme)} mb-4`}>2. Complete KYC Verification</h3>
              <p className={themes[theme].text.secondary}>
                Undergo our secure KYC process to link your wallet to verified credentials. This ensures compliant access to dashboard features and participation rights.
              </p>
            </div>
            
            <div className={`rounded-xl p-8 shadow-lg border-2 text-center transition-all hover:shadow-xl hover:border-indigo-300 ${
              theme === 'coinblue' ? 'bg-indigo-900/40 border-indigo-600' : 
              theme === 'dark' ? 'bg-indigo-900/20 border-indigo-700' : 'bg-indigo-50 border-indigo-200'
            }`}>
              <div className="bg-indigo-100 rounded-full p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <Building className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className={`${typography.h4(theme)} mb-4`}>3. Access Property Dashboard</h3>
              <p className={theme === 'coinblue' ? 'text-indigo-200' : theme === 'dark' ? 'text-indigo-200' : 'text-indigo-800'}>
                Use your verified NFT to access exclusive property data, performance metrics, and participate in off-chain governance under Cayman law.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className={`py-16 ${themes[theme].secondary}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className={`${typography.h2(theme)} mb-4`}>Frequently Asked Questions</h2>
            <p className={typography.bodyLarge(theme)}>Understanding CoinEstate NFT access credentials</p>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className={`rounded-lg border overflow-hidden transition-all duration-200 ${themes[theme].card} ${
                openFaq === index ? 'shadow-lg' : 'shadow-sm'
              }`}>
                <button
                  className={`w-full px-6 py-4 text-left flex justify-between items-center transition-all duration-200 ${
                    openFaq === index ? themes[theme].secondary : ''
                  } hover:${themes[theme].secondary.split(' ')[0]}`}
                  onClick={() => toggleFaq(index)}
                >
                  <span className={`${typography.h5(theme)} font-semibold`}>{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${
                    openFaq === index ? 'transform rotate-180' : ''
                  }`} />
                </button>
                <div className={`transition-all duration-300 ease-in-out ${
                  openFaq === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="px-6 pb-4">
                    <div className={`pt-2 border-t ${themes[theme].border}`}>
                      <p className={`leading-relaxed ${themes[theme].text.secondary}`}>{faq.answer}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Homepage;