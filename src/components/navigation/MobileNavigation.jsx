// Mobile Navigation Component with Touch-Friendly Design
import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronDown, Home, FileText, Users, Settings } from 'lucide-react';

const MobileNavigation = ({ isOpen, onToggle, currentPath = '/' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [submenuOpen, setSubmenuOpen] = useState({});

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const menuItems = [
    {
      label: 'Home',
      path: '/',
      icon: Home,
      testId: 'nav-home'
    },
    {
      label: 'Properties',
      path: '/properties',
      icon: FileText,
      testId: 'nav-properties',
      submenu: [
        { label: 'All Properties', path: '/properties' },
        { label: 'My NFTs', path: '/properties/my-nfts' },
        { label: 'Marketplace', path: '/properties/marketplace' }
      ]
    },
    {
      label: 'Governance',
      path: '/governance',
      icon: Users,
      testId: 'nav-governance',
      submenu: [
        { label: 'Active Proposals', path: '/governance/proposals' },
        { label: 'Voting History', path: '/governance/history' },
        { label: 'Create Proposal', path: '/governance/create' }
      ]
    },
    {
      label: 'Account',
      path: '/account',
      icon: Settings,
      testId: 'nav-account',
      submenu: [
        { label: 'Profile', path: '/account/profile' },
        { label: 'KYC Status', path: '/account/kyc' },
        { label: 'Settings', path: '/account/settings' }
      ]
    }
  ];

  const toggleSubmenu = (index) => {
    setSubmenuOpen(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${
          isOpen ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={onToggle}
        aria-hidden="true"
      />
      
      {/* Mobile Menu */}
      <nav
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-300 z-50 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        data-testid="mobile-navigation"
        aria-label="Mobile navigation"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            CoinEstate
          </h2>
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            data-testid="mobile-menu-close"
            aria-label="Close mobile menu"
          >
            <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto py-6">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            const hasSubmenu = item.submenu && item.submenu.length > 0;
            const isSubmenuOpen = submenuOpen[index];

            return (
              <div key={item.path} className="px-6">
                <button
                  onClick={() => {
                    if (hasSubmenu) {
                      toggleSubmenu(index);
                    } else {
                      // Navigate to page
                      window.location.href = item.path;
                      onToggle();
                    }
                  }}
                  className={`w-full flex items-center justify-between p-4 rounded-xl transition-colors text-left ${
                    isActive 
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                  data-testid={item.testId}
                  aria-expanded={hasSubmenu ? isSubmenuOpen : undefined}
                >
                  <div className="flex items-center space-x-4">
                    <Icon className="w-6 h-6" />
                    <span className="font-medium text-lg">{item.label}</span>
                  </div>
                  {hasSubmenu && (
                    <ChevronDown 
                      className={`w-5 h-5 transition-transform ${
                        isSubmenuOpen ? 'rotate-180' : ''
                      }`}
                    />
                  )}
                </button>

                {/* Submenu */}
                {hasSubmenu && (
                  <div 
                    className={`overflow-hidden transition-all duration-200 ${
                      isSubmenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="ml-10 mt-2 space-y-1">
                      {item.submenu.map((subItem) => (
                        <a
                          key={subItem.path}
                          href={subItem.path}
                          onClick={onToggle}
                          className={`block p-3 rounded-lg transition-colors ${
                            currentPath === subItem.path
                              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-600 dark:text-gray-400'
                          }`}
                          data-testid={`nav-submenu-${subItem.label.toLowerCase().replace(/\s+/g, '-')}`}
                        >
                          {subItem.label}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">U</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                User Account
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                KYC Verified
              </p>
            </div>
          </div>
          
          <button
            onClick={() => {
              // Handle wallet connection
              onToggle();
            }}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            data-testid="mobile-connect-wallet"
          >
            Connect Wallet
          </button>
        </div>
      </nav>
    </>
  );
};

// Touch-Optimized Button Component
export const TouchButton = ({ 
  children, 
  variant = 'primary', 
  size = 'medium',
  disabled = false,
  className = '',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] select-none';
  
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900 focus:ring-gray-500 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    ghost: 'hover:bg-gray-100 text-gray-700 focus:ring-gray-500 dark:hover:bg-gray-800 dark:text-gray-300'
  };
  
  const sizes = {
    small: 'px-3 py-2 text-sm min-h-[40px]', // Minimum 40px for touch targets
    medium: 'px-4 py-3 text-base min-h-[44px]', // Minimum 44px for touch targets
    large: 'px-6 py-4 text-lg min-h-[48px]' // Minimum 48px for touch targets
  };
  
  const disabledClasses = 'opacity-50 cursor-not-allowed pointer-events-none';
  
  return (
    <button
      className={`
        ${baseClasses}
        ${variants[variant]}
        ${sizes[size]}
        ${disabled ? disabledClasses : ''}
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

// Responsive Container Component
export const ResponsiveContainer = ({ 
  children, 
  maxWidth = '7xl',
  padding = true,
  className = '' 
}) => {
  const maxWidths = {
    'sm': 'max-w-sm',
    'md': 'max-w-md',
    'lg': 'max-w-lg',
    'xl': 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    'full': 'max-w-full'
  };
  
  return (
    <div className={`
      ${maxWidths[maxWidth]}
      ${padding ? 'px-4 sm:px-6 lg:px-8' : ''}
      mx-auto
      ${className}
    `}>
      {children}
    </div>
  );
};

// Responsive Grid Component
export const ResponsiveGrid = ({ 
  children, 
  cols = { default: 1, sm: 2, lg: 3, xl: 4 },
  gap = 6,
  className = '' 
}) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6'
  };
  
  const gaps = {
    2: 'gap-2',
    4: 'gap-4',
    6: 'gap-6',
    8: 'gap-8',
    10: 'gap-10',
    12: 'gap-12'
  };
  
  return (
    <div className={`
      grid 
      ${gridCols[cols.default] || 'grid-cols-1'}
      ${cols.sm ? `sm:${gridCols[cols.sm]}` : ''}
      ${cols.md ? `md:${gridCols[cols.md]}` : ''}
      ${cols.lg ? `lg:${gridCols[cols.lg]}` : ''}
      ${cols.xl ? `xl:${gridCols[cols.xl]}` : ''}
      ${gaps[gap]}
      ${className}
    `}>
      {children}
    </div>
  );
};

export default MobileNavigation;
