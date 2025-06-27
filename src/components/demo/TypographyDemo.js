import React from 'react';
import { typography, formatFinancialAmount, formatNFTId, formatWalletAddress, formatPerformance } from '../utils/typography';

// ==================== TYPOGRAPHY DEMO COMPONENT ====================
/**
 * Demonstriert das Inter + JetBrains Mono Typography System
 * Zeigt alle verfügbaren Schriftarten und Formatierungen
 */
const TypographyDemo = ({ theme = 'light' }) => {
  // Beispiel-Daten für die Demonstration
  const sampleData = {
    propertyValue: 12500000,
    monthlyRent: 41250,
    nftId: { project: 'VLA', tokenId: 247, total: 2500 },
    walletAddress: '0x742d35Cc6Bf4532B8C3F8C71F7Eab0a4A4b7c8f9',
    performance: 5.2,
    occupancyRate: 97.3
  };

  const formattedValue = formatFinancialAmount(sampleData.propertyValue, '€', theme);
  const formattedRent = formatFinancialAmount(sampleData.monthlyRent, '€', theme);
  const formattedNFT = formatNFTId(sampleData.nftId.project, sampleData.nftId.tokenId, sampleData.nftId.total, theme);
  const formattedWallet = formatWalletAddress(sampleData.walletAddress, theme);
  const formattedPerformance = formatPerformance(sampleData.performance, theme);

  return (
    <div className={`p-8 space-y-8 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Header */}
      <div className="text-center">
        <h1 className={typography.gradient}>
          Inter + JetBrains Mono Typography System
        </h1>
        <p className={typography.bodyLarge(theme)}>
          Professional Fintech Typography für CoinEstate NFT Platform
        </p>
      </div>

      {/* INTER Font Section */}
      <section className={`p-6 rounded-lg border ${
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-blue-200'
      }`}>
        <h2 className={typography.h3(theme)}>
          🎯 Inter Font - UI & Headlines
        </h2>
        <p className={typography.body(theme)}>
          Verwendet für alle UI-Elemente, Headlines und Body Text. Bekannt von Stripe, Revolut, N26.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <h4 className={typography.h6(theme)}>Headlines Hierarchy</h4>
            <div className="space-y-3">
              <h1 className={typography.h1(theme)}>H1 - Hero Title</h1>
              <h2 className={typography.h2(theme)}>H2 - Section Title</h2>
              <h3 className={typography.h3(theme)}>H3 - Subsection</h3>
              <h4 className={typography.h4(theme)}>H4 - Card Title</h4>
              <h5 className={typography.h5(theme)}>H5 - Feature Title</h5>
              <h6 className={typography.h6(theme)}>H6 - Small Heading</h6>
            </div>
          </div>
          
          <div>
            <h4 className={typography.h6(theme)}>Body Text Variants</h4>
            <div className="space-y-3">
              <p className={typography.bodyLarge(theme)}>Body Large - Hero descriptions</p>
              <p className={typography.body(theme)}>Body Standard - Regular content</p>
              <p className={typography.bodySmall(theme)}>Body Small - Supporting text</p>
              <p className={typography.caption(theme)}>Caption - Labels & metadata</p>
              <span className={typography.badge(theme)}>Badge Text</span>
            </div>
          </div>
        </div>
      </section>

      {/* JETBRAINS MONO Section */}
      <section className={`p-6 rounded-lg border ${
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-green-50 border-green-200'
      }`}>
        <h2 className={typography.h3(theme)}>
          🔢 JetBrains Mono - Financial Data
        </h2>
        <p className={typography.body(theme)}>
          Verwendet für alle Finanzwerte, NFT IDs, Wallet-Adressen und analytische Daten.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {/* Finanzwerte */}
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
            <h4 className={typography.h6(theme)}>💰 Financial Values</h4>
            <div className="space-y-3 mt-3">
              <div>
                <div className={typography.caption(theme)}>Property Value</div>
                <div className={formattedValue.className}>
                  {formattedValue.value}
                </div>
              </div>
              <div>
                <div className={typography.caption(theme)}>Monthly Rent</div>
                <div className={formattedRent.className}>
                  {formattedRent.value}
                </div>
              </div>
              <div>
                <div className={typography.caption(theme)}>Performance</div>
                <div className={formattedPerformance.className}>
                  {formattedPerformance.value}
                </div>
              </div>
            </div>
          </div>

          {/* NFT & Crypto */}
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
            <h4 className={typography.h6(theme)}>🔑 NFT & Crypto Data</h4>
            <div className="space-y-3 mt-3">
              <div>
                <div className={typography.caption(theme)}>NFT ID</div>
                <div className={formattedNFT.className}>
                  {formattedNFT.value}
                </div>
              </div>
              <div>
                <div className={typography.caption(theme)}>Supply</div>
                <div className={typography.nftId(theme)}>
                  {formattedNFT.supply}
                </div>
              </div>
              <div>
                <div className={typography.caption(theme)}>Wallet Address</div>
                <div className={formattedWallet.className}>
                  {formattedWallet.short}
                </div>
              </div>
            </div>
          </div>

          {/* Analytics */}
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
            <h4 className={typography.h6(theme)}>📊 Analytics</h4>
            <div className="space-y-3 mt-3">
              <div>
                <div className={typography.caption(theme)}>Occupancy Rate</div>
                <div className={typography.metricValue(theme)}>
                  {sampleData.occupancyRate}%
                </div>
              </div>
              <div>
                <div className={typography.caption(theme)}>Code Block</div>
                <div className={typography.code(theme)}>
                  0x742d...8f9
                </div>
              </div>
              <div>
                <div className={typography.caption(theme)}>Timestamp</div>
                <div className={typography.datetime(theme)}>
                  2025-06-27 12:34:56
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Usage Examples */}
      <section className={`p-6 rounded-lg border ${
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
      }`}>
        <h2 className={typography.h3(theme)}>
          📋 Usage Examples
        </h2>
        
        <div className="mt-6 space-y-4">
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
            <h4 className={typography.h6(theme)}>Property Card Example</h4>
            <div className="mt-3">
              <h5 className={typography.h5(theme)}>Vienna Luxury Apartments</h5>
              <p className={typography.location(theme)}>Vienna, Austria - Innere Stadt</p>
              <div className="flex justify-between mt-3">
                <div>
                  <div className={typography.caption(theme)}>Value</div>
                  <div className={typography.financialValue(theme)}>€12.5M</div>
                </div>
                <div>
                  <div className={typography.caption(theme)}>NFT</div>
                  <div className={typography.nftId(theme)}>VLA-247</div>
                </div>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
            <h4 className={typography.h6(theme)}>Dashboard Metrics</h4>
            <div className="grid grid-cols-3 gap-4 mt-3">
              <div className="text-center">
                <div className={typography.metricValue(theme)}>€35.1M</div>
                <div className={typography.caption(theme)}>Total Value</div>
              </div>
              <div className="text-center">
                <div className={`${typography.performanceText(theme)} text-green-600`}>+5.2%</div>
                <div className={typography.caption(theme)}>Growth</div>
              </div>
              <div className="text-center">
                <div className={typography.metricValue(theme)}>97.3%</div>
                <div className={typography.caption(theme)}>Occupancy</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Implementation Code */}
      <section className={`p-6 rounded-lg border ${
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-yellow-50 border-yellow-200'
      }`}>
        <h2 className={typography.h3(theme)}>
          💻 Implementation
        </h2>
        <div className="mt-4">
          <pre className={`${typography.code(theme)} p-4 rounded-lg text-xs overflow-auto`}>
{`// Import the typography system
import { typography, formatFinancialAmount } from '../utils/typography';

// Use in your components
<h1 className={typography.h1(theme)}>Welcome to CoinEstate</h1>
<div className={typography.financialAmount(theme)}>€12.5M</div>
<span className={typography.nftId(theme)}>VLA-247</span>

// Or use formatters
const amount = formatFinancialAmount(1250000, '€', theme);
<div className={amount.className}>{amount.value}</div>`}
          </pre>
        </div>
      </section>
    </div>
  );
};

export default TypographyDemo;
