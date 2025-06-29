/**
 * Enhanced Performance Monitoring and Optimization Utilities
 * Comprehensive performance tracking and optimization for CoinEstate NFT Platform
 */

// ================ PERFORMANCE METRICS ================

export interface PerformanceMetrics {
  navigationTiming: PerformanceNavigationTiming | null;
  resourceTiming: PerformanceResourceTiming[];
  paintTiming: PerformancePaintTiming[];
  firstContentfulPaint: number | null;
  largestContentfulPaint: number | null;
  firstInputDelay: number | null;
  cumulativeLayoutShift: number | null;
  totalBlockingTime: number | null;
}

export interface WebVitals {
  FCP: number | null; // First Contentful Paint
  LCP: number | null; // Largest Contentful Paint
  FID: number | null; // First Input Delay
  CLS: number | null; // Cumulative Layout Shift
  TBT: number | null; // Total Blocking Time
}

// ================ PERFORMANCE OBSERVER ================

class PerformanceMonitor {
  private metrics: Partial<WebVitals> = {};
  private observers: PerformanceObserver[] = [];
  private isSupported: boolean;

  constructor() {
    this.isSupported = typeof window !== 'undefined' && 'PerformanceObserver' in window;
    if (this.isSupported) {
      this.initializeObservers();
    }
  }

  private initializeObservers(): void {
    // Largest Contentful Paint
    this.observeMetric('largest-contentful-paint', (entries) => {
      const lastEntry = entries[entries.length - 1] as PerformanceEntry & { renderTime: number; loadTime: number };
      this.metrics.LCP = lastEntry.renderTime || lastEntry.loadTime;
      this.reportMetric('LCP', this.metrics.LCP);
    });

    // First Input Delay
    this.observeMetric('first-input', (entries) => {
      const firstInput = entries[0] as PerformanceEntry & { processingStart: number; startTime: number };
      this.metrics.FID = firstInput.processingStart - firstInput.startTime;
      this.reportMetric('FID', this.metrics.FID);
    });

    // Cumulative Layout Shift
    this.observeMetric('layout-shift', (entries) => {
      let clsScore = 0;
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsScore += entry.value;
        }
      });
      this.metrics.CLS = clsScore;
      this.reportMetric('CLS', this.metrics.CLS);
    });

    // Paint Timing
    this.observeMetric('paint', (entries) => {
      entries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          this.metrics.FCP = entry.startTime;
          this.reportMetric('FCP', this.metrics.FCP);
        }
      });
    });

    // Navigation Timing
    this.observeMetric('navigation', (entries) => {
      const navigationEntry = entries[0] as PerformanceNavigationTiming;
      this.reportNavigationMetrics(navigationEntry);
    });
  }

  private observeMetric(type: string, callback: (entries: PerformanceEntry[]) => void): void {
    try {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries());
      });
      observer.observe({ type, buffered: true });
      this.observers.push(observer);
    } catch (error) {
      console.warn(`Failed to observe ${type} performance metric:`, error);
    }
  }

  private reportMetric(name: string, value: number | null): void {
    if (value === null) return;

    // Send to analytics (Google Analytics 4)
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'web_vitals', {
        metric_name: name,
        metric_value: Math.round(value),
        custom_parameter: {
          page_title: document.title,
          page_location: window.location.href
        }
      });
    }

    // Send to performance monitoring service (e.g., Sentry)
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.addBreadcrumb({
        category: 'performance',
        message: `${name}: ${Math.round(value)}ms`,
        level: 'info'
      });
    }

    // Development logging
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 Performance Metric - ${name}:`, `${Math.round(value)}ms`);
    }
  }

  private reportNavigationMetrics(navigationEntry: PerformanceNavigationTiming): void {
    const metrics = {
      dns_lookup_time: navigationEntry.domainLookupEnd - navigationEntry.domainLookupStart,
      tcp_connection_time: navigationEntry.connectEnd - navigationEntry.connectStart,
      ssl_time: navigationEntry.connectEnd - navigationEntry.secureConnectionStart,
      ttfb: navigationEntry.responseStart - navigationEntry.requestStart, // Time to First Byte
      response_time: navigationEntry.responseEnd - navigationEntry.responseStart,
      dom_processing_time: navigationEntry.domContentLoadedEventStart - navigationEntry.responseEnd,
      load_complete_time: navigationEntry.loadEventEnd - navigationEntry.loadEventStart
    };

    // Report critical timing metrics
    Object.entries(metrics).forEach(([name, value]) => {
      if (value > 0) {
        this.reportMetric(name, value);
      }
    });
  }

  public getMetrics(): Partial<WebVitals> {
    return { ...this.metrics };
  }

  public disconnect(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// ================ PERFORMANCE OPTIMIZATION HOOKS ================

/**
 * React hook for performance monitoring
 */
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = React.useState<Partial<WebVitals>>({});
  const monitorRef = React.useRef<PerformanceMonitor | null>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      monitorRef.current = new PerformanceMonitor();
      
      // Update metrics periodically
      const interval = setInterval(() => {
        if (monitorRef.current) {
          setMetrics(monitorRef.current.getMetrics());
        }
      }, 1000);

      return () => {
        clearInterval(interval);
        if (monitorRef.current) {
          monitorRef.current.disconnect();
        }
      };
    }
  }, []);

  return metrics;
};

/**
 * Component performance measurement hook
 */
export const useComponentPerformance = (componentName: string) => {
  const mountTime = React.useRef<number>(performance.now());
  const renderCount = React.useRef<number>(0);

  React.useEffect(() => {
    renderCount.current += 1;
    
    const renderTime = performance.now() - mountTime.current;
    
    if (renderTime > 16) { // Warn if component takes longer than one frame
      console.warn(`⚠️ Slow component render: ${componentName} took ${renderTime.toFixed(2)}ms`);
    }

    // Track render performance
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'component_performance', {
        component_name: componentName,
        render_time: Math.round(renderTime),
        render_count: renderCount.current
      });
    }
  });

  return {
    renderCount: renderCount.current,
    mountTime: mountTime.current
  };
};

// ================ RESOURCE OPTIMIZATION ================

/**
 * Lazy loading utility for images
 */
export const lazyLoadImage = (src: string, placeholder?: string): string => {
  const [imageSrc, setImageSrc] = React.useState(placeholder || '');
  const [isLoaded, setIsLoaded] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>();

  React.useEffect(() => {
    if (!src) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = new Image();
            img.onload = () => {
              setImageSrc(src);
              setIsLoaded(true);
              observer.disconnect();
            };
            img.onerror = () => {
              console.error(`Failed to load image: ${src}`);
              observer.disconnect();
            };
            img.src = src;
          }
        });
      },
      { rootMargin: '100px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src]);

  return imageSrc;
};

/**
 * Resource preloading utility
 */
export const preloadResources = (resources: Array<{ href: string; as: string; type?: string }>) => {
  if (typeof window === 'undefined') return;

  resources.forEach(({ href, as, type }) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    if (type) link.type = type;
    
    link.onload = () => {
      console.log(`✅ Preloaded resource: ${href}`);
    };
    
    link.onerror = () => {
      console.error(`❌ Failed to preload resource: ${href}`);
    };
    
    document.head.appendChild(link);
  });
};

// ================ MEMORY OPTIMIZATION ================

/**
 * Memory usage monitoring
 */
export const useMemoryMonitor = () => {
  const [memoryInfo, setMemoryInfo] = React.useState<any>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const updateMemoryInfo = () => {
        const memory = (performance as any).memory;
        setMemoryInfo({
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
          usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
        });
      };

      updateMemoryInfo();
      const interval = setInterval(updateMemoryInfo, 5000);

      return () => clearInterval(interval);
    }
  }, []);

  return memoryInfo;
};

/**
 * Cleanup utility for preventing memory leaks
 */
export const useCleanup = (cleanupFn: () => void, deps: React.DependencyList = []) => {
  React.useEffect(() => {
    return cleanupFn;
  }, deps);
};

// ================ PERFORMANCE UTILITIES ================

/**
 * Debounce utility for performance optimization
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Throttle utility for performance optimization
 */
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const lastRun = React.useRef(Date.now());

  return React.useCallback(
    ((...args) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = Date.now();
      }
    }) as T,
    [callback, delay]
  );
};

/**
 * Bundle size analyzer (development only)
 */
export const analyzeBundleSize = () => {
  if (process.env.NODE_ENV !== 'development') return;

  const scripts = Array.from(document.querySelectorAll('script[src]'));
  const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));

  console.group('📦 Bundle Analysis');
  console.log('JavaScript files:', scripts.length);
  console.log('CSS files:', styles.length);
  
  scripts.forEach((script: any) => {
    console.log(`JS: ${script.src}`);
  });
  
  styles.forEach((style: any) => {
    console.log(`CSS: ${style.href}`);
  });
  
  console.groupEnd();
};

// ================ EXPORT ALL ================

export const performanceMonitor = new PerformanceMonitor();

export default {
  PerformanceMonitor,
  usePerformanceMonitor,
  useComponentPerformance,
  useMemoryMonitor,
  useCleanup,
  useDebounce,
  useThrottle,
  lazyLoadImage,
  preloadResources,
  analyzeBundleSize,
  performanceMonitor
};
