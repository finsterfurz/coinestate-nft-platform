import React from 'react';
import { AlertTriangle, RefreshCw, Home, Mail } from '../icons';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Generate unique error ID for reporting
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.setState({
      error,
      errorInfo,
      errorId
    });

    // Log error for monitoring (in production, send to error reporting service)
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // In production, send to error reporting service
    if (process.env.NODE_ENV === 'production') {
      this.reportError(error, errorInfo, errorId);
    }
  }

  reportError = (error, errorInfo, errorId) => {
    // In production, this would send to Sentry, LogRocket, etc.
    const errorReport = {
      errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    // Example: Send to error reporting service
    // fetch('/api/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorReport)
    // });

    console.log('Error Report:', errorReport);
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const { error, errorId } = this.state;
      const isDevelopment = process.env.NODE_ENV === 'development';

      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
          <div className="max-w-2xl w-full">
            {/* Error Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
              {/* Icon and Title */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Oops! Something went wrong
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  We apologize for the inconvenience. An unexpected error occurred.
                </p>
              </div>

              {/* Error Details (Development Only) */}
              {isDevelopment && error && (
                <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <h3 className="text-sm font-semibold text-red-800 dark:text-red-400 mb-2">
                    Error Details (Development Mode):
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-300 font-mono bg-red-100 dark:bg-red-900/30 p-2 rounded">
                    {error.message}
                  </p>
                </div>
              )}

              {/* Error ID */}
              {errorId && (
                <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Error Reference ID:
                  </h3>
                  <p className="text-sm font-mono text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-700 p-2 rounded border">
                    {errorId}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    Please include this ID when contacting support.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={this.handleReload}
                  className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>Reload Page</span>
                </button>
                
                <button
                  onClick={this.handleGoHome}
                  className="flex items-center justify-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  <Home className="w-5 h-5" />
                  <span>Go Home</span>
                </button>
              </div>

              {/* Support Information */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  If this problem persists, please contact our support team.
                </p>
                <div className="flex justify-center space-x-6 text-sm">
                  <a 
                    href="mailto:support@coinestate.io" 
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <Mail className="w-4 h-4" />
                    <span>support@coinestate.io</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Additional Help */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                CoinEstate NFT Platform • Cayman Islands Regulated
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
