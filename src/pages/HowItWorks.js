// src/pages/HowItWorks.js
import React from 'react';
import { useApp } from '../context/AppContext';
import { themes } from '../utils/themes';
import { typography } from '../utils/typography';

const HowItWorksPage = () => {
  const { theme } = useApp();
  
  return (
    <div className={`min-h-screen ${themes[theme].primary}`}>
      <section className={`pt-24 pb-12 ${themes[theme].secondary}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className={`${typography.h1(theme)} mb-6`}>How It Works</h1>
          <p className={typography.bodyLarge(theme)}>
            Understanding the CoinEstate NFT platform step by step.
          </p>
        </div>
      </section>
      
      <section className={`py-16 ${themes[theme].primary}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            <div>
              <h2 className={`${typography.h2(theme)} mb-4`}>Step 1: Understanding NFT Access</h2>
              <p className={typography.body(theme)}>
                CoinEstate NFTs are not investments or securities. They are digital access credentials 
                that grant verified holders the right to participate in property governance decisions.
              </p>
            </div>
            
            <div>
              <h2 className={`${typography.h2(theme)} mb-4`}>Step 2: KYC Verification</h2>
              <p className={typography.body(theme)}>
                All NFT holders must complete Know Your Customer (KYC) verification to link their 
                digital wallet to their verified identity, ensuring regulatory compliance.
              </p>
            </div>
            
            <div>
              <h2 className={`${typography.h2(theme)} mb-4`}>Step 3: Governance Participation</h2>
              <p className={typography.body(theme)}>
                Verified NFT holders can access exclusive property dashboards, view performance 
                metrics, and participate in governance decisions under Cayman Islands law.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorksPage;