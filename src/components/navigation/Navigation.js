import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { Globe, Building, ArrowRight, Check, Shield, Key, Users, ChevronDown, Menu, X } from '../icons/AllIcons.js';
import ThemeToggle from '../ui/ThemeToggle';

// ==================== NAVIGATION ====================
const Navigation = () => {
  // 🔥 FIXED: Split context usage - App data from AppContext, Theme from ThemeContext
  const { currentPage, updateState, notifications } = useApp();
  const { darkMode } = useTheme(); // Only get darkMode for conditional styling
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 🛡️ SAFE NOTIFICATION COUNT - Prevents .map() errors
  const notificationCount = React.useMemo(() => {
    try {
      if (Array.isArray(notifications)) {
        return notifications.filter(n => n && !n.read).length;
      }
      return 0;
    } catch (error) {
      console.error('Error calculating notification count:', error);
      return 0;
    }
  }, [notifications]);

  const navItems = [
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'projects', label: 'Projects' },
    { id: 'about', label: 'About' },
    { id: 'dashboard', label: 'Dashboard' }
  ];

  return (
    <nav className={`fixed top-0 w-full backdrop-blur-sm border-b z-50 transition-colors duration-300 ${
      darkMode ? 'bg-gray-900/95 border-gray-700' : 'bg-white/95 border-gray-100'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button 
              onClick={() => updateState({ currentPage: 'home' })}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <Building className={`h-8 w-8 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <span className={`text-xl font-bold transition-colors ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                CoinEstate
              </span>
              <span className="text-sm bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 px-2 py-1 rounded-full transition-colors">
                NFT
              </span>
            </button>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navItems.map(item => (
                <button 
                  key={item.id}
                  onClick={() => updateState({ currentPage: item.id })}
                  className={`transition-colors duration-200 ${
                    currentPage === item.id
                      ? darkMode ? 'text-blue-400' : 'text-blue-600'
                      : darkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              
              {/* Notification Bell */}
              {notificationCount > 0 && (
                <div className="relative">
                  <button className={`p-2 rounded-lg transition-colors duration-200 ${
                    darkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
                  }`}>
                    <span className="sr-only">Notifications</span>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                    </svg>
                    {notificationCount > 0 && (
                      <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                        {notificationCount > 99 ? '99+' : notificationCount}
                      </span>
                    )}
                  </button>
                </div>
              )}
              
              {/* 🎯 NEW: Isolated ThemeToggle Component */}
              <ThemeToggle />
              
              <button 
                onClick={() => updateState({ currentPage: 'dashboard' })}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors duration-200"
              >
                Get Access
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile Notification */}
            {notificationCount > 0 && (
              <div className="relative">
                <button className={`p-2 rounded-lg transition-colors duration-200 ${
                  darkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
                }`}>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                  </svg>
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </span>
                </button>
              </div>
            )}
            
            {/* Mobile ThemeToggle */}
            <ThemeToggle />
            
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`transition-colors duration-200 ${darkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'}`}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className={`px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t transition-colors duration-300 ${
            darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'
          }`}>
            {navItems.map(item => (
              <button 
                key={item.id}
                onClick={() => { updateState({ currentPage: item.id }); setIsMenuOpen(false); }}
                className={`block w-full text-left px-3 py-2 transition-colors duration-200 ${
                  darkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                {item.label}
              </button>
            ))}
            <button 
              onClick={() => { updateState({ currentPage: 'dashboard' }); setIsMenuOpen(false); }}
              className="w-full text-left bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-3 py-2 rounded-lg transition-colors duration-200"
            >
              Get Access
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;