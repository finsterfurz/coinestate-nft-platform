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
    }`}>
      {/* 🛡️ ERROR BOUNDARY: Wrap Navigation to catch navigation-related errors */}
      <ErrorBoundary>
        <Navigation />
      </ErrorBoundary>
      
      <main id="main-content" className="transition-colors duration-300">
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
      
      {/* Enhanced CSS for animations with dark mode support */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
        
        /* Enhanced scrollbar for dark mode */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: ${darkMode ? '#1f2937' : '#f1f5f9'};
        }
        
        ::-webkit-scrollbar-thumb {
          background: ${darkMode ? '#4b5563' : '#cbd5e1'};
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: ${darkMode ? '#6b7280' : '#94a3b8'};
        }
      `}</style>
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
