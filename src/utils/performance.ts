/**
 * Performance Optimization Framework for CoinEstate NFT Platform
 * Advanced performance monitoring and optimization utilities
 */

import { lazy, Suspense, memo, useMemo, useCallback, useState, useEffect } from 'react';
import type { PerformanceMetrics, ComponentBaseProps } from '../types/enhanced';

// ================ PERFORMANCE CONSTANTS ================

export const PERFORMANCE_CONFIG = {
  // Core Web Vitals Thresholds
  LCP_THRESHOLD: 2500, // Largest Contentful Paint (ms)
  FID_THRESHOLD: 100,  // First Input Delay (ms)
  CLS_THRESHOLD: 0.1,  // Cumulative Layout Shift
  
  // Bundle Size Thresholds
  MAX_BUNDLE_SIZE: 500 * 1024,  // 500KB
  MAX_CHUNK_SIZE: 250 * 1024,   // 250KB
  
  // Image Optimization
  LAZY_LOAD_THRESHOLD: 0.1,     // Intersection observer threshold
  IMAGE_QUALITY: 0.8,           // JPEG quality
  WEBP_SUPPORT: 'image/webp',
  
  // Cache Settings
  CACHE_TTL: 3600000,           // 1 hour
  SW_CACHE_NAME: 'coinestate-v1',
  
  // Performance Monitoring
  SAMPLE_RATE: 0.1,             // 10% sampling
  METRICS_BUFFER_SIZE: 100,
};

// ================ COMPONENT LAZY LOADING ================

/**
 * Enhanced lazy loading with error boundaries
 */
export const createLazyComponent = <T extends ComponentBaseProps>(
  importFn: () => Promise<{ default: React.ComponentType<T> }>,
  fallback?: React.ReactNode
) => {
  const LazyComponent = lazy(importFn);
  
  return memo((props: T) => (
    <Suspense fallback={fallback || <ComponentLoader />}>
      <LazyComponent {...props} />
    </Suspense>
  ));
};

/**
 * Loading component with skeleton UI
 */
const ComponentLoader: React.FC = memo(() => (
  <div className="animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
  </div>
));

// ================ IMAGE OPTIMIZATION ================

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  lazy?: boolean;
  quality?: number;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Optimized image component with lazy loading and WebP support
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = memo(({
  src,
  alt,
  width,
  height,
  lazy = true,
  quality = PERFORMANCE_CONFIG.IMAGE_QUALITY,
  className = '',
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const [imageSrc, setImageSrc] = useState<string>('');

  // Generate optimized image URL
  const generateOptimizedUrl = useCallback((url: string, w?: number, h?: number, q?: number) => {
    const params = new URLSearchParams();
    if (w) params.set('w', w.toString());
    if (h) params.set('h', h.toString());
    if (q) params.set('q', Math.round(q * 100).toString());
    
    // In production, this would integrate with image optimization service
    return url + (params.toString() ? `?${params.toString()}` : '');
  }, []);

  // WebP support detection
  const supportsWebP = useMemo(() => {
    if (typeof window === 'undefined') return false;
    
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }, []);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: PERFORMANCE_CONFIG.LAZY_LOAD_THRESHOLD }
    );

    const element = document.getElementById(`img-${src}`);
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, [src, lazy]);

  // Generate image source with optimization
  useEffect(() => {
    if (!isInView) return;

    let optimizedSrc = src;
    
    // Apply WebP if supported
    if (supportsWebP && !src.includes('.svg')) {
      optimizedSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    }
    
    // Apply size and quality optimization
    optimizedSrc = generateOptimizedUrl(optimizedSrc, width, height, quality);
    
    setImageSrc(optimizedSrc);
  }, [isInView, src, width, height, quality, supportsWebP, generateOptimizedUrl]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    // Fallback to original image if optimized version fails
    if (imageSrc !== src) {
      setImageSrc(src);
    } else {
      onError?.();
    }
  }, [imageSrc, src, onError]);

  return (
    <div 
      id={`img-${src}`}
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}
      {isInView && (
        <img
          src={imageSrc}
          alt={alt}
          width={width}
          height={height}
          loading={lazy ? 'lazy' : 'eager'}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleLoad}
          onError={handleError}
          decoding="async"
        />
      )}
    </div>
  );
});

// ================ PERFORMANCE MONITORING ================

/**
 * Performance metrics collector
 */
export class PerformanceMonitor {
  private static metrics: PerformanceMetrics[] = [];
  private static observer: PerformanceObserver | null = null;

  /**
   * Initialize performance monitoring
   */
  static initialize(): void {
    if (typeof window === 'undefined' || this.observer) return;

    // Core Web Vitals monitoring
    this.observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.processEntry(entry);
      }
    });

    // Observe different performance entry types
    this.observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint', 'first-input'] });

    // Monitor layout shifts
    this.monitorCLS();

    // Periodic cleanup of old metrics
    setInterval(() => this.cleanup(), 300000); // 5 minutes
  }

  /**
   * Process performance entry
   */
  private static processEntry(entry: PerformanceEntry): void {
    const metrics: Partial<PerformanceMetrics> = {
      pageLoadTime: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      cumulativeLayoutShift: 0,
      firstInputDelay: 0,
      timeToInteractive: 0
    };

    switch (entry.entryType) {
      case 'navigation':
        const navEntry = entry as PerformanceNavigationTiming;
        metrics.pageLoadTime = navEntry.loadEventEnd - navEntry.fetchStart;
        metrics.timeToInteractive = navEntry.domContentLoadedEventEnd - navEntry.fetchStart;
        break;

      case 'paint':
        if (entry.name === 'first-contentful-paint') {
          metrics.firstContentfulPaint = entry.startTime;
        }
        break;

      case 'largest-contentful-paint':
        metrics.largestContentfulPaint = entry.startTime;
        break;

      case 'first-input':
        const fiEntry = entry as any;
        metrics.firstInputDelay = fiEntry.processingStart - fiEntry.startTime;
        break;
    }

    this.recordMetrics(metrics as PerformanceMetrics);
  }

  /**
   * Monitor Cumulative Layout Shift
   */
  private static monitorCLS(): void {
    let clsValue = 0;
    let clsEntries: any[] = [];

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          const firstSessionEntry = clsEntries[0];
          const lastSessionEntry = clsEntries[clsEntries.length - 1];

          if (!firstSessionEntry || 
              entry.startTime - lastSessionEntry.startTime < 1000 ||
              entry.startTime - firstSessionEntry.startTime < 5000) {
            clsEntries.push(entry);
            clsValue += (entry as any).value;
          } else {
            this.recordMetrics({
              cumulativeLayoutShift: clsValue
            } as PerformanceMetrics);
            clsEntries = [entry];
            clsValue = (entry as any).value;
          }
        }
      }
    });

    observer.observe({ entryTypes: ['layout-shift'] });
  }

  /**
   * Record performance metrics
   */
  static recordMetrics(metrics: PerformanceMetrics): void {
    if (Math.random() > PERFORMANCE_CONFIG.SAMPLE_RATE) return; // Sampling

    this.metrics.push({
      ...metrics,
      timestamp: Date.now()
    } as PerformanceMetrics);

    // Keep only recent metrics
    if (this.metrics.length > PERFORMANCE_CONFIG.METRICS_BUFFER_SIZE) {
      this.metrics = this.metrics.slice(-PERFORMANCE_CONFIG.METRICS_BUFFER_SIZE);
    }

    // Check thresholds and alert if needed
    this.checkThresholds(metrics);
  }

  /**
   * Check performance thresholds
   */
  private static checkThresholds(metrics: PerformanceMetrics): void {
    const warnings: string[] = [];

    if (metrics.largestContentfulPaint > PERFORMANCE_CONFIG.LCP_THRESHOLD) {
      warnings.push(`LCP exceeded threshold: ${metrics.largestContentfulPaint}ms`);
    }

    if (metrics.firstInputDelay > PERFORMANCE_CONFIG.FID_THRESHOLD) {
      warnings.push(`FID exceeded threshold: ${metrics.firstInputDelay}ms`);
    }

    if (metrics.cumulativeLayoutShift > PERFORMANCE_CONFIG.CLS_THRESHOLD) {
      warnings.push(`CLS exceeded threshold: ${metrics.cumulativeLayoutShift}`);
    }

    if (warnings.length > 0) {
      console.warn('Performance thresholds exceeded:', warnings);
      // In production, send to monitoring service
    }
  }

  /**
   * Get performance summary
   */
  static getSummary(): {
    averages: PerformanceMetrics;
    latest: PerformanceMetrics | null;
    count: number;
  } {
    if (this.metrics.length === 0) {
      return {
        averages: {} as PerformanceMetrics,
        latest: null,
        count: 0
      };
    }

    const averages = this.metrics.reduce(
      (acc, metric) => {
        Object.keys(metric).forEach(key => {
          if (typeof metric[key as keyof PerformanceMetrics] === 'number') {
            acc[key as keyof PerformanceMetrics] = 
              (acc[key as keyof PerformanceMetrics] || 0) + 
              metric[key as keyof PerformanceMetrics];
          }
        });
        return acc;
      },
      {} as PerformanceMetrics
    );

    Object.keys(averages).forEach(key => {
      if (typeof averages[key as keyof PerformanceMetrics] === 'number') {
        averages[key as keyof PerformanceMetrics] = 
          averages[key as keyof PerformanceMetrics] / this.metrics.length;
      }
    });

    return {
      averages,
      latest: this.metrics[this.metrics.length - 1],
      count: this.metrics.length
    };
  }

  /**
   * Clean up old metrics
   */
  private static cleanup(): void {
    const cutoff = Date.now() - PERFORMANCE_CONFIG.CACHE_TTL;
    this.metrics = this.metrics.filter(metric => 
      (metric as any).timestamp > cutoff
    );
  }
}

// ================ BUNDLE OPTIMIZATION ================

/**
 * Dynamic import utility with error handling
 */
export const dynamicImport = async <T>(
  importFn: () => Promise<T>,
  fallback?: T
): Promise<T> => {
  try {
    return await importFn();
  } catch (error) {
    console.error('Dynamic import failed:', error);
    if (fallback) return fallback;
    throw error;
  }
};

/**
 * Code splitting utility for routes
 */
export const createAsyncRoute = (importFn: () => Promise<any>) => {
  return lazy(() =>
    importFn().catch(err => {
      console.error('Route loading failed:', err);
      return { default: () => <div>Failed to load component</div> };
    })
  );
};

// ================ MEMORY OPTIMIZATION ================

/**
 * Memory-efficient component hook
 */
export const useMemoryOptimized = <T>(
  factory: () => T,
  deps: React.DependencyList
): T => {
  return useMemo(factory, deps);
};

/**
 * Optimized event handler hook
 */
export const useOptimizedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T => {
  return useCallback(callback, deps);
};

/**
 * Component performance wrapper
 */
export const withPerformanceTracking = <P extends ComponentBaseProps>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) => {
  return memo((props: P) => {
    useEffect(() => {
      const startTime = performance.now();
      
      return () => {
        const endTime = performance.now();
        const renderTime = endTime - startTime;
        
        PerformanceMonitor.recordMetrics({
          pageLoadTime: renderTime,
          component: componentName
        } as any);
      };
    }, []);

    return <WrappedComponent {...props} />;
  });
};

// ================ SERVICE WORKER UTILITIES ================

/**
 * Service worker registration with cache management
 */
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content available
              showUpdateNotification();
            }
          });
        }
      });

      return registration;
    } catch (error) {
      console.error('Service worker registration failed:', error);
      return null;
    }
  }
  return null;
};

/**
 * Show update notification
 */
const showUpdateNotification = (): void => {
  // In production, this would show a user-friendly update notification
  console.log('New app version available');
};

// ================ EXPORT ALL UTILITIES ================

export default {
  PERFORMANCE_CONFIG,
  createLazyComponent,
  OptimizedImage,
  PerformanceMonitor,
  dynamicImport,
  createAsyncRoute,
  useMemoryOptimized,
  useOptimizedCallback,
  withPerformanceTracking,
  registerServiceWorker
};

export {
  PERFORMANCE_CONFIG,
  createLazyComponent,
  OptimizedImage,
  PerformanceMonitor,
  dynamicImport,
  createAsyncRoute,
  useMemoryOptimized,
  useOptimizedCallback,
  withPerformanceTracking,
  registerServiceWorker
};
