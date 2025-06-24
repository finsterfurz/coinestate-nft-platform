// ==================== TYPOGRAPHY SYSTEM ====================
/**
 * Consistent Typography System for CoinEstate NFT Platform
 * 
 * Usage: className={typography.h1(theme)}
 * 
 * Heading Hierarchy:
 * - h1: 48-64px bold (Hero titles)
 * - h2: 36px semibold (Section titles) 
 * - h3: 24px medium (Subsection titles)
 * - h4: 20px semibold (Card titles)
 * - h5: 18px medium (Feature titles)
 * - h6: 16px medium (Small headings)
 * 
 * Body Text:
 * - bodyLarge: 20px (Hero descriptions, important text)
 * - body: 16px (Standard body text)
 * - bodySmall: 14px (Supporting text, captions)
 * - caption: 12px (Labels, metadata)
 * 
 * Special:
 * - gradient: Blue-to-indigo gradient text
 * - badge: Styled badge text
 */
export const typography = {
  h1: (theme) => `text-5xl lg:text-6xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`, // 48px-64px bold
  h2: (theme) => `text-4xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`, // 36px semibold
  h3: (theme) => `text-2xl font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`, // 24px medium
  h4: (theme) => `text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`, // 20px semibold
  h5: (theme) => `text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`, // 18px medium
  h6: (theme) => `text-base font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`, // 16px medium
  
  // Body text variants
  bodyLarge: (theme) => `text-xl ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`, // 20px
  body: (theme) => `text-base ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`, // 16px
  bodySmall: (theme) => `text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`, // 14px
  caption: (theme) => `text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`, // 12px
  
  // Special variants
  gradient: 'bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent',
  badge: (theme) => `text-sm font-medium ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`
};
