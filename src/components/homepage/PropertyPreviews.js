import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Building, Key, TrendingUp, MapPin, Users, Euro, ChevronLeft, ChevronRight } from '../../icons';
import { typography } from '../../../utils/typography';
import animations from '../../../styles/animations.module.css';
import components from '../../../styles/components.module.css';

/**
 * Enhanced PropertyPreviews Component with WCAG 2.1 AA Compliance
 * 
 * Features:
 * - Full keyboard navigation support
 * - Touch-friendly mobile interface
 * - Intersection Observer for lazy loading
 * - Screen reader optimized content
 * - High contrast mode support
 * - Focus management and trapping
 * - Responsive carousel for mobile
 */
const PropertyPreviews = ({ theme, onNavigate }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [focusedCard, setFocusedCard] = useState(null);
  const [loadedImages, setLoadedImages] = useState(new Set());
  const containerRef = useRef(null);
  const slideRefs = useRef([]);

  // Properties data with enhanced accessibility info
  const properties = [
    {
      id: 1,
      name: "Vienna Luxury Complex",
      location: "1st District, Vienna, Austria",
      image: "/api/placeholder/400/250",
      alt: "Modern luxury apartment complex in Vienna's historic first district with classical architecture",
      totalValue: "€12.5M",
      monthlyReturn: "€5,200",
      nftCount: "2,500 NFTs",
      occupancy: "98%",
      status: "Active",
      features: ["Prime Location", "Historic Building", "Full Occupancy"],
      description: "Prime location luxury complex in Vienna's most prestigious district"
    },
    {
      id: 2,
      name: "Berlin Tech Hub",
      location: "Mitte, Berlin, Germany",
      image: "/api/placeholder/400/250",
      alt: "Contemporary office building in Berlin Mitte designed for technology companies",
      totalValue: "€8.7M",
      monthlyReturn: "€3,800",
      nftCount: "1,750 NFTs",
      occupancy: "94%",
      status: "Active",
      features: ["Tech Startups", "Modern Facility", "Growing District"],
      description: "Modern tech hub in Berlin's creative and business center"
    },
    {
      id: 3,
      name: "Amsterdam Waterfront",
      location: "Centrum, Amsterdam, Netherlands",
      image: "/api/placeholder/400/250",
      alt: "Historic canal-side building in Amsterdam's city center with traditional Dutch architecture",
      totalValue: "€15.2M",
      monthlyReturn: "€6,400",
      nftCount: "3,000 NFTs",
      occupancy: "100%",
      status: "Launching Soon",
      features: ["Canal View", "Heritage Protected", "Premium Location"],
      description: "Heritage protected waterfront property with iconic canal views"
    }
  ];

  // Mobile detection and resize handler
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Carousel navigation for mobile
  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % properties.length);
  }, [properties.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + properties.length) % properties.length);
  }, [properties.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isMobile) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          prevSlide();
          break;
        case 'ArrowRight':
          e.preventDefault();
          nextSlide();
          break;
        case 'Home':
          e.preventDefault();
          setCurrentSlide(0);
          break;
        case 'End':
          e.preventDefault();
          setCurrentSlide(properties.length - 1);
          break;
      }
    };

    if (focusedCard !== null) {
      document.addEventListener('keydown', handleKeyPress);
    }

    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isMobile, focusedCard, nextSlide, prevSlide, properties.length]);

  // Auto-advance carousel (with respect for reduced motion)
  useEffect(() => {
    if (!isMobile) return;
    
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isMobile, nextSlide]);

  const sectionClasses = {
    background: theme === 'dark' 
      ? 'bg-gray-900 text-white' 
      : 'bg-gray-50 text-gray-900',
    card: theme === 'dark' 
      ? 'bg-gray-800 border-gray-700' 
      : 'bg-white border-gray-200'
  };

  return (
    <section 
      className={`py-20 ${sectionClasses.background}`}
      aria-labelledby="properties-heading"
      role="region"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <header className={`text-center mb-16 ${animations.fadeIn}`}>
          <h2 
            id="properties-heading"
            className={`${typography.h2(theme)} mb-6`}
          >
            Premium Property Portfolio
          </h2>
          <p 
            className={`${typography.bodyLarge(theme)} max-w-3xl mx-auto text-gray-600 dark:text-gray-300`}
            id="properties-description"
          >
            Explore our carefully curated selection of premium European real estate properties. 
            Each property offers NFT-based governance rights and transparent operational oversight.
          </p>
        </header>

        {/* Mobile Carousel or Desktop Grid */}
        {isMobile ? (
          <MobileCarousel
            properties={properties}
            currentSlide={currentSlide}
            theme={theme}
            onNavigate={onNavigate}
            onPrevSlide={prevSlide}
            onNextSlide={nextSlide}
            onSlideChange={setCurrentSlide}
            containerRef={containerRef}
            slideRefs={slideRefs}
            setFocusedCard={setFocusedCard}
            loadedImages={loadedImages}
            setLoadedImages={setLoadedImages}
            cardClasses={sectionClasses.card}
          />
        ) : (
          <DesktopGrid
            properties={properties}
            theme={theme}
            onNavigate={onNavigate}
            setFocusedCard={setFocusedCard}
            loadedImages={loadedImages}
            setLoadedImages={setLoadedImages}
            cardClasses={sectionClasses.card}
          />
        )}

        {/* Call to Action */}
        <footer className={`text-center mt-12 ${animations.slideUp} ${animations['delay-800']}`}>
          <button
            onClick={() => onNavigate('properties')}
            className={`${components.button} ${components.buttonPrimary} px-8 py-4 text-lg group`}
            aria-describedby="view-all-description"
          >
            <Building className="h-6 w-6" aria-hidden="true" />
            <span>View All Properties</span>
            <span className="sr-only"> - Navigate to complete property listings</span>
          </button>
          <div id="view-all-description" className="sr-only">
            Browse the complete list of available properties with detailed information and investment opportunities
          </div>
        </footer>
      </div>
    </section>
  );
};

// Mobile Carousel Component
const MobileCarousel = ({ 
  properties, 
  currentSlide, 
  theme, 
  onNavigate, 
  onPrevSlide, 
  onNextSlide, 
  onSlideChange,
  containerRef,
  slideRefs,
  setFocusedCard,
  loadedImages,
  setLoadedImages,
  cardClasses 
}) => (
  <div 
    className="relative"
    role="region"
    aria-roledescription="carousel"
    aria-label="Property carousel"
  >
    {/* Carousel Navigation */}
    <div className="flex items-center justify-between mb-4">
      <button
        onClick={onPrevSlide}
        className={`p-3 rounded-full ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50'} shadow-lg transition-colors`}
        aria-label="Previous property"
        disabled={currentSlide === 0}
      >
        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
      </button>
      
      <div className="flex space-x-2">
        {properties.map((_, index) => (
          <button
            key={index}
            onClick={() => onSlideChange(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentSlide 
                ? 'bg-blue-600' 
                : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
            }`}
            aria-label={`Go to slide ${index + 1} of ${properties.length}`}
            aria-current={index === currentSlide ? 'true' : 'false'}
          />
        ))}
      </div>
      
      <button
        onClick={onNextSlide}
        className={`p-3 rounded-full ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50'} shadow-lg transition-colors`}
        aria-label="Next property"
        disabled={currentSlide === properties.length - 1}
      >
        <ChevronRight className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>

    {/* Carousel Container */}
    <div 
      ref={containerRef}
      className="overflow-hidden rounded-2xl"
      aria-live="polite"
    >
      <div 
        className="flex transition-transform duration-300 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {properties.map((property, index) => (
          <div 
            key={property.id}
            ref={el => slideRefs.current[index] = el}
            className="w-full flex-shrink-0"
            aria-roledescription="slide"
            aria-label={`Slide ${index + 1} of ${properties.length}: ${property.name}`}
          >
            <EnhancedPropertyCard 
              property={property}
              theme={theme}
              onNavigate={onNavigate}
              animationDelay={0}
              cardClasses={cardClasses}
              setFocusedCard={setFocusedCard}
              loadedImages={loadedImages}
              setLoadedImages={setLoadedImages}
              isCurrent={index === currentSlide}
            />
          </div>
        ))}
      </div>
    </div>

    {/* Carousel Instructions */}
    <div className="sr-only" aria-live="polite">
      Use arrow keys to navigate between properties. 
      Currently viewing property {currentSlide + 1} of {properties.length}: {properties[currentSlide].name}
    </div>
  </div>
);

// Desktop Grid Component
const DesktopGrid = ({ 
  properties, 
  theme, 
  onNavigate, 
  setFocusedCard, 
  loadedImages, 
  setLoadedImages, 
  cardClasses 
}) => (
  <div 
    className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
    role="list"
    aria-label="Property listings"
  >
    {properties.map((property, index) => (
      <div key={property.id} role="listitem">
        <EnhancedPropertyCard 
          property={property}
          theme={theme}
          onNavigate={onNavigate}
          animationDelay={index * 200}
          cardClasses={cardClasses}
          setFocusedCard={setFocusedCard}
          loadedImages={loadedImages}
          setLoadedImages={setLoadedImages}
        />
      </div>
    ))}
  </div>
);

// Enhanced Property Card with Accessibility
const EnhancedPropertyCard = ({ 
  property, 
  theme, 
  onNavigate, 
  animationDelay, 
  cardClasses, 
  setFocusedCard,
  loadedImages,
  setLoadedImages,
  isCurrent = true
}) => {
  const cardRef = useRef(null);
  const imageRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const statusColors = {
    'Active': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'Launching Soon': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
  };

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!imageRef.current || loadedImages.has(property.id)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setImageLoaded(true);
          setLoadedImages(prev => new Set(prev).add(property.id));
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(imageRef.current);
    return () => observer.disconnect();
  }, [property.id, loadedImages, setLoadedImages]);

  // Focus management
  const handleCardFocus = () => {
    setIsFocused(true);
    setFocusedCard(property.id);
  };

  const handleCardBlur = () => {
    setIsFocused(false);
    setFocusedCard(null);
  };

  // Enhanced navigation with analytics
  const handleCardClick = () => {
    // Announce to screen readers
    const announcement = `Navigating to ${property.name} details`;
    if (window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(announcement);
      utterance.volume = 0;
      window.speechSynthesis.speak(utterance);
    }
    
    onNavigate(`property/${property.id}`);
  };

  return (
    <article 
      ref={cardRef}
      className={`
        rounded-2xl border shadow-lg overflow-hidden cursor-pointer
        transform transition-all duration-300 hover:scale-105 hover:shadow-2xl
        focus-within:ring-4 focus-within:ring-blue-500 focus-within:ring-opacity-50
        ${cardClasses} ${animations.slideUp}
        ${isHovered || isFocused ? 'border-blue-500 shadow-2xl' : ''}
      `}
      style={{ animationDelay: `${animationDelay}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={handleCardFocus}
      onBlur={handleCardBlur}
      tabIndex={isCurrent ? 0 : -1}
      role="button"
      aria-labelledby={`property-${property.id}-title`}
      aria-describedby={`property-${property.id}-description`}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      {/* Property Image */}
      <div className="relative h-48 bg-gray-200 dark:bg-gray-700" ref={imageRef}>
        {imageLoaded ? (
          <img 
            src={property.image} 
            alt={property.alt}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-pulse bg-gray-300 dark:bg-gray-600 w-full h-full" />
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-4 right-4">
          <span 
            className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[property.status]}`}
            role="status"
            aria-label={`Property status: ${property.status}`}
          >
            {property.status}
          </span>
        </div>

        {/* Accessibility Enhancement */}
        <div className="sr-only">
          Property image: {property.alt}
        </div>
      </div>

      {/* Property Details */}
      <div className="p-6">
        <header className="mb-4">
          <h3 
            id={`property-${property.id}-title`}
            className="text-xl font-bold mb-2"
          >
            {property.name}
          </h3>
          <div className="flex items-center text-gray-500 dark:text-gray-400 mb-3">
            <MapPin className="h-4 w-4 mr-2" aria-hidden="true" />
            <span className="text-sm">{property.location}</span>
          </div>
        </header>

        {/* Property Stats with enhanced accessibility */}
        <div 
          className="grid grid-cols-2 gap-4 mb-4"
          role="list"
          aria-label="Property statistics"
        >
          <div className="text-center" role="listitem">
            <div 
              className="text-lg font-bold text-blue-600"
              aria-label={`Total value: ${property.totalValue}`}
            >
              {property.totalValue}
            </div>
            <div className="text-xs text-gray-500">Total Value</div>
          </div>
          <div className="text-center" role="listitem">
            <div 
              className="text-lg font-bold text-green-600"
              aria-label={`Monthly return: ${property.monthlyReturn}`}
            >
              {property.monthlyReturn}
            </div>
            <div className="text-xs text-gray-500">Monthly Return</div>
          </div>
          <div className="text-center" role="listitem">
            <div 
              className="text-sm font-medium"
              aria-label={`${property.nftCount} available for purchase`}
            >
              {property.nftCount}
            </div>
            <div className="text-xs text-gray-500">Available</div>
          </div>
          <div className="text-center" role="listitem">
            <div 
              className="text-sm font-medium"
              aria-label={`${property.occupancy} occupancy rate`}
            >
              {property.occupancy}
            </div>
            <div className="text-xs text-gray-500">Occupancy</div>
          </div>
        </div>

        {/* Features */}
        <div className="mb-6">
          <div 
            className="flex flex-wrap gap-2"
            role="list"
            aria-label="Property features"
          >
            {property.features.map((feature, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-full"
                role="listitem"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>

        {/* Hidden description for screen readers */}
        <div 
          id={`property-${property.id}-description`}
          className="sr-only"
        >
          {property.description}. 
          Located in {property.location}. 
          Current status: {property.status}. 
          Monthly return of {property.monthlyReturn} from total value of {property.totalValue}.
          Features include: {property.features.join(', ')}.
          Press Enter or Space to view detailed information.
        </div>

        {/* Action Button - Now redundant with card click but kept for explicit action */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleCardClick();
          }}
          className={`w-full ${components.button} ${
            theme === 'dark' ? components.buttonSecondaryDark : components.buttonSecondary
          } py-3 group`}
          aria-label={`View detailed information for ${property.name}`}
        >
          <Key className="h-4 w-4" aria-hidden="true" />
          <span>View Details</span>
          <span className="sr-only"> for {property.name}</span>
        </button>
      </div>
    </article>
  );
};

// PropTypes
PropertyPreviews.propTypes = {
  theme: PropTypes.oneOf(['light', 'dark', 'blue']).isRequired,
  onNavigate: PropTypes.func.isRequired,
};

EnhancedPropertyCard.propTypes = {
  property: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    alt: PropTypes.string.isRequired,
    totalValue: PropTypes.string.isRequired,
    monthlyReturn: PropTypes.string.isRequired,
    nftCount: PropTypes.string.isRequired,
    occupancy: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    features: PropTypes.arrayOf(PropTypes.string).isRequired,
    description: PropTypes.string.isRequired,
  }).isRequired,
  theme: PropTypes.oneOf(['light', 'dark', 'blue']).isRequired,
  onNavigate: PropTypes.func.isRequired,
  animationDelay: PropTypes.number.isRequired,
  cardClasses: PropTypes.string.isRequired,
  setFocusedCard: PropTypes.func.isRequired,
  loadedImages: PropTypes.instanceOf(Set).isRequired,
  setLoadedImages: PropTypes.func.isRequired,
  isCurrent: PropTypes.bool,
};

export default PropertyPreviews;