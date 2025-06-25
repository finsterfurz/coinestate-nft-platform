import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Globe, Building, ArrowRight, Check, Shield, Key, Users, ChevronDown } from '../icons/AllIcons';
import { Sun } from '../icons/Sun';
import { Moon } from '../icons/Moon';
import { Menu } from '../icons/Menu';
import { X } from '../icons/X';

// ==================== NAVIGATION ====================
const Navigation = () => {
  const { currentPage, updateState, theme } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleTheme = () => {
    updateState(prev => ({ theme: prev.theme === 'light' ? 'dark' : 'light' }));
  };

  const navItems = [
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'projects', label: 'Projects' },
    { id: 'about', label: 'About' },
    { id: 'dashboard', label: 'Dashboard' }
  ];

  return (
    <nav className={`fixed top-0 w-full backdrop-blur-sm border-b z-50 transition-colors ${
      theme === 'dark' ? 'bg-gray-900/95 border-gray-700' : 'bg-white/95 border-gray-100'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button 
              onClick={() => updateState({ currentPage: 'home' })}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <Building className={`h-8 w-8 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
              <span className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                CoinEstate
              </span>
              <span className="text-sm bg-blue-100 text-blue-600 px-2 py-1 rounded-full">NFT</span>
            </button>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navItems.map(item => (
                <button 
                  key={item.id}
                  onClick={() => updateState({ currentPage: item.id })}
                  className={`transition-colors ${
                    currentPage === item.id
                      ? theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                      : theme === 'dark' ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark' ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              
              <button 
                onClick={() => updateState({ currentPage: 'dashboard' })}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Get Access
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark' ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={theme === 'dark' ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className={`px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t ${
            theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'
          }`}>
            {navItems.map(item => (
              <button 
                key={item.id}
                onClick={() => { updateState({ currentPage: item.id }); setIsMenuOpen(false); }}
                className={`block w-full text-left px-3 py-2 transition-colors ${
                  theme === 'dark' ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                {item.label}
              </button>
            ))}
            <button 
              onClick={() => { updateState({ currentPage: 'dashboard' }); setIsMenuOpen(false); }}
              className="w-full text-left bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
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
