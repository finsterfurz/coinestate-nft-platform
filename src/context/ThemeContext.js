import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Theme initialisieren OHNE App-State zu beeinflussen
  useEffect(() => {
    const initializeTheme = () => {
      try {
        // Gespeichertes Theme laden
        const savedTheme = localStorage.getItem('coinestate-theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        const shouldUseDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
        
        // Theme sofort anwenden BEVOR State gesetzt wird
        if (shouldUseDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        
        // State setzen ohne Re-Render der gesamten App
        setDarkMode(shouldUseDark);
        setIsInitialized(true);
        
      } catch (error) {
        console.error('Theme initialization error:', error);
        setIsInitialized(true);
      }
    };

    initializeTheme();
  }, []);

  // Theme umschalten OHNE App neu zu rendern
  const toggleTheme = () => {
    const newTheme = !darkMode;
    
    // DOM sofort aktualisieren
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('coinestate-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('coinestate-theme', 'light');
    }
    
    // State aktualisieren (löst nur ThemeToggle Re-Render aus)
    setDarkMode(newTheme);
  };

  const value = {
    darkMode,
    toggleTheme,
    isInitialized,
    theme: darkMode ? 'dark' : 'light' // Kompatibilität mit bestehendem Code
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;