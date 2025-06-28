import React, { Suspense, lazy } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet-async';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorBoundary from '../ErrorBoundary';

// Lazy load homepage sections for better performance
const HeroSection = lazy(() => import('./HeroSection'));
const StatsSection = lazy(() => import('./StatsSection'));
const PropertyPreviews = lazy(() => import('./PropertyPreviews'));
const TestimonialsSection = lazy(() => import('./TestimonialsSection'));
const CTASection = lazy(() => import('./CTASection'));

// Lightweight loading skeleton for individual sections
const SectionSkeleton = ({ height = 'h-96' }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg ${height} w-full`}>
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  </div>
);

SectionSkeleton.propTypes = {
  height: PropTypes.string
};

// Section wrapper with error boundary and suspense
const LazySection = ({ children, fallback = <SectionSkeleton /> }) => (
  <ErrorBoundary>
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  </ErrorBoundary>
);

LazySection.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node
};

/**
 * Enhanced Homepage Component with Lazy Loading and Accessibility
 * 
 * Features:
 * - Lazy-loaded sections for optimal performance
 * - Comprehensive SEO meta tags
 * - Accessibility improvements (skip navigation, focus management)
 * - Progressive loading with skeleton placeholders
 * - Error boundaries for section resilience
 */
const Homepage = ({ theme = 'dark' }) => {
  const handleNavigate = (route) => {
    // Enhanced navigation with analytics tracking
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: `Navigate to ${route}`,
        page_location: window.location.href,
        custom_parameter: route
      });
    }
    
    // Use React Router navigation
    window.location.href = `/${route}`;
  };

  return (
    <>
      {/* SEO and Meta Tags */}
      <Helmet>
        <title>CoinEstate NFT - Premium Real Estate Governance Platform | Cayman Islands</title>
        <meta 
          name="description" 
          content="Join exclusive real estate governance community. NFT-based voting rights on premium European properties under Cayman Islands regulation. KYC-verified access to property decisions." 
        />
        <meta 
          name="keywords" 
          content="real estate NFT, governance tokens, property investment, blockchain voting, Cayman Islands, KYC verified, European real estate" 
        />
        
        {/* Open Graph */}
        <meta property="og:title" content="CoinEstate NFT - Premium Real Estate Governance" />
        <meta property="og:description" content="Exclusive NFT-based governance for premium European real estate. Join our KYC-verified community." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://coinestate.io" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="CoinEstate NFT - Real Estate Governance" />
        <meta name="twitter:description" content="Exclusive NFT governance for premium European real estate properties." />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "CoinEstate NFT Platform Homepage",
            "description": "Premium real estate governance platform with NFT-based voting rights",
            "url": "https://coinestate.io",
            "mainEntity": {
              "@type": "Organization",
              "name": "CoinEstate Foundation",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "KY",
                "addressLocality": "George Town"
              }
            }
          })}
        </script>
      </Helmet>

      {/* Skip to main content for accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 bg-blue-600 text-white px-4 py-2 rounded-md transition-all"
        aria-label="Skip to main content"
      >
        Skip to main content
      </a>

      {/* Main content wrapper */}
      <main 
        id="main-content" 
        className="min-h-screen"
        role="main"
        aria-label="Homepage content"
      >
        {/* Hero Section */}
        <section 
          aria-labelledby="hero-heading"
          className="homepage-section"
        >
          <LazySection fallback={<SectionSkeleton height="h-screen" />}>
            <HeroSection 
              theme={theme} 
              onNavigate={handleNavigate}
              aria-describedby="hero-description" 
            />
          </LazySection>
        </section>

        {/* Stats Section */}
        <section 
          aria-labelledby="stats-heading"
          className="homepage-section"
        >
          <LazySection fallback={<SectionSkeleton height="h-64" />}>
            <StatsSection 
              theme={theme}
              aria-describedby="platform-statistics" 
            />
          </LazySection>
        </section>

        {/* Property Previews Section */}
        <section 
          aria-labelledby="properties-heading"
          className="homepage-section"
        >
          <LazySection fallback={<SectionSkeleton height="h-96" />}>
            <PropertyPreviews 
              theme={theme} 
              onNavigate={handleNavigate}
              aria-describedby="available-properties" 
            />
          </LazySection>
        </section>

        {/* Testimonials Section */}
        <section 
          aria-labelledby="testimonials-heading"
          className="homepage-section"
        >
          <LazySection fallback={<SectionSkeleton height="h-80" />}>
            <TestimonialsSection 
              theme={theme}
              aria-describedby="user-testimonials" 
            />
          </LazySection>
        </section>

        {/* Call to Action Section */}
        <section 
          aria-labelledby="cta-heading"
          className="homepage-section"
        >
          <LazySection fallback={<SectionSkeleton height="h-64" />}>
            <CTASection 
              theme={theme} 
              onNavigate={handleNavigate}
              aria-describedby="get-started-action" 
            />
          </LazySection>
        </section>
      </main>

      {/* Page loading progress indicator */}
      <div 
        className="fixed top-0 left-0 w-full h-1 bg-blue-600 transform origin-left z-50"
        style={{
          transform: 'scaleX(1)',
          transition: 'transform 0.3s ease-out'
        }}
        aria-hidden="true"
      />
    </>
  );
};

Homepage.propTypes = {
  theme: PropTypes.oneOf(['light', 'dark', 'blue']),
};

Homepage.defaultProps = {
  theme: 'dark',
};

export default Homepage;
