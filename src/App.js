// src/App.js
import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navigation } from './components/navigation';
import { NotificationCenter } from './components/ui';
import { Homepage, About, Projects, Dashboard, HowItWorks } from './pages';
import { themes } from './utils/themes';

const AppContent = () => {
  const { currentPage, theme } = useApp();

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Homepage />;
      case 'about':
        return <About />;
      case 'projects':
        return <Projects />;
      case 'dashboard':
        return <Dashboard />;
      case 'how-it-works':
        return <HowItWorks />;
      default:
        return <Homepage />;
    }
  };

  return (
    <div className={`min-h-screen transition-colors ${themes[theme].primary}`}>
      <Navigation />
      <main>{renderPage()}</main>
      <NotificationCenter />
      
      <style jsx>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slideIn { animation: slideIn 0.3s ease-out; }
      `}</style>
    </div>
  );
};

const App = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;