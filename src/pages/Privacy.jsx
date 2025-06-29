import React from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet-async';

/**
 * Privacy Policy Page Component
 * Comprehensive privacy policy for GDPR and Cayman Islands compliance
 */
const Privacy = ({ theme = 'dark' }) => {
  const sections = [
    {
      title: '1. Information We Collect',
      content: [
        {
          subtitle: 'Personal Information',
          items: [
            'Full name, date of birth, nationality (for KYC verification)',
            'Email address and contact information',
            'Government-issued identification documents',
            'Proof of address and residency verification',
            'Financial information related to investment capacity'
          ]
        },
        {
          subtitle: 'Blockchain & Wallet Data',
          items: [
            'Ethereum wallet addresses and public keys',
            'Transaction hashes and blockchain interactions',
            'NFT ownership records and voting history',
            'Smart contract interaction logs'
          ]
        },
        {
          subtitle: 'Technical Information',
          items: [
            'IP addresses and device identifiers',
            'Browser type, operating system, and device information',
            'Usage analytics and website interaction data',
            'Performance metrics and error logs'
          ]
        }
      ]
    },
    {
      title: '2. How We Use Your Information',
      content: [
        {
          subtitle: 'Platform Operations',
          items: [
            'Verify your identity and comply with KYC/AML regulations',
            'Process NFT transactions and governance voting',
            'Provide access to property dashboards and performance data',
            'Calculate and distribute income from real estate properties'
          ]
        },
        {
          subtitle: 'Legal Compliance',
          items: [
            'Meet Cayman Islands regulatory requirements (CIMA)',
            'Comply with international anti-money laundering laws',
            'Respond to legal requests and regulatory inquiries',
            'Maintain audit trails for compliance purposes'
          ]
        },
        {
          subtitle: 'Communication & Support',
          items: [
            'Send important platform updates and governance notifications',
            'Provide customer support and technical assistance',
            'Share investment performance reports and market updates',
            'Notify about changes to terms, policies, or regulations'
          ]
        }
      ]
    },
    {
      title: '3. Information Sharing',
      content: [
        {
          subtitle: 'We Share Information With:',
          items: [
            'KYC/AML service providers (Jumio, Onfido) for identity verification',
            'Legal and compliance advisors in relevant jurisdictions',
            'Cayman Islands regulatory authorities when required by law',
            'Property management companies for operational decisions',
            'Blockchain networks (public transaction data only)'
          ]
        },
        {
          subtitle: 'We Do NOT Share:',
          items: [
            'Personal information with marketing companies',
            'Private keys or wallet access credentials',
            'Individual investment details with other users',
            'Personal data for commercial purposes unrelated to our platform'
          ]
        }
      ]
    },
    {
      title: '4. Data Security',
      content: [
        {
          subtitle: 'Security Measures',
          items: [
            'End-to-end encryption for all sensitive data transmission',
            'Multi-factor authentication for account access',
            'Regular security audits and penetration testing',
            'SOC 2 Type II compliant data centers',
            'Employee background checks and security training'
          ]
        },
        {
          subtitle: 'Data Storage',
          items: [
            'Personal data encrypted at rest using AES-256',
            'Geographically distributed backups with encryption',
            'Limited access controls with audit logging',
            'Regular data integrity checks and monitoring'
          ]
        }
      ]
    },
    {
      title: '5. Your Rights (GDPR Compliance)',
      content: [
        {
          subtitle: 'You Have the Right To:',
          items: [
            'Access your personal data and receive a copy',
            'Correct inaccurate or incomplete information',
            'Request deletion of your data (subject to legal requirements)',
            'Object to processing for direct marketing purposes',
            'Data portability to another service provider',
            'Withdraw consent where processing is based on consent'
          ]
        },
        {
          subtitle: 'Important Notes:',
          items: [
            'Some data retention is required by Cayman Islands law',
            'Blockchain transactions cannot be deleted due to their immutable nature',
            'KYC data must be retained for regulatory compliance (7 years)',
            'We will respond to valid requests within 30 days'
          ]
        }
      ]
    },
    {
      title: '6. Cookies and Tracking',
      content: [
        {
          subtitle: 'We Use Cookies For:',
          items: [
            'Essential platform functionality and security',
            'Remembering your preferences and login status',
            'Analytics to improve platform performance',
            'Fraud prevention and security monitoring'
          ]
        },
        {
          subtitle: 'Cookie Types:',
          items: [
            'Strictly necessary cookies (cannot be disabled)',
            'Functional cookies (enhance user experience)',
            'Analytics cookies (Google Analytics, Hotjar)',
            'Security cookies (CSRF protection, session management)'
          ]
        }
      ]
    },
    {
      title: '7. International Data Transfers',
      content: [
        {
          subtitle: 'Data Transfer Safeguards:',
          items: [
            'Standard Contractual Clauses (SCCs) for EU data transfers',
            'Adequacy decisions where available',
            'Data Processing Agreements with all service providers',
            'Regular compliance monitoring and audits'
          ]
        }
      ]
    },
    {
      title: '8. Data Retention',
      content: [
        {
          subtitle: 'Retention Periods:',
          items: [
            'KYC and identity data: 7 years after account closure',
            'Transaction records: 7 years for regulatory compliance',
            'Communication logs: 3 years for support purposes',
            'Analytics data: 26 months for performance optimization',
            'Marketing data: Until consent is withdrawn'
          ]
        }
      ]
    },
    {
      title: '9. Children\'s Privacy',
      content: [
        {
          subtitle: 'Age Restrictions:',
          items: [
            'Our platform is not intended for users under 18 years',
            'We do not knowingly collect data from minors',
            'Age verification is required during KYC process',
            'Parents/guardians should contact us if a minor has provided information'
          ]
        }
      ]
    },
    {
      title: '10. Changes to This Policy',
      content: [
        {
          subtitle: 'Policy Updates:',
          items: [
            'We will notify users of material changes via email',
            'Platform notifications will announce policy updates',
            'Updated policies are effective 30 days after notification',
            'Continued use constitutes acceptance of changes'
          ]
        }
      ]
    }
  ];

  const contactInfo = {
    dpo: 'dpo@coinestate.io',
    privacy: 'privacy@coinestate.io',
    address: 'CoinEstate Foundation, George Town, Grand Cayman, Cayman Islands'
  };

  return (
    <>
      <Helmet>
        <title>Privacy Policy - CoinEstate NFT Platform</title>
        <meta 
          name="description" 
          content="CoinEstate Foundation Privacy Policy. Learn how we collect, use, and protect your personal data in compliance with GDPR and Cayman Islands regulations." 
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
              Privacy Policy
            </h1>
            <div className={`text-lg space-y-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              <p><strong>Last Updated:</strong> June 29, 2025</p>
              <p><strong>Effective Date:</strong> June 29, 2025</p>
              <p><strong>Version:</strong> 1.0</p>
            </div>
          </div>

          {/* Introduction */}
          <div className={`rounded-2xl p-8 mb-8 ${
            theme === 'dark' ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'
          } border`}>
            <h2 className={`text-xl font-semibold mb-4 ${
              theme === 'dark' ? 'text-blue-300' : 'text-blue-800'
            }`}>
              Important Notice
            </h2>
            <p className={`${theme === 'dark' ? 'text-blue-200' : 'text-blue-700'}`}>
              CoinEstate Foundation ("we," "our," or "us") is committed to protecting your privacy 
              and personal data. This Privacy Policy explains how we collect, use, share, and 
              protect information about you when you use our real estate NFT platform and services. 
              This policy complies with the General Data Protection Regulation (GDPR) and 
              Cayman Islands data protection laws.
            </p>
          </div>

          {/* Main Content */}
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
                  Data Protection Officer
                </h3>
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Email: <a href={`mailto:${contactInfo.dpo}`} className="text-blue-500 hover:text-blue-600">
                    {contactInfo.dpo}
                  </a>
                </p>
              </div>
              
              <div>
                <h3 className={`text-lg font-medium mb-3 ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                }`}>
                  Privacy Questions
                </h3>
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Email: <a href={`mailto:${contactInfo.privacy}`} className="text-blue-500 hover:text-blue-600">
                    {contactInfo.privacy}
                  </a>
                </p>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className={`text-lg font-medium mb-3 ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
              }`}>
                Postal Address
              </h3>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                {contactInfo.address}
              </p>
            </div>
          </div>

          {/* Footer Notice */}
          <div className={`rounded-xl p-6 mt-8 ${
            theme === 'dark' ? 'bg-yellow-900/20 border-yellow-700' : 'bg-yellow-50 border-yellow-200'
          } border`}>
            <div className="flex items-start space-x-3">
              <div className="text-yellow-500 text-xl">⚠️</div>
              <div>
                <h3 className={`font-semibold mb-2 ${
                  theme === 'dark' ? 'text-yellow-300' : 'text-yellow-800'
                }`}>
                  Legal Disclaimer
                </h3>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-yellow-200' : 'text-yellow-700'
                }`}>
                  This privacy policy is governed by Cayman Islands law. Any disputes relating to this 
                  policy will be subject to the exclusive jurisdiction of the Cayman Islands courts. 
                  If you do not agree with this policy, please do not use our platform.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

Privacy.propTypes = {
  theme: PropTypes.oneOf(['light', 'dark', 'blue'])
};

export default Privacy;
