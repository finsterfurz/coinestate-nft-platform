import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navigation from './components/navigation/Navigation';
import NotificationCenter from './components/ui/NotificationCenter';
import Footer from './components/layout/Footer';
import Homepage from './pages/Homepage';
import ProjectsPage from './pages/Projects';
import DashboardPage from './pages/Dashboard';
import AboutPage from './pages/About';
import HowItWorksPage from './pages/HowItWorks';

// ==================== MAIN APP COMPONENT ====================
const CoinEstateApp = () => {
  const { currentPage, theme } = useApp();

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
    <div className={`min-h-screen transition-colors ${
      theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
    }`}>
      <Navigation />
      <main>{renderPage()}</main>
      <Footer />
      <NotificationCenter />
      
      {/* Custom CSS for animations */}
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
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

// ==================== MAIN EXPORT ====================
const App = () => {
  return (
    <AppProvider>
      <CoinEstateApp />
    </AppProvider>
  );
};

export default App;
