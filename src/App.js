import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AppProvider, useApp } from './context/AppContext';
import { useTheme } from './context/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import Navigation from './components/navigation/Navigation';
import NotificationCenter from './components/ui/NotificationCenter';
import ThemeDebugPanel from './components/ui/ThemeDebugPanel';
import Footer from './components/layout/Footer';
import Homepage from './pages/Homepage';
import ProjectsPage from './pages/Projects';
import DashboardPage from './pages/Dashboard';
import AboutPage from './pages/About';
import HowItWorksPage from './pages/HowItWorks';

// Import CSS modules for animations and styling
import animations from './styles/animations.module.css';
import scrollbar from './styles/scrollbar.module.css';

// ==================== MAIN APP COMPONENT ====================
const CoinEstateApp = () => {
  // 🔥 FIXED: Split context usage - App state from AppContext, Theme from ThemeContext
  const { currentPage } = useApp();
  const { darkMode } = useTheme();

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Homepage />;
      case 'dashboard':
        return <DashboardPage />;
      case 'projects':
        return <ProjectsPage />;
      case 'about':
        return <AboutPage />;
      case 'how-it-works':
        return <HowItWorksPage />;
      default:
        return <Homepage />;
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
    } ${scrollbar.lightScrollbar}`}>
      {/* 🛡️ ERROR BOUNDARY: Wrap Navigation to catch navigation-related errors */}
      <ErrorBoundary>
        <Navigation />
      </ErrorBoundary>
      
      <main id="main-content" className={`transition-colors duration-300 ${animations.fadeIn}`}>
        {/* 🛡️ ERROR BOUNDARY: Wrap main content to catch page-level errors */}
        <ErrorBoundary>
          {renderPage()}
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
      <ErrorBoundary>
        <ThemeDebugPanel />
      </ErrorBoundary>
    </div>
  );
};

// ==================== MAIN EXPORT WITH CORRECT PROVIDER HIERARCHY ====================
const App = () => {
  return (
    // 🛡️ TOP-LEVEL ERROR BOUNDARY: Catch any provider or context errors
    <ErrorBoundary>
      {/* 🎯 CRITICAL: ThemeProvider OUTSIDE - prevents AppContext resets during theme changes */}
      <ThemeProvider>
        {/* 🛡️ AppProvider INSIDE - notifications and app state preserved during theme switches */}
        <AppProvider>
          <CoinEstateApp />
        </AppProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
