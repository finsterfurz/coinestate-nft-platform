// src/pages/About.js
import React from 'react';
import { useApp } from '../context/AppContext';
import { themes } from '../utils/themes';
import { typography } from '../utils/typography';

const AboutPage = () => {
  const { theme } = useApp();
  
  return (
    <div className={`min-h-screen ${themes[theme].primary}`}>
      <section className={`pt-24 pb-12 ${themes[theme].secondary}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className={`${typography.h1(theme)} mb-6`}>About CoinEstate</h1>
          <p className={typography.bodyLarge(theme)}>
            Learn more about our mission and approach to NFT-based real estate access.
          </p>
        </div>
      </section>
      
      <section className={`py-16 ${themes[theme].primary}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            <div>
              <h2 className={`${typography.h2(theme)} mb-4`}>Our Mission</h2>
              <p className={typography.body(theme)}>
                CoinEstate NFT is revolutionizing real estate access through blockchain technology 
                while maintaining strict regulatory compliance. Our platform provides secure, 
                transferable access credentials to premium real estate projects.
              </p>
            </div>
            
            <div>
              <h2 className={`${typography.h2(theme)} mb-4`}>Legal Framework</h2>
              <p className={typography.body(theme)}>
                Operating under Cayman Islands Private Fund + Foundation structure, we ensure 
                clear legal boundaries between NFT access credentials and financial operations. 
                Our approach prioritizes compliance and user protection.
              </p>
            </div>
            
            <div>
              <h2 className={`${typography.h2(theme)} mb-4`}>Technology</h2>
              <p className={typography.body(theme)}>
                Built on secure blockchain infrastructure with KYC verification and off-chain 
                governance mechanisms. Our platform bridges traditional real estate with 
                modern blockchain technology.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;