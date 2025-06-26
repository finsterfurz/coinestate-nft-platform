import React from 'react';
import { useApp } from '../context/AppContext';
import { typography } from '../utils/typography';
import { Shield, Building, Users, Globe, Key, Check, ArrowRight } from '../components/icons/AllIcons.js';

// ==================== ABOUT PAGE ====================
const AboutPage = () => {
  const { theme, updateState } = useApp();

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <section className={`pt-24 pb-12 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className={`text-4xl md:text-5xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            About CoinEstate
          </h1>
          <p className={`text-xl ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Pioneering community governance in real estate through compliant NFT credentials
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className={`py-16 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className={`${typography.h2(theme)} mb-6`}>
                Our Mission
              </h2>
              <p className={`${typography.bodyLarge(theme)} mb-6 leading-relaxed`}>
                CoinEstate is revolutionizing real estate governance by providing community-driven decision-making through blockchain-based NFT credentials. We believe that property stakeholders should have a direct voice in operational decisions.
              </p>
              <p className={`${typography.body(theme)} mb-8 leading-relaxed`}>
                Operating under Cayman Islands regulatory framework, we ensure that all governance activities are compliant, transparent, and legally sound while maintaining the innovative spirit of decentralized decision-making.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => updateState({ currentPage: 'projects' })}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Building className="h-5 w-5" />
                  <span>View Our Projects</span>
                </button>
                <button 
                  onClick={() => updateState({ currentPage: 'how-it-works' })}
                  className={`border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 ${
                    theme === 'dark' ? 'hover:bg-blue-600 hover:text-white' : 'hover:bg-blue-50'
                  }`}
                >
                  <span>How It Works</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className={`rounded-2xl p-8 ${
              theme === 'dark' 
                ? 'bg-gradient-to-br from-gray-800 to-indigo-900' 
                : 'bg-gradient-to-br from-blue-50 to-indigo-50'
            }`}>
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Globe className="w-8 h-8 text-white" />
                  </div>
                  <h3 className={`${typography.h4(theme)} mb-2`}>Global Reach</h3>
                  <p className={`${typography.bodySmall(theme)}`}>
                    Properties across major European markets
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600 mb-1">€50M+</div>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Portfolio Value
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600 mb-1">8</div>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Active Projects
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className={`py-16 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className={`${typography.h2(theme)} mb-4`}>
              Our Core Values
            </h2>
            <p className={`${typography.bodyLarge(theme)} max-w-3xl mx-auto`}>
              The principles that guide our approach to community governance and real estate management
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className={`text-center p-6 rounded-xl ${
              theme === 'dark' ? 'bg-gray-900' : 'bg-white'
            } shadow-lg`}>
              <div className="w-12 h-12 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className={`${typography.h5(theme)} mb-3`}>Compliance First</h3>
              <p className={`${typography.bodySmall(theme)}`}>
                Operating under Cayman Islands regulatory framework with full legal compliance
              </p>
            </div>
            
            <div className={`text-center p-6 rounded-xl ${
              theme === 'dark' ? 'bg-gray-900' : 'bg-white'
            } shadow-lg`}>
              <div className="w-12 h-12 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className={`${typography.h5(theme)} mb-3`}>Community Driven</h3>
              <p className={`${typography.bodySmall(theme)}`}>
                Every major decision is made through transparent community voting mechanisms
              </p>
            </div>
            
            <div className={`text-center p-6 rounded-xl ${
              theme === 'dark' ? 'bg-gray-900' : 'bg-white'
            } shadow-lg`}>
              <div className="w-12 h-12 bg-indigo-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Key className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className={`${typography.h5(theme)} mb-3`}>Secure Access</h3>
              <p className={`${typography.bodySmall(theme)}`}>
                KYC-verified NFT credentials ensure only authorized participants can vote
              </p>
            </div>
            
            <div className={`text-center p-6 rounded-xl ${
              theme === 'dark' ? 'bg-gray-900' : 'bg-white'
            } shadow-lg`}>
              <div className="w-12 h-12 bg-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Building className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className={`${typography.h5(theme)} mb-3`}>Quality Assets</h3>
              <p className={`${typography.bodySmall(theme)}`}>
                Carefully selected premium properties in major European markets
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Legal Framework */}
      <section className={`py-16 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className={`${typography.h2(theme)} mb-6`}>
                Legal Framework
              </h2>
              <p className={`${typography.body(theme)} mb-6 leading-relaxed`}>
                CoinEstate operates under a carefully structured legal framework designed to provide governance rights while maintaining regulatory compliance across jurisdictions.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className={`${typography.h6(theme)} mb-1`}>Cayman Islands Foundation</h4>
                    <p className={`${typography.bodySmall(theme)}`}>
                      Registered under CIMA regulations with proper governance structures
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className={`${typography.h6(theme)} mb-1`}>NFT Positioning</h4>
                    <p className={`${typography.bodySmall(theme)}`}>
                      Clearly defined as governance credentials, not securities or investments
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className={`${typography.h6(theme)} mb-1`}>KYC Requirements</h4>
                    <p className={`${typography.bodySmall(theme)}`}>
                      Mandatory identity verification for all participants
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className={`${typography.h6(theme)} mb-1`}>Off-Chain Governance</h4>
                    <p className={`${typography.bodySmall(theme)}`}>
                      All voting and distributions administered through legal entities
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className={`rounded-2xl p-8 border-2 ${
              theme === 'dark' 
                ? 'bg-gray-800 border-green-600' 
                : 'bg-green-50 border-green-200'
            }`}>
              <h3 className={`${typography.h3(theme)} mb-6 text-center`}>
                Legal Structure
              </h3>
              
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-white'
                } border-l-4 border-blue-500`}>
                  <h4 className={`${typography.h6(theme)} mb-2`}>CoinEstate Foundation</h4>
                  <p className={`${typography.bodySmall(theme)}`}>
                    Cayman Islands foundation governing all operations and distributions
                  </p>
                </div>
                
                <div className={`p-4 rounded-lg ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-white'
                } border-l-4 border-green-500`}>
                  <h4 className={`${typography.h6(theme)} mb-2`}>Property SPVs</h4>
                  <p className={`${typography.bodySmall(theme)}`}>
                    Individual special purpose vehicles for each property
                  </p>
                </div>
                
                <div className={`p-4 rounded-lg ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-white'
                } border-l-4 border-purple-500`}>
                  <h4 className={`${typography.h6(theme)} mb-2`}>NFT Smart Contracts</h4>
                  <p className={`${typography.bodySmall(theme)}`}>
                    Blockchain-based access credentials with governance rights
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team/Contact */}
      <section className={`py-16 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className={`${typography.h2(theme)} mb-6`}>
            Get in Touch
          </h2>
          <p className={`${typography.bodyLarge(theme)} mb-8`}>
            Questions about governance rights, legal structure, or how to participate? We're here to help.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div>
              <h4 className={`${typography.h5(theme)} mb-2`}>General Inquiries</h4>
              <p className={`${typography.bodySmall(theme)}`}>
                info@coinestate.foundation
              </p>
            </div>
            <div>
              <h4 className={`${typography.h5(theme)} mb-2`}>Legal & Compliance</h4>
              <p className={`${typography.bodySmall(theme)}`}>
                legal@coinestate.foundation
              </p>
            </div>
            <div>
              <h4 className={`${typography.h5(theme)} mb-2`}>Technical Support</h4>
              <p className={`${typography.bodySmall(theme)}`}>
                support@coinestate.foundation
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => updateState({ currentPage: 'dashboard' })}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Key className="h-5 w-5" />
              <span>Start Governance</span>
            </button>
            <button className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors">
              Schedule Consultation
            </button>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className={`py-8 border-t ${
        theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
            <strong>Important Legal Notice:</strong> CoinEstate NFTs are governance credentials that provide voting rights and operational control over real estate decisions. 
            They do not represent securities, investment contracts, or ownership interests in underlying properties. 
            All governance participation and rewards are administered off-chain by CoinEstate Foundation under Cayman Islands law. 
            Past performance does not guarantee future results. Please consult legal and financial advisors before participation.
          </p>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
