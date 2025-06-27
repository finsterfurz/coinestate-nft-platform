import React from 'react';
import { useTheme } from '../../context/ThemeContext';

// ==================== SIMPLE DEBUG THEME TOGGLE ====================
// 🔧 Simplified version for debugging theme issues

const ThemeToggleDebug = () => {
  const { darkMode, toggleTheme, isInitialized } = useTheme();

  // 🐛 DEBUG: Log current theme state
  React.useEffect(() => {
    console.log('🎨 ThemeToggle Debug:', {
      darkMode,
      isInitialized,
      htmlClasses: document.documentElement.classList.toString(),
      localStorage: localStorage.getItem('coinestate-theme')
    });
  }, [darkMode, isInitialized]);

  // Simple test function to manually force theme
  const forceToggle = () => {
    console.log('🔧 Force toggle clicked');
    console.log('📊 Before toggle:', {
      darkMode,
      htmlHasDark: document.documentElement.classList.contains('dark')
    });
    
    try {
      toggleTheme();
      
      // Check after small delay
      setTimeout(() => {
        console.log('📊 After toggle:', {
          darkMode: !darkMode,
          htmlHasDark: document.documentElement.classList.contains('dark'),
          localStorage: localStorage.getItem('coinestate-theme')
        });
      }, 100);
    } catch (error) {
      console.error('❌ Toggle error:', error);
    }
  };

  if (!isInitialized) {
    return (
      <div className="w-10 h-10 bg-gray-300 rounded animate-pulse">
        <span className="sr-only">Loading theme...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      {/* Main Toggle Button */}
      <button
        onClick={forceToggle}
        className={`
          w-12 h-6 rounded-full p-1 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500
          ${darkMode ? 'bg-blue-600' : 'bg-gray-300'}
        `}
        aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
      >
        <div
          className={`
            w-4 h-4 rounded-full bg-white transition-transform duration-300
            ${darkMode ? 'translate-x-6' : 'translate-x-0'}
          `}
        />
      </button>

      {/* Debug Info */}
      <div className="text-xs text-gray-500 dark:text-gray-400">
        <div>Mode: {darkMode ? '🌙 Dark' : '☀️ Light'}</div>
        <div>Init: {isInitialized ? '✅' : '⏳'}</div>
      </div>

      {/* Manual Test Buttons */}
      <div className="flex space-x-1">
        <button
          onClick={() => {
            document.documentElement.classList.add('dark');
            localStorage.setItem('coinestate-theme', 'dark');
            console.log('🌙 Forced dark mode');
          }}
          className="px-2 py-1 text-xs bg-gray-800 text-white rounded"
        >
          🌙
        </button>
        <button
          onClick={() => {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('coinestate-theme', 'light');
            console.log('☀️ Forced light mode');
          }}
          className="px-2 py-1 text-xs bg-yellow-400 text-black rounded"
        >
          ☀️
        </button>
      </div>
    </div>
  );
};

export default ThemeToggleDebug;