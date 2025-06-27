import React, { createContext, useContext, useState, useEffect } from 'react';

// ==================== ISOLATED THEME CONTEXT ====================
// 🔥 This context is completely isolated from AppContext
// Theme changes will NOT interfere with app state or notifications

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // 🚀 THEME INITIALIZATION - Happens before app state loads
  useEffect(() => {
    const initializeTheme = () => {
      try {
        // Use unique localStorage key to avoid conflicts
        const savedTheme = localStorage.getItem('coinestate-theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        const shouldUseDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
        
        // Apply theme immediately to DOM before state update
        if (shouldUseDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        
        // Set state without triggering re-renders of other contexts
        setDarkMode(shouldUseDark);
        setIsInitialized(true);
        
        console.log('Theme initialized:', shouldUseDark ? 'dark' : 'light');
        
      } catch (error) {
        console.error('Theme initialization error:', error);
        // Fallback to light mode on error
        document.documentElement.classList.remove('dark');
        setDarkMode(false);
        setIsInitialized(true);
      }
    };

    initializeTheme();
  }, []);

  // 🎯 SAFE THEME TOGGLE - Updates DOM immediately, state afterward
  const toggleTheme = () => {
    try {
      const newTheme = !darkMode;
      
      // Update DOM first - immediate visual feedback
      if (newTheme) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('coinestate-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('coinestate-theme', 'light');
      }
      
      // Update state - only triggers ThemeToggle re-render, not AppContext
      setDarkMode(newTheme);
      
      console.log('Theme toggled to:', newTheme ? 'dark' : 'light');
      
    } catch (error) {
      console.error('Theme toggle error:', error);
    }
  };

  // 🛡️ SAFE VALUE OBJECT - Minimal context to prevent unnecessary re-renders
  const value = {
    darkMode,
    toggleTheme,
    isInitialized
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// 🎯 THEME HOOK - Only for theme-related components
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;