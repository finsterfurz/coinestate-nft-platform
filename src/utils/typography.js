
export const typography = {
  h1: (theme) => `text-5xl lg:text-6xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`,
  h2: (theme) => `text-4xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`,
  h3: (theme) => `text-2xl font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`,
  h4: (theme) => `text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`,
  h5: (theme) => `text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`,
  h6: (theme) => `text-base font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`,
  
  bodyLarge: (theme) => `text-xl ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`,
  body: (theme) => `text-base ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`,
  bodySmall: (theme) => `text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`,
  caption: (theme) => `text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`,
  
  gradient: 'bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent',
  badge: (theme) => `text-sm font-medium ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`
};
