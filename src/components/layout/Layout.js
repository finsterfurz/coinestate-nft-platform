import React from 'react';
import { Outlet } from 'react-router-dom';
import { ThemeProvider } from '../context/ThemeContext';
import { AppProvider } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import ErrorBoundary from '../ErrorBoundary';
import Navigation from '../navigation/Navigation';
import NotificationCenter from '../ui/NotificationCenter';
import ThemeDebugPanel from '../ui/ThemeDebugPanel';
import Footer from './Footer';

// Import CSS modules for animations and styling
import animations from '../../styles/animations.module.css';
import scrollbar from '../../styles/scrollbar.module.css';

// ==================== LAYOUT COMPONENT ====================
const LayoutContent = () => {
  const { darkMode } = useTheme();

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
    } ${scrollbar.lightScrollbar}`}>
      {/* 🛡️ ERROR BOUNDARY: Wrap Navigation to catch navigation-related errors */}
      <ErrorBoundary>
        <Navigation />
      </ErrorBoundary>
      
      {/* Main content area with React Router Outlet */}
      <main id="main-content" className={`transition-colors duration-300 ${animations.fadeIn}`}>
        {/* 🛡️ ERROR BOUNDARY: Wrap main content to catch page-level errors */}
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      
      {/* 🛡️ ERROR BOUNDARY: Wrap Footer separately to isolate footer errors */}
      <ErrorBoundary>
        <Footer />
      </ErrorBoundary>
      
      {/* 🛡️ ERROR BOUNDARY: Wrap UI components to catch notification/debug errors */}
      <ErrorBoundary>
        <NotificationCenter />
      </ErrorBoundary>
      
      {/* 🔧 DEBUG: Add ThemeDebugPanel for troubleshooting */}
      {import.meta.env.VITE_DEBUG_MODE === 'true' && (
        <ErrorBoundary>
          <ThemeDebugPanel />
        </ErrorBoundary>
      )}
    </div>
  );
};

// ==================== MAIN LAYOUT WITH PROVIDERS ====================
const Layout = () => {
  return (
    // 🛡️ TOP-LEVEL ERROR BOUNDARY: Catch any provider or context errors
    <ErrorBoundary>
      {/* 🎯 CRITICAL: ThemeProvider OUTSIDE - prevents AppContext resets during theme changes */}
      <ThemeProvider>
        {/* 🛡️ AppProvider INSIDE - notifications and app state preserved during theme switches */}
        <AppProvider>
          <LayoutContent />
        </AppProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default Layout;
