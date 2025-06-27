/**
 * Security Provider Component
 * Wraps the application with security context and monitoring
 */

import React, { createContext, useContext, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSecurity } from '../../hooks/useSecurity';
import { generateCSPString, getSecurityConfig } from '../../config/security';

// Create Security Context
const SecurityContext = createContext();

/**
 * Hook to use Security Context
 */
export const useSecurityContext = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurityContext must be used within SecurityProvider');
  }
  return context;
};

/**
 * Security Provider Component
 */
export const SecurityProvider = ({ children }) => {
  const security = useSecurity();
  const securityConfig = getSecurityConfig();

  // Security initialization and monitoring
  useEffect(() => {
    // Check for common security threats on mount
    performSecurityChecks();
    
    // Setup global error handling for security events
    setupGlobalErrorHandling();
    
    // Monitor for suspicious activity
    setupActivityMonitoring();
    
    return () => {
      // Cleanup on unmount
      security.logSecurityEvent('SECURITY_PROVIDER_UNMOUNTED');
    };
  }, []);

  /**
   * Perform initial security checks
   */
  const performSecurityChecks = () => {
    const checks = [];
    
    // Check secure context
    if (!security.isSecureContext) {
      checks.push('Not running in secure context (HTTPS)');
    }
    
    // Check for development mode in production
    if (process.env.NODE_ENV === 'production' && process.env.REACT_APP_DEBUG_MODE === 'true') {
      checks.push('Debug mode enabled in production');
    }
    
    // Check for exposed development tools
    if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      checks.push('React DevTools detected');
    }
    
    // Check for suspicious global variables
    const suspiciousGlobals = ['eval', '__webpack_require__', 'webpackJsonp'];
    suspiciousGlobals.forEach(global => {
      if (window[global]) {
        checks.push(`Suspicious global variable detected: ${global}`);
      }
    });
    
    if (checks.length > 0) {
      security.logSecurityEvent('SECURITY_CHECKS_FAILED', { issues: checks });
      
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ Security Issues Detected:', checks);
      }
    } else {
      security.logSecurityEvent('SECURITY_CHECKS_PASSED');
    }
  };

  /**
   * Setup global error handling for security events
   */
  const setupGlobalErrorHandling = () => {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      security.logSecurityEvent('UNHANDLED_PROMISE_REJECTION', {
        reason: event.reason?.toString(),
        stack: event.reason?.stack
      });
    });
    
    // Handle global errors
    window.addEventListener('error', (event) => {
      security.logSecurityEvent('GLOBAL_ERROR', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });
    
    // Handle CSP violations
    document.addEventListener('securitypolicyviolation', (event) => {
      security.logSecurityEvent('CSP_VIOLATION', {
        blockedURI: event.blockedURI,
        violatedDirective: event.violatedDirective,
        originalPolicy: event.originalPolicy,
        sourceFile: event.sourceFile,
        lineNumber: event.lineNumber
      });
    });
  };

  /**
   * Setup activity monitoring for suspicious behavior
   */
  const setupActivityMonitoring = () => {
    // Monitor for rapid-fire events (potential bot activity)
    let eventCount = 0;
    let eventTimer = null;
    
    const monitorEvent = (eventType) => {
      eventCount++;
      
      if (eventTimer) {
        clearTimeout(eventTimer);
      }
      
      eventTimer = setTimeout(() => {
        if (eventCount > 50) { // More than 50 events per second
          security.logSecurityEvent('SUSPICIOUS_RAPID_EVENTS', {
            eventType,
            count: eventCount
          });
        }
        eventCount = 0;
      }, 1000);
    };
    
    // Monitor various events
    ['click', 'keydown', 'mousemove'].forEach(eventType => {
      document.addEventListener(eventType, () => monitorEvent(eventType), { passive: true });
    });
    
    // Monitor for potential XSS attempts in URLs
    const checkURL = () => {
      const url = window.location.href;
      const suspiciousPatterns = [
        /<script/i,
        /javascript:/i,
        /data:text\/html/i,
        /vbscript:/i
      ];
      
      if (suspiciousPatterns.some(pattern => pattern.test(url))) {
        security.logSecurityEvent('SUSPICIOUS_URL_DETECTED', { url });
      }
    };
    
    checkURL();
    window.addEventListener('popstate', checkURL);
  };

  /**
   * Render security headers using Helmet
   */
  const renderSecurityHeaders = () => {
    if (!securityConfig.enableSecurityHeaders) {
      return null;
    }
    
    return (
      <Helmet>
        {/* Content Security Policy */}
        {securityConfig.enableCSP && (
          <meta 
            httpEquiv="Content-Security-Policy" 
            content={generateCSPString()}
          />
        )}
        
        {/* Security Headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
        
        {/* Permissions Policy */}
        <meta 
          httpEquiv="Permissions-Policy" 
          content="camera=(), microphone=(), geolocation=(), payment=()"
        />
        
        {/* Robots Meta for Security */}
        {process.env.NODE_ENV === 'development' && (
          <meta name="robots" content="noindex, nofollow" />
        )}
      </Helmet>
    );
  };

  /**
   * Security warning overlay for development
   */
  const renderSecurityWarnings = () => {
    if (process.env.NODE_ENV !== 'development' || security.isSecureContext) {
      return null;
    }
    
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white px-4 py-2 text-sm text-center">
        ⚠️ SECURITY WARNING: Application not running in secure context (HTTPS)
      </div>
    );
  };

  // Don't render children if session is invalid
  if (!security.isSessionValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
          <div className="text-red-500 text-6xl mb-4">🔒</div>
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            Session Expired
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your session has expired for security reasons. Please refresh the page to continue.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <SecurityContext.Provider value={security}>
      {renderSecurityHeaders()}
      {renderSecurityWarnings()}
      {children}
    </SecurityContext.Provider>
  );
};

export default SecurityProvider;