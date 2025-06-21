// src/components/navigation/Navigation.js
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Building, Menu, X } from '../icons';
import { ThemeBuilder } from '../ui';
import { themes } from '../../utils/themes';

const Navigation = () => {
  const { currentPage, updateState, theme } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const currentThemeConfig = themes[theme];

  const navItems = [
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'projects', label: 'Projects' },
    { id: 'about', label: 'About' },
    { id: 'dashboard', label: 'Dashboard' }
  ];

  return (
    <nav className={`fixed top-0 w-full backdrop-blur-sm border-b z-50 transition-colors ${currentThemeConfig.primary} ${currentThemeConfig.border}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button onClick={() => updateState({ currentPage: 'home' })} className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <Building className={`h-8 w-8 ${theme === 'coinblue' ? 'text-blue-400' : theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
              <span className={`text-xl font-bold ${currentThemeConfig.text.primary}`}>CoinEstate</span>
              <span className={`text-sm px-2 py-1 rounded-full ${
                theme === 'coinblue' ? 'bg-blue-800 text-blue-200' : 
                theme === 'dark' ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-600'
              }`}>NFT</span>
            </button>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navItems.map(item => (
                <button 
                  key={item.id}
                  onClick={() => updateState({ currentPage: item.id })}
                  className={`transition-colors ${
                    currentPage === item.id
                      ? theme === 'coinblue' ? 'text-blue-300' : theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                      : currentThemeConfig.button.ghost
                  }`}
                >
                  {item.label}
                </button>
              ))}
              
              <ThemeBuilder />
              
              <button onClick={() => updateState({ currentPage: 'dashboard' })} className={`px-6 py-2 rounded-lg transition-colors ${currentThemeConfig.button.primary}`}>
                Get Access
              </button>
            </div>
          </div>

          <div className="md:hidden flex items-center space-x-2">
            <ThemeBuilder />
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={currentThemeConfig.button.ghost}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden">
          <div className={`px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t ${currentThemeConfig.secondary} ${currentThemeConfig.border}`}>
            {navItems.map(item => (
              <button 
                key={item.id}
                onClick={() => { updateState({ currentPage: item.id }); setIsMenuOpen(false); }}
                className={`block w-full text-left px-3 py-2 transition-colors ${currentThemeConfig.button.ghost}`}
              >
                {item.label}
              </button>
            ))}
            <button 
              onClick={() => { updateState({ currentPage: 'dashboard' }); setIsMenuOpen(false); }}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${currentThemeConfig.button.primary}`}
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