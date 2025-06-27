// ==================== INTER + JETBRAINS MONO TYPOGRAPHY SYSTEM ====================
/**
 * Professional Fintech Typography System for CoinEstate NFT Platform
 * 
 * 🎯 FONT STRATEGY:
 * - Inter: Hauptschrift für UI, Headlines, Body Text (Stripe/N26 Standard)
 * - JetBrains Mono: Finanzwerte, NFT IDs, Wallet Adressen, Analytics
 * 
 * Usage Examples:
 * - className={typography.h1(theme)}
 * - className={typography.financialAmount(theme)}
 * - className={typography.nftId(theme)}
 * - className={typography.walletAddress(theme)}
 * 
 * Heading Hierarchy (Inter):
 * - h1: 48-64px bold (Hero titles)
 * - h2: 36px semibold (Section titles) 
 * - h3: 24px medium (Subsection titles)
 * - h4: 20px semibold (Card titles)
 * - h5: 18px medium (Feature titles)
 * - h6: 16px medium (Small headings)
 * 
 * Body Text (Inter):
 * - bodyLarge: 20px (Hero descriptions, important text)
 * - body: 16px (Standard body text)
 * - bodySmall: 14px (Supporting text, captions)
 * - caption: 12px (Labels, metadata)
 * 
 * Financial Data (JetBrains Mono):
 * - financialAmount: Große Geldbeträge (€127.5M)
 * - financialValue: Standard Finanzwerte (€2,500)
 * - nftId: NFT Identifikatoren (#0247/2500)
 * - walletAddress: Krypto-Adressen (0x742d...3aC3f)
 * - metricValue: Dashboard Kennzahlen (97.3%)
 * - performanceText: Leistungsdaten (+5.2%)
 */

export const typography = {
  // ==================== HEADLINES (INTER) ====================
  h1: (theme) => `font-fintech text-5xl lg:text-6xl font-bold tracking-fintech ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`, // 48px-64px bold
  h2: (theme) => `font-fintech text-4xl font-semibold tracking-fintech ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`, // 36px semibold
  h3: (theme) => `font-fintech text-2xl font-medium tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`, // 24px medium
  h4: (theme) => `font-fintech text-xl font-semibold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`, // 20px semibold
  h5: (theme) => `font-fintech text-lg font-medium tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`, // 18px medium
  h6: (theme) => `font-fintech text-base font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`, // 16px medium
  
  // ==================== BODY TEXT (INTER) ====================
  bodyLarge: (theme) => `font-fintech text-xl tracking-tight ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`, // 20px
  body: (theme) => `font-fintech text-base tracking-tight ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`, // 16px
  bodySmall: (theme) => `font-fintech text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`, // 14px
  caption: (theme) => `font-fintech text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`, // 12px
  
  // ==================== FINANCIAL DATA (JETBRAINS MONO) ====================
  
  // 💰 Große Finanzbeträge (€127.5M, €25M)
  financialAmount: (theme) => `font-mono text-2xl lg:text-3xl font-bold tracking-data tabular-nums ${
    theme === 'dark' ? 'text-white' : 'text-gray-900'
  }`,
  
  // 💵 Standard Finanzwerte (€2,500, €127.50)
  financialValue: (theme) => `font-mono text-lg font-semibold tracking-data tabular-nums ${
    theme === 'dark' ? 'text-white' : 'text-gray-900'
  }`,
  
  // 💸 Kleine Finanzwerte (€127, €12.50)
  financialSmall: (theme) => `font-mono text-base font-medium tracking-data tabular-nums ${
    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
  }`,
  
  // 🔑 NFT IDs (#0247/2500, VLA-247)
  nftId: (theme) => `font-mono text-sm font-medium tracking-data ${
    theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
  }`,
  
  // 💳 Wallet Adressen (0x742d...3aC3f)
  walletAddress: (theme) => `font-mono text-xs font-medium tracking-data ${
    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
  }`,
  
  // 📊 Dashboard Metriken (97.3%, +5.2%)
  metricValue: (theme) => `font-mono text-xl font-bold tracking-data tabular-nums ${
    theme === 'dark' ? 'text-white' : 'text-gray-900'
  }`,
  
  // 📈 Performance Indikatoren (+5.2%, -1.3%)
  performanceText: (theme) => `font-mono text-sm font-medium tracking-data tabular-nums`,
  
  // 🏢 Immobilienwerte (€24,977/m²)
  propertyValue: (theme) => `font-mono text-base font-semibold tracking-data tabular-nums ${
    theme === 'dark' ? 'text-white' : 'text-gray-900'
  }`,
  
  // ==================== SPECIAL VARIANTS ====================
  
  // 🌈 Gradient Headlines
  gradient: 'font-fintech bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-bold tracking-fintech',
  
  // 🏷️ Badges und Labels
  badge: (theme) => `font-fintech text-sm font-medium ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`,
  
  // 🔢 Code und technische Daten
  code: (theme) => `font-mono text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} bg-${theme === 'dark' ? 'gray-800' : 'gray-100'} px-1 py-0.5 rounded`,
  
  // 📋 Tabellen-Header
  tableHeader: (theme) => `font-fintech text-xs font-semibold uppercase tracking-wider ${
    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
  }`,
  
  // 📊 Tabellen-Daten
  tableData: (theme) => `font-fintech text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`,
  
  // 🎯 Call-to-Action Buttons
  buttonText: 'font-fintech font-semibold tracking-tight',
  
  // 📅 Datum und Zeit
  datetime: (theme) => `font-mono text-sm font-medium tracking-data ${
    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
  }`,
  
  // ⚠️ Status Indikatoren
  status: (theme) => `font-fintech text-xs font-medium uppercase tracking-wider`,
  
  // 🌍 Locations
  location: (theme) => `font-fintech text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`,
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Formatiert Finanzwerte mit korrekter Typografie
 * @param {number} amount - Betrag
 * @param {string} currency - Währung (default: '€')
 * @param {string} theme - Theme ('light' oder 'dark')
 * @returns {object} - Formatierter Wert mit Styling
 */
export const formatFinancialAmount = (amount, currency = '€', theme = 'light') => ({
  value: new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: currency === '€' ? 'EUR' : 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: amount >= 1000000 ? 1 : 0,
  }).format(amount),
  className: typography.financialValue(theme),
  style: { fontVariantNumeric: 'tabular-nums' }
});

/**
 * Formatiert NFT IDs mit korrekter Typografie
 * @param {string} projectCode - Projekt-Code (z.B. 'VLA')
 * @param {number} tokenId - Token ID
 * @param {number} totalSupply - Gesamtanzahl
 * @param {string} theme - Theme
 */
export const formatNFTId = (projectCode, tokenId, totalSupply, theme = 'light') => ({
  value: `${projectCode}-${String(tokenId).padStart(3, '0')}`,
  supply: `${tokenId}/${totalSupply}`,
  className: typography.nftId(theme)
});

/**
 * Formatiert Wallet-Adressen mit Ellipsis
 * @param {string} address - Wallet Adresse
 * @param {string} theme - Theme
 */
export const formatWalletAddress = (address, theme = 'light') => ({
  short: `${address.slice(0, 6)}...${address.slice(-4)}`,
  full: address,
  className: typography.walletAddress(theme)
});

/**
 * Performance Indikatoren mit Farben
 * @param {number} value - Prozentwert
 * @param {string} theme - Theme
 */
export const formatPerformance = (value, theme = 'light') => {
  const isPositive = value >= 0;
  const colorClass = isPositive 
    ? 'text-green-600 dark:text-green-400' 
    : 'text-red-600 dark:text-red-400';
  
  return {
    value: `${isPositive ? '+' : ''}${value.toFixed(1)}%`,
    className: `${typography.performanceText(theme)} ${colorClass}`,
    isPositive
  };
};

export default typography;
