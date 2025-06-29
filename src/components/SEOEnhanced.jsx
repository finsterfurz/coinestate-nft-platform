// Advanced SEO & Accessibility Implementation
import React from 'react';
import { Helmet } from 'react-helmet-async';

// Enhanced SEO Component with Schema.org Markup
export const SEOEnhanced = ({ 
  title,
  description,
  canonicalUrl,
  ogImage,
  structuredData,
  breadcrumbs,
  publishDate,
  modifiedDate,
  author,
  type = 'website'
}) => {
  const baseUrl = 'https://coinestate.io';
  const fullTitle = title ? `${title} | CoinEstate NFT Platform` : 'CoinEstate NFT Platform - Governance-Based Real Estate';
  const fullDescription = description || 'Community governance platform for real estate management with NFT voting credentials under Cayman Islands regulatory framework.';
  const fullCanonicalUrl = canonicalUrl || window.location.href;
  const fullOgImage = ogImage || `${baseUrl}/images/og-default.jpg`;

  // Generate comprehensive structured data
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "CoinEstate Foundation",
    "url": baseUrl,
    "logo": `${baseUrl}/images/logo.png`,
    "foundingDate": "2025",
    "foundingLocation": {
      "@type": "Place",
      "name": "George Town, Cayman Islands"
    },
    "description": "Regulated real estate governance platform operating under Cayman Islands law",
    "sameAs": [
      "https://twitter.com/coinestate",
      "https://linkedin.com/company/coinestate",
      "https://medium.com/@coinestate"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-345-XXX-XXXX",
      "contactType": "customer service",
      "email": "info@coinestate.io"
    }
  };

  const webApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "CoinEstate NFT Platform",
    "url": baseUrl,
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Web Browser",
    "description": fullDescription,
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "description": "Free platform access for verified users"
    },
    "creator": {
      "@type": "Organization",
      "name": "CoinEstate Foundation"
    }
  };

  // Property-specific schema (for property pages)
  const propertySchema = structuredData?.property ? {
    "@context": "https://schema.org",
    "@type": "RealEstateProperty",
    "name": structuredData.property.name,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": structuredData.property.address.street,
      "addressLocality": structuredData.property.address.city,
      "addressCountry": structuredData.property.address.country
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": structuredData.property.coordinates?.lat,
      "longitude": structuredData.property.coordinates?.lng
    },
    "floorSize": {
      "@type": "QuantitativeValue",
      "value": structuredData.property.squareFootage,
      "unitCode": "FTK"
    },
    "numberOfRooms": structuredData.property.rooms,
    "yearBuilt": structuredData.property.yearBuilt,
    "propertyID": structuredData.property.id,
    "priceRange": structuredData.property.priceRange
  } : null;

  // Governance schema (for governance pages)
  const governanceSchema = structuredData?.governance ? {
    "@context": "https://schema.org",
    "@type": "GovernmentService",
    "name": "CoinEstate Governance System",
    "description": "Decentralized governance for real estate management through NFT voting",
    "provider": {
      "@type": "Organization", 
      "name": "CoinEstate Foundation"
    },
    "serviceType": "Governance Platform",
    "areaServed": "Global",
    "availableChannel": {
      "@type": "ServiceChannel",
      "serviceUrl": `${baseUrl}/governance`,
      "serviceName": "Web Platform"
    }
  } : null;

  // Breadcrumb schema
  const breadcrumbSchema = breadcrumbs ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": `${baseUrl}${crumb.path}`
    }))
  } : null;

  // Combine all schemas
  const allSchemas = [
    organizationSchema,
    webApplicationSchema,
    propertySchema,
    governanceSchema,
    breadcrumbSchema,
    ...(structuredData?.custom || [])
  ].filter(Boolean);

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      <link rel="canonical" href={fullCanonicalUrl} />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullCanonicalUrl} />
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="CoinEstate NFT Platform" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@coinestate" />
      <meta name="twitter:creator" content="@coinestate" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={fullOgImage} />
      
      {/* Additional SEO Meta Tags */}
      <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      
      {/* Content Meta Tags */}
      {author && <meta name="author" content={author} />}
      {publishDate && <meta property="article:published_time" content={publishDate} />}
      {modifiedDate && <meta property="article:modified_time" content={modifiedDate} />}
      
      {/* Business-Specific Meta Tags */}
      <meta name="geo.region" content="KY" />
      <meta name="geo.placename" content="George Town, Cayman Islands" />
      <meta name="geo.position" content="19.3133;-81.2546" />
      <meta name="ICBM" content="19.3133, -81.2546" />
      
      {/* Security & Privacy Meta Tags */}
      <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https: wss:;" />
      <meta name="referrer" content="strict-origin-when-cross-origin" />
      
      {/* Mobile & App Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="CoinEstate" />
      <meta name="theme-color" content="#1a1a1a" />
      <meta name="msapplication-TileColor" content="#1a1a1a" />
      
      {/* Structured Data */}
      {allSchemas.map((schema, index) => (
        <script 
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      
      {/* Preconnect for Performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://api.coinestate.io" />
      
      {/* Resource Hints */}
      <link rel="dns-prefetch" href="//cdn.jsdelivr.net" />
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//ethereum.org" />
      
      {/* Favicon and Icons */}
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <link rel="icon" type="image/png" href="/favicon.png" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/manifest.json" />
    </Helmet>
  );
};

// Accessibility Enhancement Hook
export const useAccessibility = () => {
  const [announcements, setAnnouncements] = React.useState([]);
  
  // Screen reader announcements
  const announce = (message, priority = 'polite') => {
    const id = Date.now();
    const announcement = { id, message, priority };
    
    setAnnouncements(prev => [...prev, announcement]);
    
    // Remove announcement after it's been read
    setTimeout(() => {
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    }, 1000);
  };

  // Focus management
  const focusElement = (selector) => {
    const element = document.querySelector(selector);
    if (element) {
      element.focus();
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Skip to content functionality
  const skipToMain = () => {
    focusElement('#main-content');
    announce('Skipped to main content');
  };

  // Keyboard trap for modals
  const trapFocus = (containerSelector) => {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    
    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  };

  return {
    announce,
    focusElement,
    skipToMain,
    trapFocus,
    announcements
  };
};

// Accessibility Testing Component
export const AccessibilityTester = ({ children }) => {
  const [violations, setViolations] = React.useState([]);
  const [isChecking, setIsChecking] = React.useState(false);
  
  const runAccessibilityCheck = async () => {
    if (process.env.NODE_ENV !== 'development') return;
    
    setIsChecking(true);
    
    try {
      const axe = await import('axe-core');
      const results = await axe.run(document.body, {
        rules: {
          'color-contrast': { enabled: true },
          'keyboard-navigation': { enabled: true },
          'focus-management': { enabled: true },
          'aria-roles': { enabled: true },
          'alt-text': { enabled: true },
          'heading-hierarchy': { enabled: true },
          'landmark-roles': { enabled: true }
        }
      });
      
      setViolations(results.violations);
      
      if (results.violations.length > 0) {
        console.group('🚨 Accessibility Violations Found:');
        results.violations.forEach(violation => {
          console.error(`${violation.impact}: ${violation.description}`);
          console.log('Elements:', violation.nodes.map(node => node.target));
          console.log('Help:', violation.helpUrl);
        });
        console.groupEnd();
      } else {
        console.log('✅ No accessibility violations found!');
      }
    } catch (error) {
      console.error('Accessibility check failed:', error);
    } finally {
      setIsChecking(false);
    }
  };

  React.useEffect(() => {
    // Only run in development
    if (process.env.NODE_ENV === 'development') {
      const timer = setTimeout(runAccessibilityCheck, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <>
      {children}
      
      {/* Development-only accessibility panel */}
      {process.env.NODE_ENV === 'development' && (
        <div 
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            backgroundColor: violations.length > 0 ? '#ff4444' : '#44ff44',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            fontSize: '12px',
            zIndex: 9999,
            cursor: 'pointer'
          }}
          onClick={runAccessibilityCheck}
          title={`${violations.length} accessibility issues found. Click to recheck.`}
        >
          A11y: {isChecking ? '🔄' : violations.length > 0 ? `❌ ${violations.length}` : '✅ 0'}
        </div>
      )}
    </>
  );
};

// Live Region for Screen Reader Announcements
export const LiveRegion = ({ announcements }) => (
  <div className="sr-only">
    {announcements.map(({ id, message, priority }) => (
      <div
        key={id}
        aria-live={priority}
        aria-atomic="true"
      >
        {message}
      </div>
    ))}
  </div>
);

// Skip Link Component
export const SkipLink = () => (
  <a
    href="#main-content"
    className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:bg-blue-600 focus:text-white focus:p-2 focus:z-50"
    onClick={(e) => {
      e.preventDefault();
      document.getElementById('main-content')?.focus();
    }}
  >
    Skip to main content
  </a>
);

// Screen reader only CSS class utility
export const srOnlyStyles = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: '0',
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: '0'
};

// High contrast mode detection
export const useHighContrast = () => {
  const [isHighContrast, setIsHighContrast] = React.useState(false);
  
  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setIsHighContrast(mediaQuery.matches);
    
    const handler = (e) => setIsHighContrast(e.matches);
    mediaQuery.addEventListener('change', handler);
    
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);
  
  return isHighContrast;
};

// Reduced motion preference detection
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);
  
  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);
  
  return prefersReducedMotion;
};

export default SEOEnhanced;
