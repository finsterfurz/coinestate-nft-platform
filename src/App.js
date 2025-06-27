import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import ErrorBoundary from './components/ErrorBoundary';
import { router } from './routes';

/**
 * Root App Component with React Router v6
 * 
 * Provider hierarchy:
 * 1. ErrorBoundary - Top-level error catching
 * 2. HelmetProvider - SEO and document head management
 * 3. ThemeProvider - Theme state management
 * 4. AuthProvider - Authentication state management
 * 5. AppProvider - General app state management
 * 6. RouterProvider - React Router v6 routing
 */
const App = () => {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <ThemeProvider>
          <AuthProvider>
            <AppProvider>
              <RouterProvider router={router} />
            </AppProvider>
          </AuthProvider>
        </ThemeProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
};

export default App;
