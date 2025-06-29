import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import reportWebVitals from './reportWebVitals';
// Import comprehensive performance monitoring
import performanceMonitor from './utils/performance-monitor.js';

// Vite entry point
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// ==================== ENHANCED PERFORMANCE MONITORING ====================

// Initialize comprehensive performance monitoring
if (import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING !== 'false') {
  // Start comprehensive performance monitoring
  console.log('🔄 Initializing comprehensive performance monitoring...');
  
  // Initialize performance monitor (already auto-starts)
  // performanceMonitor is already running from import
  
  // Enhanced web vitals reporting with custom analytics
  reportWebVitals((metric) => {
    // Send to console in development
    if (import.meta.env.DEV) {
      console.group(`📊 Web Vital: ${metric.name}`);
      console.log(`Value: ${metric.value}${metric.name === 'CLS' ? '' : 'ms'}`);
      console.log(`Rating: ${metric.rating}`);
      console.log(`Delta: ${metric.delta}${metric.name === 'CLS' ? '' : 'ms'}`);
      console.groupEnd();
    }
    
    // Send to analytics service in production
    if (import.meta.env.PROD && import.meta.env.VITE_ANALYTICS_ENABLED === 'true') {
      // Send to Google Analytics 4, Mixpanel, or custom analytics
      if (window.gtag) {
        window.gtag('event', metric.name, {
          event_category: 'Web Vitals',
          value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
          non_interaction: true,
          custom_parameter_1: metric.rating,
        });
      }
      
      // Send to custom analytics endpoint
      fetch('/api/v1/analytics/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'web_vital',
          name: metric.name,
          value: metric.value,
          rating: metric.rating,
          delta: metric.delta,
          id: metric.id,
          timestamp: Date.now(),
          url: window.location.href,
          userAgent: navigator.userAgent
        })
      }).catch(err => console.warn('Analytics reporting failed:', err));
    }
  });
  
  console.log('✅ Performance monitoring active');
} else {
  console.log('⚡ Performance monitoring disabled');
  reportWebVitals(); // Still report basic vitals
}

// ==================== DEVELOPMENT TOOLS ====================

// Development mode enhancements
if (import.meta.env.DEV) {
  // Performance budget warnings
  const PERFORMANCE_BUDGETS = {
    LCP: 2500, // Largest Contentful Paint
    FID: 100,  // First Input Delay
    CLS: 0.1,  // Cumulative Layout Shift
    FCP: 1800, // First Contentful Paint
    TTFB: 800  // Time to First Byte
  };
  
  // Check performance budgets
  setTimeout(() => {
    performance.getEntriesByType('navigation').forEach(entry => {
      const loadTime = entry.loadEventEnd - entry.fetchStart;
      if (loadTime > 3000) {
        console.warn(`⚠️ Page load time (${Math.round(loadTime)}ms) exceeds 3s budget`);
      }
    });
  }, 2000);
  
  // Bundle size warnings (example implementation)
  if (import.meta.env.VITE_BUNDLE_ANALYZER === 'true') {
    console.log('📦 Bundle analysis mode enabled');
    
    // Track component render times in development
    const originalConsoleTime = console.time;
    const originalConsoleTimeEnd = console.timeEnd;
    
    window.trackComponentRender = (componentName) => {
      originalConsoleTime.call(console, `Render: ${componentName}`);
      return () => originalConsoleTimeEnd.call(console, `Render: ${componentName}`);
    };
  }
}

// ==================== ERROR MONITORING ====================

// Enhanced error tracking
window.addEventListener('error', (event) => {
  const errorReport = {
    type: 'javascript_error',
    message: event.error?.message || 'Unknown error',
    filename: event.filename,
    line: event.lineno,
    col: event.colno,
    stack: event.error?.stack,
    timestamp: Date.now(),
    url: window.location.href,
    userAgent: navigator.userAgent
  };
  
  if (import.meta.env.DEV) {
    console.error('🚨 JavaScript Error:', errorReport);
  }
  
  // Send to error reporting service in production
  if (import.meta.env.PROD) {
    fetch('/api/v1/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorReport)
    }).catch(() => {}); // Fail silently for error reporting
  }
});

// Unhandled promise rejection tracking
window.addEventListener('unhandledrejection', (event) => {
  const errorReport = {
    type: 'promise_rejection',
    message: event.reason?.message || String(event.reason),
    stack: event.reason?.stack,
    timestamp: Date.now(),
    url: window.location.href,
    userAgent: navigator.userAgent
  };
  
  if (import.meta.env.DEV) {
    console.error('🚨 Unhandled Promise Rejection:', errorReport);
  }
  
  // Send to error reporting service in production
  if (import.meta.env.PROD) {
    fetch('/api/v1/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorReport)
    }).catch(() => {});
  }
});

// ==================== HOT MODULE REPLACEMENT ====================

// Hot Module Replacement (HMR) for development
if (import.meta.hot) {
  import.meta.hot.accept('./App.jsx', () => {
    console.log('🔄 Hot reloading App.jsx...');
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  });
  
  // Accept updates to performance monitoring
  import.meta.hot.accept('./utils/performance-monitor.js', () => {
    console.log('🔄 Hot reloading performance monitor...');
  });
  
  // Clear performance marks on hot reload to prevent memory leaks
  import.meta.hot.dispose(() => {
    performance.clearMarks();
    performance.clearMeasures();
  });
}

// ==================== FEATURE FLAGS ====================

// Feature flags for gradual rollouts
window.featureFlags = {
  enablePerformanceMonitoring: import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING !== 'false',
  enableAnalytics: import.meta.env.VITE_ANALYTICS_ENABLED === 'true',
  enableErrorReporting: import.meta.env.VITE_ERROR_REPORTING === 'true',
  enableA11yTesting: import.meta.env.DEV || import.meta.env.VITE_A11Y_TESTING === 'true',
  enableBundleAnalysis: import.meta.env.VITE_BUNDLE_ANALYZER === 'true'
};

// Log enabled features in development
if (import.meta.env.DEV) {
  console.group('🚀 CoinEstate NFT Platform - Features');
  Object.entries(window.featureFlags).forEach(([flag, enabled]) => {
    console.log(`${flag}: ${enabled ? '✅' : '❌'}`);
  });
  console.groupEnd();
}

// ==================== STARTUP PERFORMANCE TRACKING ====================

// Mark application as fully loaded
setTimeout(() => {
  performance.mark('app-fully-loaded');
  
  if (import.meta.env.DEV) {
    const navigationEntry = performance.getEntriesByType('navigation')[0];
    const appLoadTime = performance.now();
    
    console.group('📊 Application Load Performance');
    console.log(`Total Load Time: ${Math.round(appLoadTime)}ms`);
    console.log(`DOM Content Loaded: ${Math.round(navigationEntry.domContentLoadedEventEnd)}ms`);
    console.log(`Load Event: ${Math.round(navigationEntry.loadEventEnd)}ms`);
    console.groupEnd();
  }
}, 100);
