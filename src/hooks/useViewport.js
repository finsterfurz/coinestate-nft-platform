/**
 * Viewport Hook
 * Responsive design utilities with performance optimization
 */

import { useState, useEffect, useCallback } from 'react';

// Breakpoint definitions matching Tailwind CSS
const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
};

export const useViewport = () => {
  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    breakpoint: 'lg'
  });

  // Determine device type and breakpoint
  const getViewportInfo = useCallback((width, height) => {
    let breakpoint = 'sm';
    let isMobile = width < BREAKPOINTS.md;
    let isTablet = width >= BREAKPOINTS.md && width < BREAKPOINTS.lg;
    let isDesktop = width >= BREAKPOINTS.lg;

    // Determine current breakpoint
    if (width >= BREAKPOINTS['2xl']) breakpoint = '2xl';
    else if (width >= BREAKPOINTS.xl) breakpoint = 'xl';
    else if (width >= BREAKPOINTS.lg) breakpoint = 'lg';
    else if (width >= BREAKPOINTS.md) breakpoint = 'md';
    else breakpoint = 'sm';

    return {
      width,
      height,
      isMobile,
      isTablet,
      isDesktop,
      breakpoint
    };
  }, []);

  // Debounced resize handler for performance
  useEffect(() => {
    let timeoutId;
    
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const newViewport = getViewportInfo(window.innerWidth, window.innerHeight);
        setViewport(newViewport);
      }, 100); // 100ms debounce
    };

    // Set initial viewport
    const initialViewport = getViewportInfo(window.innerWidth, window.innerHeight);
    setViewport(initialViewport);

    // Add resize listener
    window.addEventListener('resize', handleResize, { passive: true });
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, [getViewportInfo]);

  // Helper functions
  const isBreakpoint = useCallback((breakpoint) => {
    return viewport.breakpoint === breakpoint;
  }, [viewport.breakpoint]);

  const isMinBreakpoint = useCallback((breakpoint) => {
    const currentIndex = Object.keys(BREAKPOINTS).indexOf(viewport.breakpoint);
    const targetIndex = Object.keys(BREAKPOINTS).indexOf(breakpoint);
    return currentIndex >= targetIndex;
  }, [viewport.breakpoint]);

  const isMaxBreakpoint = useCallback((breakpoint) => {
    const currentIndex = Object.keys(BREAKPOINTS).indexOf(viewport.breakpoint);
    const targetIndex = Object.keys(BREAKPOINTS).indexOf(breakpoint);
    return currentIndex <= targetIndex;
  }, [viewport.breakpoint]);

  return {
    ...viewport,
    isBreakpoint,
    isMinBreakpoint,
    isMaxBreakpoint,
    breakpoints: BREAKPOINTS
  };
};

/**
 * Media Query Hook
 * Custom hook for specific media queries
 */
export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handleChange = () => setMatches(mediaQuery.matches);
    
    // Set initial value
    setMatches(mediaQuery.matches);
    
    // Listen for changes
    if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
    } else {
      mediaQuery.addEventListener('change', handleChange);
    }
    
    // Cleanup
    return () => {
      if (mediaQuery.removeListener) {
        mediaQuery.removeListener(handleChange);
      } else {
        mediaQuery.removeEventListener('change', handleChange);
      }
    };
  }, [query]);

  return matches;
};

/**
 * Orientation Hook
 * Detects device orientation changes
 */
export const useOrientation = () => {
  const [orientation, setOrientation] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
    }
    return 'portrait';
  });

  useEffect(() => {
    const handleOrientationChange = () => {
      const newOrientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
      setOrientation(newOrientation);
    };

    // Initial check
    handleOrientationChange();

    // Listen for resize events (covers orientation changes)
    window.addEventListener('resize', handleOrientationChange, { passive: true });
    
    // Also listen for orientationchange if available
    if ('onorientationchange' in window) {
      window.addEventListener('orientationchange', () => {
        // Small delay to get accurate dimensions after orientation change
        setTimeout(handleOrientationChange, 100);
      }, { passive: true });
    }

    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      if ('onorientationchange' in window) {
        window.removeEventListener('orientationchange', handleOrientationChange);
      }
    };
  }, []);

  return {
    orientation,
    isPortrait: orientation === 'portrait',
    isLandscape: orientation === 'landscape'
  };
};

export default useViewport;