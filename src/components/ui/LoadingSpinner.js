/**
 * Loading Spinner Component
 * Accessible loading states with different sizes and styles
 */

import React from 'react';
import PropTypes from 'prop-types';
import animations from '../../styles/animations.module.css';

const LoadingSpinner = ({ 
  size = 'medium', 
  color = 'blue', 
  text = null,
  className = '',
  fullScreen = false,
  ariaLabel = 'Loading content, please wait'
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
    xlarge: 'w-16 h-16'
  };

  const colorClasses = {
    blue: 'border-blue-600',
    white: 'border-white',
    gray: 'border-gray-600',
    green: 'border-green-600',
    purple: 'border-purple-600'
  };

  const spinnerElement = (
    <div 
      className={`
        ${sizeClasses[size]} 
        border-4 border-solid rounded-full 
        ${colorClasses[color]} 
        border-t-transparent 
        ${animations.spin}
        ${className}
      `}
      role="status"
      aria-label={ariaLabel}
      aria-live="polite"
    >
      <span className="sr-only">{ariaLabel}</span>
    </div>
  );

  const content = (
    <div className={`flex flex-col items-center justify-center space-y-3 ${
      fullScreen ? 'min-h-screen' : ''
    }`}>
      {spinnerElement}
      {text && (
        <p className={`text-sm font-medium ${
          color === 'white' ? 'text-white' : 'text-gray-600 dark:text-gray-400'
        }`}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div 
        className="fixed inset-0 bg-white dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 backdrop-blur-sm z-50 flex items-center justify-center"
        role="dialog"
        aria-modal="true"
        aria-labelledby="loading-title"
      >
        <div id="loading-title" className="sr-only">
          {ariaLabel}
        </div>
        {content}
      </div>
    );
  }

  return content;
};

/**
 * Skeleton Loading Component for Content Placeholders
 */
export const SkeletonLoader = ({ 
  lines = 3, 
  height = 'h-4', 
  className = '',
  animate = true 
}) => {
  return (
    <div className={`space-y-3 ${className}`} role="status" aria-label="Loading content">
      {[...Array(lines)].map((_, index) => (
        <div 
          key={index}
          className={`
            ${height} 
            bg-gray-200 dark:bg-gray-700 
            rounded 
            ${animate ? animations.pulse : ''}
            ${index === lines - 1 ? 'w-3/4' : 'w-full'}
          `}
        />
      ))}
      <span className="sr-only">Loading content, please wait</span>
    </div>
  );
};

/**
 * Button Loading State Component
 */
export const ButtonLoader = ({ 
  size = 'small',
  color = 'white',
  className = ''
}) => (
  <LoadingSpinner 
    size={size} 
    color={color} 
    className={className}
    ariaLabel="Processing request"
  />
);

/**
 * Card Loading Placeholder
 */
export const CardSkeleton = ({ 
  showImage = true,
  showTitle = true,
  showDescription = true,
  className = ''
}) => (
  <div className={`border rounded-lg p-6 space-y-4 ${className}`} role="status">
    {showImage && (
      <div className={`h-48 bg-gray-200 dark:bg-gray-700 rounded ${animations.pulse}`} />
    )}
    {showTitle && (
      <div className={`h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 ${animations.pulse}`} />
    )}
    {showDescription && (
      <div className="space-y-2">
        <div className={`h-4 bg-gray-200 dark:bg-gray-700 rounded ${animations.pulse}`} />
        <div className={`h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 ${animations.pulse}`} />
      </div>
    )}
    <span className="sr-only">Loading card content</span>
  </div>
);

// PropTypes
LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large', 'xlarge']),
  color: PropTypes.oneOf(['blue', 'white', 'gray', 'green', 'purple']),
  text: PropTypes.string,
  className: PropTypes.string,
  fullScreen: PropTypes.bool,
  ariaLabel: PropTypes.string
};

SkeletonLoader.propTypes = {
  lines: PropTypes.number,
  height: PropTypes.string,
  className: PropTypes.string,
  animate: PropTypes.bool
};

ButtonLoader.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  color: PropTypes.oneOf(['blue', 'white', 'gray', 'green', 'purple']),
  className: PropTypes.string
};

CardSkeleton.propTypes = {
  showImage: PropTypes.bool,
  showTitle: PropTypes.bool,
  showDescription: PropTypes.bool,
  className: PropTypes.string
};

export default LoadingSpinner;