import React from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet-async';

/**
 * Terms of Service Page Component
 * Comprehensive terms of service for CoinEstate NFT Platform
 */
const Terms = ({ theme = 'dark' }) => {
  const sections = [
    {
      title: '1. Platform Overview',
      content: [
        {
          subtitle: 'CoinEstate NFT Platform',
          items: [
            'CoinEstate Foundation operates a governance-based real estate platform',
            'NFTs represent governance voting rights, NOT securities or investment contracts',
            'Platform operates under Cayman Islands regulatory framework (CIMA)',
            'Access requires KYC verification and compliance with applicable laws',
            'Services are provided exclusively to eligible users in permitted jurisdictions'
          ]
        },
        {
          subtitle: 'Important Legal Clarification',
          items: [
            'NFTs grant governance rights over property operational decisions',
            'NFTs do NOT represent ownership of underlying real estate',
            'Revenue sharing is voluntary and administered off-chain under Cayman law',
            'No guarantees of returns, profits, or investment performance',
            'Past performance does not indicate future results'
          ]
        }
      ]
    },
    {
      title: '2. Eligibility and Account Requirements',
      content: [
        {
          subtitle: 'User Eligibility',
          items: [
            'Must be 18 years or older (or legal age in your jurisdiction)',
            'Must complete KYC verification through approved providers',
            'Must not be from restricted jurisdictions (US, sanctioned countries)',
            'Must have legal capacity to enter into binding agreements',
            'Must comply with local laws regarding digital assets and governance tokens'
          ]
        },
        {
          subtitle: 'Account Security',
          items: [
            'Users are responsible for wallet security and private key management',
            'Enable two-factor authentication for enhanced account protection',
            'Report suspicious activity or security breaches immediately',
            'Do not share account credentials or wallet access with others',
            'Regular security reviews and updates are your responsibility'
          ]
        }
      ]
    },
    {
      title: '3. NFT Governance Rights',
      content: [
        {
          subtitle: 'Voting Rights',
          items: [
            'Each NFT grants 1 vote on property governance decisions',
            'Maximum 10% voting control per wallet address to prevent centralization',
            'Voting on maintenance, repairs, contractor selection (< €5,000)',
            'Strategic decisions require 90% quorum for amounts > €20,000',
            'Non-participation may result in default voting rules application'
          ]
        },
        {
          subtitle: 'Participation Requirements',
          items: [
            'Active voting participation expected for all governance decisions',
            'Repeated non-participation may trigger community buyback provisions',
            '12-month inactivity may result in fair market value buyout',
            'Sanctions for disrupting governance processes or acting in bad faith',
            'Community standards must be maintained for platform integrity'
          ]
        }
      ]
    },
    {
      title: '4. Revenue Distribution',
      content: [
        {
          subtitle: 'Off-Chain Revenue Sharing',
          items: [
            'Revenue distribution is voluntary, not guaranteed',
            'Distributions administered by CoinEstate Foundation under Cayman law',
            'Revenue pooled at SPV level through regulated fund structure',
            'Only KYC-verified wallets eligible for revenue participation',
            'Tax obligations are the responsibility of individual participants'
          ]
        },
        {
          subtitle: 'Important Disclaimers',
          items: [
            'No contractual right to receive distributions',
            'Revenue sharing subject to property performance and expenses',
            'Foundation reserves right to modify distribution policies',
            'Compliance with applicable tax and regulatory requirements required',
            'Distribution timing and amounts at Foundation discretion'
          ]
        }
      ]
    },
    {
      title: '5. Platform Usage Rules',
      content: [
        {
          subtitle: 'Prohibited Activities',
          items: [
            'Market manipulation or coordinated voting schemes',
            'Impersonation of other users or providing false information',
            'Circumventing KYC requirements or geographic restrictions',
            'Using platform for illegal activities or money laundering',
            'Disrupting platform operations or attempting unauthorized access'
          ]
        },
        {
          subtitle: 'Content and Communications',
          items: [
            'All user communications subject to community standards',
            'No spam, harassment, or offensive content in platform discussions',
            'Respect intellectual property rights of others',
            'Financial advice or investment recommendations prohibited',
            'Platform reserves right to moderate and remove inappropriate content'
          ]
        }
      ]
    },
    {
      title: '6. Risks and Disclaimers',
      content: [
        {
          subtitle: 'Technology Risks',
          items: [
            'Smart contract bugs or vulnerabilities may cause loss of access',
            'Blockchain network congestion may delay transactions',
            'Wallet compromise or private key loss results in permanent asset loss',
            'Platform downtime or technical issues may temporarily restrict access',
            'Regulatory changes may impact platform operations or accessibility'
          ]
        },
        {
          subtitle: 'Investment and Market Risks',
          items: [
            'Real estate values may decline, affecting revenue distributions',
            'No guarantee of NFT liquidity or secondary market availability',
            'Regulatory changes may impact governance rights or revenue sharing',
            'Property damage, vacancy, or management issues may reduce returns',
            'Economic downturns may negatively impact all investments'
          ]
        }
      ]
    },
    {
      title: '7. Intellectual Property',
      content: [
        {
          subtitle: 'Platform Rights',
          items: [
            'CoinEstate Foundation owns all platform intellectual property',
            'Users receive limited license to use platform for intended purposes',
            'No right to reverse engineer, copy, or redistribute platform software',
            'User-generated content may be used for platform improvement',
            'Respect third-party intellectual property rights'
          ]
        }
      ]
    },
    {
      title: '8. Privacy and Data Protection',
      content: [
        {
          subtitle: 'Data Handling',
          items: [
            'Personal data processed according to our Privacy Policy',
            'KYC data shared with regulatory authorities as required',
            'Blockchain transactions are publicly visible and immutable',
            'Analytics data used for platform improvement and security',
            'User communications monitored for compliance and safety'
          ]
        }
      ]
    },
    {
      title: '9. Limitation of Liability',
      content: [
        {
          subtitle: 'Liability Limitations',
          items: [
            'Platform provided "as is" without warranties of any kind',
            'No liability for user losses due to market conditions or technology issues',
            'Maximum liability limited to fees paid to platform in preceding 12 months',
            'No liability for third-party actions or external service failures',
            'Force majeure events exclude platform liability'
          ]
        },
        {
          subtitle: 'Indemnification',
          items: [
            'Users indemnify platform against losses from their violations',
            'Users responsible for their own tax obligations and compliance',
            'Users liable for damages from unauthorized account access',
            'Legal costs recoverable for defending against user-caused claims'
          ]
        }
      ]
    },
    {
      title: '10. Dispute Resolution',
      content: [
        {
          subtitle: 'Governing Law and Jurisdiction',
          items: [
            'Terms governed by Cayman Islands law',
            'Disputes subject to Cayman Islands court jurisdiction',
            'Mandatory arbitration for disputes under $50,000 USD',
            'Class action lawsuits specifically waived',
            'Emergency injunctive relief available through courts'
          ]
        },
        {
          subtitle: 'Resolution Process',
          items: [
            'Contact support team first for informal resolution',
            'Formal mediation required before litigation',
            'Arbitration conducted under CICA rules in English',
            'Costs allocated according to arbitrator discretion',
            'Awards enforceable in any competent jurisdiction'
          ]
        }
      ]
    },
    {
      title: '11. Platform Modifications',
      content: [
        {
          subtitle: 'Service Changes',
          items: [
            'Platform features may be modified with notice to users',
            'Material changes require 30-day advance notification',
            'Emergency security updates may be implemented immediately',
            'Deprecated features will have reasonable transition periods',
            'User feedback considered for major platform changes'
          ]
        }
      ]
    },
    {
      title: '12. Termination',
      content: [
        {
          subtitle: 'Account Termination',
          items: [
            'Users may close accounts at any time (subject to outstanding obligations)',
            'Platform may terminate accounts for violations or legal requirements',
            'NFT ownership continues after account closure (blockchain-based)',
            'Data retention follows applicable legal requirements',
            'Termination does not affect completed transactions or governance votes'
          ]
        }
      ]
    }
  ];

  const effectiveDate = "June 29, 2025";
  const lastUpdated = "June 29, 2025";
  const version = "1.0";

  return (
    <>
      <Helmet>
        <title>Terms of Service - CoinEstate NFT Platform</title>
        <meta 
          name="description" 
          content="CoinEstate Foundation Terms of Service. Legal terms and conditions for using our real estate NFT governance platform under Cayman Islands law." 
        />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <div className={`min-h-screen py-20 px-4 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className={`text-4xl md:text-5xl font-bold mb-6 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Terms of Service
            </h1>
            <div className={`text-lg space-y-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              <p><strong>Last Updated:</strong> {lastUpdated}</p>
              <p><strong>Effective Date:</strong> {effectiveDate}</p>
              <p><strong>Version:</strong> {version}</p>
            </div>
          </div>

          {/* Important Notice */}
          <div className={`rounded-2xl p-8 mb-8 ${
            theme === 'dark' ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200'
          } border`}>
            <h2 className={`text-xl font-semibold mb-4 ${
              theme === 'dark' ? 'text-red-300' : 'text-red-800'
            }`}>
              ⚠️ Important Legal Notice
            </h2>
            <div className={`space-y-3 ${theme === 'dark' ? 'text-red-200' : 'text-red-700'}`}>
              <p>
                <strong>READ CAREFULLY:</strong> These Terms of Service ("Terms") constitute a legally binding 
                agreement between you and CoinEstate Foundation. By accessing or using our platform, 
                you agree to be bound by these Terms.
              </p>
              <p>
                <strong>NFT CLARIFICATION:</strong> CoinEstate NFTs grant governance rights only and do NOT 
                represent securities, investment contracts, or ownership of real estate. Revenue sharing 
                is voluntary and administered off-chain under Cayman Islands law.
              </p>
              <p>
                <strong>RISK WARNING:</strong> Participation involves significant risks including total loss of 
                investment. No guarantees of returns or profits. Consult legal and financial advisors 
                before participating.
              </p>
            </div>
          </div>

          {/* Terms Sections */}
          <div className="space-y-8">
            {sections.map((section, index) => (
              <div key={index} className={`rounded-xl p-6 ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              } border`}>
                <h2 className={`text-2xl font-semibold mb-6 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {section.title}
                </h2>
                
                <div className="space-y-6">
                  {section.content.map((subsection, subIndex) => (
                    <div key={subIndex}>
                      {subsection.subtitle && (
                        <h3 className={`text-lg font-medium mb-3 ${
                          theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                        }`}>
                          {subsection.subtitle}
                        </h3>
                      )}
                      <ul className={`space-y-2 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {subsection.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start">
                            <span className="text-blue-500 mr-2 mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Contact Information */}
          <div className={`rounded-xl p-6 mt-8 ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } border`}>
            <h2 className={`text-2xl font-semibold mb-6 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Contact Information
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className={`text-lg font-medium mb-3 ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                }`}>
                  Legal Questions
                </h3>
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Email: <a href="mailto:legal@coinestate.io" className="text-blue-500 hover:text-blue-600">
                    legal@coinestate.io
                  </a>
                </p>
              </div>
              
              <div>
                <h3 className={`text-lg font-medium mb-3 ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                }`}>
                  General Support
                </h3>
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Email: <a href="mailto:info@coinestate.io" className="text-blue-500 hover:text-blue-600">
                    info@coinestate.io
                  </a>
                </p>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className={`text-lg font-medium mb-3 ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
              }`}>
                Registered Office
              </h3>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                CoinEstate Foundation<br />
                George Town, Grand Cayman<br />
                Cayman Islands<br />
                Registration: [To be completed upon incorporation]
              </p>
            </div>
          </div>

          {/* Acknowledgment */}
          <div className={`rounded-xl p-6 mt-8 ${
            theme === 'dark' ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'
          } border`}>
            <h3 className={`text-lg font-semibold mb-3 ${
              theme === 'dark' ? 'text-blue-300' : 'text-blue-800'
            }`}>
              Acknowledgment
            </h3>
            <p className={`${theme === 'dark' ? 'text-blue-200' : 'text-blue-700'}`}>
              By using the CoinEstate NFT Platform, you acknowledge that you have read, understood, 
              and agree to be bound by these Terms of Service. You also acknowledge that you have 
              read our Privacy Policy and understand how your information will be processed.
            </p>
          </div>

          {/* Footer Notice */}
          <div className={`text-center mt-8 pt-8 border-t ${
            theme === 'dark' ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'
          }`}>
            <p className="text-sm">
              © 2025 CoinEstate Foundation. All rights reserved.<br />
              Regulated under Cayman Islands law | Not available in restricted jurisdictions
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

Terms.propTypes = {
  theme: PropTypes.oneOf(['light', 'dark', 'blue'])
};

export default Terms;
