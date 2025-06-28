import React from 'react';
import PropTypes from 'prop-types';

/**
 * Enhanced Loading Spinner Component
 * 
 * Features:
 * - Accessible loading indicator with screen reader support
 * - Multiple size options for different use cases
 * - Customizable colors and animations
 * - Semantic HTML structure for assistive technologies
 * - Performance optimized with CSS animations
 */
const LoadingSpinner = ({ 
  size = 'medium', 
  color = 'blue', 
  text = 'Loading...',
  overlay = false,
  className = '',
  ariaLabel = 'Loading content'
}) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12',
    xlarge: 'h-16 w-16'
  };

  const colorClasses = {
    blue: 'border-blue-600',
    purple: 'border-purple-600',
    green: 'border-green-600',
    gray: 'border-gray-600',
    white: 'border-white'
  };

  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
    xlarge: 'text-xl'
  };

  const spinnerContent = (
    <div 
      className={`flex flex-col items-center justify-center space-y-3 ${className}`}
      role="status"
      aria-live="polite"
      aria-label={ariaLabel}
    >
      {/* Animated Spinner */}
      <div 
        className={`
          animate-spin rounded-full border-2 border-t-transparent 
          ${sizeClasses[size]} 
          ${colorClasses[color]}
        `}
        aria-hidden="true"
      />
      
      {/* Loading Text */}
      {text && (
        <span 
          className={`
            font-medium text-gray-600 dark:text-gray-300 
            ${textSizeClasses[size]}
          `}
          id="loading-text"
        >
          {text}
        </span>
      )}
      
      {/* Screen Reader Only Content */}
      <span className="sr-only">
        Please wait while content is loading. This may take a few moments.
      </span>
    </div>
  );

  // Overlay version for full-screen loading
  if (overlay) {
    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        role="dialog"
        aria-modal="true"
        aria-labelledby="loading-text"
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-2xl">
          {spinnerContent}
        </div>
      </div>
    );
  }

  return spinnerContent;
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large', 'xlarge']),
  color: PropTypes.oneOf(['blue', 'purple', 'green', 'gray', 'white']),
  text: PropTypes.string,
  overlay: PropTypes.bool,
  className: PropTypes.string,
  ariaLabel: PropTypes.string,
};

export default LoadingSpinner;

/**
 * Skeleton Loading Components for specific sections
 */
export const SectionSkeleton = ({ height = 'h-64', className = '' }) => (
  <div 
    className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg ${height} ${className}`}
    role="status"
    aria-label="Content loading"
  >
    <div className="flex items-center justify-center h-full">
      <LoadingSpinner size="medium" color="gray" text="" />
    </div>
  </div>
);

SectionSkeleton.propTypes = {
  height: PropTypes.string,
  className: PropTypes.string,
};

export const CardSkeleton = ({ className = '' }) => (
  <div 
    className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl p-6 ${className}`}
    role="status"
    aria-label="Card content loading"
  >
    <div className="space-y-4">
      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
    </div>
  </div>
);

CardSkeleton.propTypes = {
  className: PropTypes.string,
};

export const TextSkeleton = ({ lines = 3, className = '' }) => (
  <div className={`animate-pulse space-y-2 ${className}`} role="status" aria-label="Text loading">
    {Array.from({ length: lines }, (_, i) => (
      <div 
        key={i}
        className={`h-4 bg-gray-300 dark:bg-gray-600 rounded ${
          i === lines - 1 ? 'w-2/3' : 'w-full'
        }`}
      />
    ))}
  </div>
);

TextSkeleton.propTypes = {
  lines: PropTypes.number,
  className: PropTypes.string,
};
