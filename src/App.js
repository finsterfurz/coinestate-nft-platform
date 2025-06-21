// src/App.js
import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navigation } from './components/navigation';
import { NotificationCenter, ErrorBoundary } from './components/ui';
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
      <ErrorBoundary>
        <main>{renderPage()}</main>
      </ErrorBoundary>
      <NotificationCenter />
    </div>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  );
};

export default App;