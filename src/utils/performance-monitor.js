// Performance Monitoring & Optimization System
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      pageLoads: [],
      userInteractions: [],
      resourceTimings: [],
      webVitals: {},
      errors: []
    };
    
    this.initializeMonitoring();
  }

  initializeMonitoring() {
    // Web Vitals Monitoring
    this.monitorWebVitals();
    
    // Custom Performance Metrics
    this.monitorCustomMetrics();
    
    // Resource Loading Performance
    this.monitorResourceLoading();
    
    // User Interaction Performance
    this.monitorUserInteractions();
    
    // Error Performance Impact
    this.monitorErrorImpact();
    
    // Blockchain Transaction Performance
    this.monitorWeb3Performance();
  }

  monitorWebVitals() {
    // Core Web Vitals
    getCLS((metric) => {
      this.reportMetric('CLS', metric.value, {
        entries: metric.entries,
        id: metric.id,
        threshold: 0.1 // Good < 0.1, Poor > 0.25
      });
    });

    getFID((metric) => {
      this.reportMetric('FID', metric.value, {
        entries: metric.entries,
        id: metric.id,
        threshold: 100 // Good < 100ms, Poor > 300ms
      });
    });

    getFCP((metric) => {
      this.reportMetric('FCP', metric.value, {
        entries: metric.entries,
        id: metric.id,
        threshold: 1800 // Good < 1.8s, Poor > 3.0s
      });
    });

    getLCP((metric) => {
      this.reportMetric('LCP', metric.value, {
        entries: metric.entries,
        id: metric.id,
        threshold: 2500 // Good < 2.5s, Poor > 4.0s
      });
    });

    getTTFB((metric) => {
      this.reportMetric('TTFB', metric.value, {
        entries: metric.entries,
        id: metric.id,
        threshold: 800 // Good < 800ms, Poor > 1800ms
      });
    });
  }

  monitorCustomMetrics() {
    // Homepage Load Performance
    performance.mark('homepage-start');
    
    // Monitor React component render times
    this.measureComponentRender('HeroSection');
    this.measureComponentRender('PropertyPreviews');
    this.measureComponentRender('StatsSection');
    
    // API Response Times
    this.measureAPIPerformance();
    
    // Bundle Loading Performance
    this.measureBundlePerformance();
  }

  measureComponentRender(componentName) {
    const startMark = `${componentName}-render-start`;
    const endMark = `${componentName}-render-end`;
    const measureName = `${componentName}-render-duration`;
    
    performance.mark(startMark);
    
    // Measure when component finishes rendering
    requestIdleCallback(() => {
      performance.mark(endMark);
      performance.measure(measureName, startMark, endMark);
      
      const measure = performance.getEntriesByName(measureName)[0];
      this.reportMetric('ComponentRender', measure.duration, {
        component: componentName,
        threshold: 16 // Target: 60fps = 16ms per frame
      });
    });
  }

  measureAPIPerformance() {
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const startTime = performance.now();
      const url = args[0];
      
      try {
        const response = await originalFetch(...args);
        const duration = performance.now() - startTime;
        
        this.reportMetric('APIResponse', duration, {
          url: url,
          status: response.status,
          method: args[1]?.method || 'GET',
          threshold: 1000 // Good < 1s, Poor > 3s
        });
        
        return response;
      } catch (error) {
        const duration = performance.now() - startTime;
        
        this.reportMetric('APIError', duration, {
          url: url,
          error: error.message,
          method: args[1]?.method || 'GET'
        });
        
        throw error;
      }
    };
  }

  measureBundlePerformance() {
    // Monitor JavaScript bundle loading
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name.includes('.js') || entry.name.includes('.css')) {
          this.reportMetric('ResourceLoading', entry.duration, {
            resource: entry.name,
            type: entry.name.includes('.js') ? 'JavaScript' : 'CSS',
            size: entry.transferSize,
            cached: entry.transferSize === 0,
            threshold: 2000 // Good < 2s for resources
          });
        }
      }
    });
    
    observer.observe({ entryTypes: ['resource'] });
  }

  monitorResourceLoading() {
    // Monitor critical resources
    const criticalResources = [
      '/static/js/main.',
      '/static/css/main.',
      '/manifest.json',
      '/favicon.ico'
    ];

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const isCritical = criticalResources.some(resource => 
          entry.name.includes(resource)
        );
        
        if (isCritical) {
          this.reportMetric('CriticalResourceLoading', entry.duration, {
            resource: entry.name,
            size: entry.transferSize,
            cached: entry.transferSize === 0,
            threshold: 1000 // Critical resources should load < 1s
          });
        }
      }
    });
    
    observer.observe({ entryTypes: ['resource'] });
  }

  monitorUserInteractions() {
    // Monitor click response times
    document.addEventListener('click', (event) => {
      const startTime = performance.now();
      
      requestAnimationFrame(() => {
        const duration = performance.now() - startTime;
        
        this.reportMetric('UserInteraction', duration, {
          type: 'click',
          element: event.target.tagName,
          className: event.target.className,
          threshold: 16 // 60fps target
        });
      });
    });

    // Monitor scroll performance
    let scrollStartTime = null;
    document.addEventListener('scroll', () => {
      if (!scrollStartTime) {
        scrollStartTime = performance.now();
        
        requestIdleCallback(() => {
          const duration = performance.now() - scrollStartTime;
          
          this.reportMetric('ScrollPerformance', duration, {
            type: 'scroll',
            threshold: 16 // Smooth scrolling target
          });
          
          scrollStartTime = null;
        });
      }
    });
  }

  monitorErrorImpact() {
    window.addEventListener('error', (event) => {
      this.reportMetric('ErrorImpact', performance.now(), {
        error: event.error?.message || 'Unknown error',
        filename: event.filename,
        line: event.lineno,
        col: event.colno,
        type: 'javascript'
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.reportMetric('ErrorImpact', performance.now(), {
        error: event.reason?.message || 'Unhandled promise rejection',
        type: 'promise'
      });
    });
  }

  monitorWeb3Performance() {
    // Monitor wallet connection performance
    if (window.ethereum) {
      const originalRequest = window.ethereum.request;
      
      window.ethereum.request = async (args) => {
        const startTime = performance.now();
        const method = args.method;
        
        try {
          const result = await originalRequest(args);
          const duration = performance.now() - startTime;
          
          this.reportMetric('Web3Performance', duration, {
            method: method,
            success: true,
            threshold: this.getWeb3Threshold(method)
          });
          
          return result;
        } catch (error) {
          const duration = performance.now() - startTime;
          
          this.reportMetric('Web3Performance', duration, {
            method: method,
            success: false,
            error: error.message,
            threshold: this.getWeb3Threshold(method)
          });
          
          throw error;
        }
      };
    }
  }

  getWeb3Threshold(method) {
    const thresholds = {
      'eth_requestAccounts': 3000, // Wallet connection
      'eth_sendTransaction': 10000, // Transaction submission
      'eth_call': 1000, // Contract read
      'eth_estimateGas': 2000, // Gas estimation
      'eth_getBalance': 1000, // Balance check
    };
    
    return thresholds[method] || 5000; // Default threshold
  }

  reportMetric(name, value, metadata = {}) {
    const metric = {
      name,
      value,
      timestamp: Date.now(),
      url: window.location.pathname,
      userAgent: navigator.userAgent,
      connectionType: navigator.connection?.effectiveType || 'unknown',
      ...metadata
    };

    // Store locally
    this.metrics[this.getMetricCategory(name)].push(metric);

    // Report to analytics service
    this.sendToAnalytics(metric);

    // Check thresholds and alert if necessary
    this.checkThresholds(metric);
  }

  getMetricCategory(name) {
    const categories = {
      'CLS': 'webVitals',
      'FID': 'webVitals',
      'FCP': 'webVitals',
      'LCP': 'webVitals',
      'TTFB': 'webVitals',
      'ComponentRender': 'userInteractions',
      'UserInteraction': 'userInteractions',
      'APIResponse': 'resourceTimings',
      'ResourceLoading': 'resourceTimings',
      'Web3Performance': 'resourceTimings',
      'ErrorImpact': 'errors'
    };
    
    return categories[name] || 'pageLoads';
  }

  async sendToAnalytics(metric) {
    // Send to analytics service (Google Analytics, Mixpanel, etc.)
    try {
      await fetch('/api/v1/analytics/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metric)
      });
    } catch (error) {
      console.warn('Failed to send performance metric:', error);
    }
  }

  checkThresholds(metric) {
    if (metric.threshold && metric.value > metric.threshold) {
      console.warn(`Performance threshold exceeded:`, metric);
      
      // Alert for critical performance issues
      if (metric.value > metric.threshold * 2) {
        this.alertCriticalPerformance(metric);
      }
    }
  }

  alertCriticalPerformance(metric) {
    // Send alert to monitoring system
    fetch('/api/v1/alerts/performance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        severity: 'high',
        metric: metric.name,
        value: metric.value,
        threshold: metric.threshold,
        url: metric.url,
        timestamp: metric.timestamp
      })
    }).catch(error => {
      console.error('Failed to send performance alert:', error);
    });
  }

  generateReport() {
    const report = {
      summary: this.generateSummary(),
      webVitals: this.analyzeWebVitals(),
      components: this.analyzeComponentPerformance(),
      resources: this.analyzeResourcePerformance(),
      web3: this.analyzeWeb3Performance(),
      recommendations: this.generateRecommendations()
    };

    return report;
  }

  generateSummary() {
    const allMetrics = [
      ...this.metrics.pageLoads,
      ...this.metrics.userInteractions,
      ...this.metrics.resourceTimings
    ];

    return {
      totalMetrics: allMetrics.length,
      timeRange: {
        start: Math.min(...allMetrics.map(m => m.timestamp)),
        end: Math.max(...allMetrics.map(m => m.timestamp))
      },
      criticalIssues: allMetrics.filter(m => 
        m.threshold && m.value > m.threshold * 2
      ).length,
      performanceScore: this.calculatePerformanceScore()
    };
  }

  calculatePerformanceScore() {
    // Calculate overall performance score based on Web Vitals
    const vitals = this.metrics.webVitals;
    let score = 100;

    // LCP scoring
    if (vitals.LCP > 4000) score -= 25;
    else if (vitals.LCP > 2500) score -= 15;

    // FID scoring
    if (vitals.FID > 300) score -= 25;
    else if (vitals.FID > 100) score -= 15;

    // CLS scoring
    if (vitals.CLS > 0.25) score -= 25;
    else if (vitals.CLS > 0.1) score -= 15;

    return Math.max(0, score);
  }

  generateRecommendations() {
    const recommendations = [];
    
    // Analyze metrics and generate actionable recommendations
    if (this.metrics.webVitals.LCP > 2500) {
      recommendations.push({
        priority: 'high',
        category: 'Loading Performance',
        issue: 'Largest Contentful Paint is slow',
        recommendation: 'Optimize images, enable lazy loading, use CDN',
        impact: 'User experience and SEO ranking'
      });
    }

    // Add more recommendations based on other metrics...
    
    return recommendations;
  }
}

// Initialize performance monitoring
const performanceMonitor = new PerformanceMonitor();

// Export for use in components
export default performanceMonitor;

// Performance Budget Enforcement
export const PERFORMANCE_BUDGETS = {
  // Bundle sizes (in KB)
  mainJSBundle: 250,
  mainCSSBundle: 50,
  totalPageSize: 1500,
  
  // Timing budgets (in ms)
  firstContentfulPaint: 1800,
  largestContentfulPaint: 2500,
  firstInputDelay: 100,
  cumulativeLayoutShift: 0.1,
  
  // Resource counts
  totalRequests: 50,
  javascriptRequests: 10,
  cssRequests: 5,
  imageRequests: 20
};

// Performance Testing Utility
export const testPerformance = async (url = window.location.href) => {
  const startTime = performance.now();
  
  // Simulate user navigation
  performance.mark('test-start');
  
  // Wait for page to be fully loaded
  await new Promise(resolve => {
    if (document.readyState === 'complete') {
      resolve();
    } else {
      window.addEventListener('load', resolve);
    }
  });
  
  performance.mark('test-end');
  performance.measure('total-load-time', 'test-start', 'test-end');
  
  const measure = performance.getEntriesByName('total-load-time')[0];
  const report = performanceMonitor.generateReport();
  
  return {
    loadTime: measure.duration,
    performanceScore: performanceMonitor.calculatePerformanceScore(),
    recommendations: report.recommendations,
    passedBudgets: measure.duration < 3000 // 3 second budget
  };
};
