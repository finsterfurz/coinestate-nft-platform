// src/utils/typography.js
import { themes } from './themes';

export const typography = {
  h1: (currentTheme) => `text-5xl lg:text-6xl font-bold ${themes[currentTheme].text.primary}`,
  h2: (currentTheme) => `text-4xl font-semibold ${themes[currentTheme].text.primary}`,
  h3: (currentTheme) => `text-2xl font-medium ${themes[currentTheme].text.primary}`,
  h4: (currentTheme) => `text-xl font-semibold ${themes[currentTheme].text.primary}`,
  h5: (currentTheme) => `text-lg font-medium ${themes[currentTheme].text.primary}`,
  h6: (currentTheme) => `text-base font-medium ${themes[currentTheme].text.primary}`,
  
  bodyLarge: (currentTheme) => `text-xl ${themes[currentTheme].text.secondary}`,
  body: (currentTheme) => `text-base ${themes[currentTheme].text.secondary}`,
  bodySmall: (currentTheme) => `text-sm ${themes[currentTheme].text.tertiary}`,
  caption: (currentTheme) => `text-xs ${themes[currentTheme].text.tertiary}`,
  
  gradient: 'bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent',
  badge: (currentTheme) => `text-sm font-medium ${currentTheme === 'coinblue' ? 'text-blue-300' : currentTheme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`
};