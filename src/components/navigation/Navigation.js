import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { navigationConfig, isActiveRoute } from '../../routes';
import { Building, Menu, X, Bell, User, LogOut } from '../icons';
import ThemeToggle from '../ui/ThemeToggle';

/**
 * Navigation Component with React Router integration
 * 
 * Features:
 * - React Router Link navigation
 * - Active route highlighting
 * - Authentication integration
 * - Mobile responsive menu
 * - Theme toggle integration
 * - Notification system
 */
const Navigation = () => {
  const { darkMode } = useTheme();
  const { isAuthenticated, user, disconnectWallet } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  // Filter navigation items based on authentication status
  const visibleNavItems = navigationConfig.filter(item => {
    if (item.protected && !isAuthenticated) {
      return false; // Hide protected routes if not authenticated
    }
    return item.public || isAuthenticated;
  });
  
  // Mock notifications count (replace with actual notification system)
  const notificationCount = 0;
  
  const handleMobileNavClick = () => {
    setIsMenuOpen(false);
  };
  
  const handleUserMenuClick = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };
  
  const handleLogout = () => {
    disconnectWallet();
    setIsUserMenuOpen(false);
  };
  
  return (
    <nav className={`fixed top-0 w-full backdrop-blur-sm border-b z-50 transition-colors duration-300 ${
      darkMode ? 'bg-gray-900/95 border-gray-700' : 'bg-white/95 border-gray-100'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link 
              to="/"
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <Building className={`h-8 w-8 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <span className={`text-xl font-bold transition-colors ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                CoinEstate
              </span>
              <span className="text-sm bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 px-2 py-1 rounded-full transition-colors">
                NFT
              </span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              {/* Navigation Links */}
              {visibleNavItems.map(item => {
                const isActive = isActiveRoute(location.pathname, item.path);
                
                return (
                  <Link 
                    key={item.path}
                    to={item.path}
                    className={`transition-colors duration-200 font-medium ${
                      isActive
                        ? darkMode ? 'text-blue-400' : 'text-blue-600'
                        : darkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
              
              {/* Notifications */}
              {isAuthenticated && (
                <div className="relative">
                  <button 
                    className={`p-2 rounded-lg transition-colors duration-200 ${
                      darkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
                    }`}
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {notificationCount > 0 && (
                      <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                        {notificationCount > 99 ? '99+' : notificationCount}
                      </span>
                    )}
                  </button>
                </div>
              )}
              
              {/* Theme Toggle */}
              <ThemeToggle />
              
              {/* User Menu / Connect Button */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={handleUserMenuClick}
                    className={`flex items-center space-x-2 p-2 rounded-lg transition-colors duration-200 ${
                      darkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <User className="w-5 h-5" />
                    <span className="text-sm font-medium">
                      {user?.walletAddress?.slice(0, 6)}...{user?.walletAddress?.slice(-4)}
                    </span>
                  </button>
                  
                  {/* User Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className={`absolute right-0 mt-2 w-56 rounded-md shadow-lg ${
                      darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                    } ring-1 ring-black ring-opacity-5 z-50`}>
                      <div className="py-1">
                        <div className={`px-4 py-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Signed in as
                          </p>
                          <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {user?.walletAddress}
                          </p>
                          {user?.kycVerified && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 mt-1">
                              KYC Verified
                            </span>
                          )}
                        </div>
                        <Link
                          to="/dashboard"
                          className={`flex items-center px-4 py-2 text-sm transition-colors ${
                            darkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                          }`}
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <User className="w-4 h-4 mr-3" />
                          Dashboard
                        </Link>
                        <button
                          onClick={handleLogout}
                          className={`flex w-full items-center px-4 py-2 text-sm transition-colors ${
                            darkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                          }`}
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          Disconnect Wallet
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/dashboard"
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors duration-200 font-medium"
                >
                  Connect Wallet
                </Link>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile Notifications */}
            {isAuthenticated && notificationCount > 0 && (
              <div className="relative">
                <button className={`p-2 rounded-lg transition-colors duration-200 ${
                  darkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
                }`}>
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </span>
                </button>
              </div>
            )}
            
            {/* Mobile Theme Toggle */}
            <ThemeToggle />
            
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`transition-colors duration-200 ${darkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'}`}
              aria-label="Toggle mobile menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className={`px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t transition-colors duration-300 ${
            darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'
          }`}>
            {/* Mobile Navigation Links */}
            {visibleNavItems.map(item => {
              const isActive = isActiveRoute(location.pathname, item.path);
              
              return (
                <Link 
                  key={item.path}
                  to={item.path}
                  onClick={handleMobileNavClick}
                  className={`block px-3 py-2 transition-colors duration-200 font-medium ${
                    isActive
                      ? darkMode ? 'text-blue-400 bg-gray-800' : 'text-blue-600 bg-blue-50'
                      : darkMode ? 'text-gray-300 hover:text-blue-400 hover:bg-gray-800' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
            
            {/* Mobile User Section */}
            {isAuthenticated ? (
              <div className={`border-t pt-3 mt-3 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="px-3 py-2">
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Connected as
                  </p>
                  <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {user?.walletAddress?.slice(0, 6)}...{user?.walletAddress?.slice(-4)}
                  </p>
                </div>
                <button
                  onClick={() => { handleLogout(); handleMobileNavClick(); }}
                  className={`block w-full text-left px-3 py-2 transition-colors duration-200 ${
                    darkMode ? 'text-gray-300 hover:text-blue-400 hover:bg-gray-800' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  Disconnect Wallet
                </button>
              </div>
            ) : (
              <Link 
                to="/dashboard"
                onClick={handleMobileNavClick}
                className="block bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-3 py-2 rounded-lg transition-colors duration-200 font-medium mx-3 text-center"
              >
                Connect Wallet
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
