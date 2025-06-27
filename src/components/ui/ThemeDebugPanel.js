import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';

// ==================== COMPREHENSIVE THEME DEBUG PANEL ====================
// 🔧 This component helps identify exactly what's wrong with the theme system

const ThemeDebugPanel = () => {
  const [manualTheme, setManualTheme] = React.useState('light');
  
  // Try to get theme context
  let themeContext = null;
  let themeError = null;
  
  try {
    themeContext = useTheme();
  } catch (error) {
    themeError = error.message;
  }
  
  // Try to get app context  
  let appContext = null;
  let appError = null;
  
  try {
    appContext = useApp();
  } catch (error) {
    appError = error.message;
  }

  // Manual theme toggle function for testing
  const manualToggle = (theme) => {
    console.log(`🔧 Manual toggle to: ${theme}`);
    
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('coinestate-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('coinestate-theme', 'light');
    }
    
    setManualTheme(theme);
  };

  // Check current state
  const currentState = {
    htmlClasses: document.documentElement.classList.toString(),
    localStorage: localStorage.getItem('coinestate-theme'),
    systemPreference: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
    themeContextAvailable: !!themeContext,
    appContextAvailable: !!appContext,
  };

  React.useEffect(() => {
    console.log('🔍 Theme Debug Panel State:', {
      currentState,
      themeContext,
      themeError,
      appError
    });
  }, [currentState.htmlClasses, manualTheme]);

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4 shadow-lg max-w-md">
      <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
        🔧 Theme Debug Panel
      </h3>
      
      {/* Current State */}
      <div className="space-y-2 text-sm">
        <div className="font-semibold text-gray-700 dark:text-gray-300">Current State:</div>
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>HTML Classes:</div>
          <div className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">
            {currentState.htmlClasses || 'none'}
          </div>
          
          <div>localStorage:</div>
          <div className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">
            {currentState.localStorage || 'null'}
          </div>
          
          <div>System Pref:</div>
          <div className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">
            {currentState.systemPreference}
          </div>
          
          <div>Theme Context:</div>
          <div className={`font-mono px-1 rounded ${currentState.themeContextAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {currentState.themeContextAvailable ? '✅ Available' : '❌ Error'}
          </div>
          
          <div>App Context:</div>
          <div className={`font-mono px-1 rounded ${currentState.appContextAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {currentState.appContextAvailable ? '✅ Available' : '❌ Error'}
          </div>
        </div>
      </div>

      {/* Theme Context Info */}
      {themeContext && (
        <div className="mt-4 space-y-2">
          <div className="font-semibold text-gray-700 dark:text-gray-300">Theme Context:</div>
          <div className="text-xs grid grid-cols-2 gap-2">
            <div>darkMode:</div>
            <div className="font-mono bg-blue-100 dark:bg-blue-900 px-1 rounded">
              {String(themeContext.darkMode)}
            </div>
            
            <div>isInitialized:</div>
            <div className="font-mono bg-blue-100 dark:bg-blue-900 px-1 rounded">
              {String(themeContext.isInitialized)}
            </div>
          </div>
        </div>
      )}

      {/* Errors */}
      {(themeError || appError) && (
        <div className="mt-4 space-y-2">
          <div className="font-semibold text-red-600">Errors:</div>
          {themeError && (
            <div className="text-xs bg-red-100 text-red-800 p-2 rounded">
              Theme: {themeError}
            </div>
          )}
          {appError && (
            <div className="text-xs bg-red-100 text-red-800 p-2 rounded">
              App: {appError}
            </div>
          )}
        </div>
      )}

      {/* Manual Controls */}
      <div className="mt-4 space-y-2">
        <div className="font-semibold text-gray-700 dark:text-gray-300">Manual Controls:</div>
        <div className="flex space-x-2">
          <button
            onClick={() => manualToggle('light')}
            className="px-3 py-1 bg-yellow-400 text-black rounded text-xs hover:bg-yellow-500"
          >
            ☀️ Light
          </button>
          <button
            onClick={() => manualToggle('dark')}
            className="px-3 py-1 bg-gray-800 text-white rounded text-xs hover:bg-gray-700"
          >
            🌙 Dark
          </button>
        </div>
      </div>

      {/* Theme Toggle Test */}
      {themeContext && themeContext.toggleTheme && (
        <div className="mt-4">
          <button
            onClick={() => {
              console.log('🎯 Testing themeContext.toggleTheme()');
              themeContext.toggleTheme();
            }}
            className="w-full px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            🔄 Test Context Toggle
          </button>
        </div>
      )}

      {/* Close Button */}
      <button
        onClick={() => document.querySelector('.theme-debug-panel').style.display = 'none'}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        ✕
      </button>
    </div>
  );
};

export default ThemeDebugPanel;