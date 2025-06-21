// src/hooks/useTheme.js
import { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useLocalStorage } from './useLocalStorage';

/**
 * Custom hook for theme management with persistence
 * @returns {object} Theme utilities and state
 */
export const useTheme = () => {
  const { theme, updateState } = useApp();
  const [persistedTheme, setPersistedTheme] = useLocalStorage('coinEstate_theme', 'light');

  // Load persisted theme on mount
  useEffect(() => {
    if (persistedTheme && persistedTheme !== theme) {
      updateState({ theme: persistedTheme });
    }
  }, []);

  // Persist theme changes
  useEffect(() => {
    setPersistedTheme(theme);
  }, [theme]);

  // Detect system theme preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      if (persistedTheme === 'system') {
        updateState({ theme: e.matches ? 'dark' : 'light' });
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [persistedTheme]);

  const setTheme = (newTheme) => {
    updateState({ theme: newTheme });
    setPersistedTheme(newTheme);
  };

  return {
    theme,
    setTheme,
    persistedTheme
  };
};

export default useTheme;