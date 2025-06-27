import React from 'react';
import PropTypes from 'prop-types';
import components from '../../styles/components.module.css';
import animations from '../../styles/animations.module.css';

const LoadingSpinner = ({ size = 'medium', className = '', theme = 'light' }) => {
  const sizeClasses = {
    small: components.loadingSpinnerSmall,
    medium: components.loadingSpinnerMedium,
    large: components.loadingSpinnerLarge
  };

  const themeClasses = {
    light: 'border-blue-600 border-t-transparent',
    dark: 'border-blue-400 border-t-transparent',
    white: 'border-white border-t-transparent'
  };

  return (
    <div 
      className={`
        ${components.loadingSpinner} 
        ${sizeClasses[size]} 
        ${themeClasses[theme]}
        ${className}
      `}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

const LoadingCard = ({ theme = 'light', className = '' }) => {
  return (
    <div className={`
      ${components.card}
      ${theme === 'dark' ? components.cardDark : components.cardLight}
      p-6 ${className}
    `}>
      <div className={`${components.loadingPulse} h-4 bg-gray-300 rounded mb-4`}></div>
      <div className={`${components.loadingPulse} h-4 bg-gray-300 rounded w-3/4 mb-4`}></div>
      <div className={`${components.loadingPulse} h-8 bg-gray-300 rounded mb-2`}></div>
      <div className={`${components.loadingPulse} h-4 bg-gray-300 rounded w-1/2`}></div>
    </div>
  );
};

const LoadingSection = ({ theme = 'light', title = 'Loading content...', description }) => {
  return (
    <div className={`py-16 ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50/50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <LoadingSpinner size="large" theme={theme} className="mx-auto mb-6" />
          <h3 className={`text-2xl font-semibold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {title}
          </h3>
          {description && (
            <p className={`text-lg ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const LoadingButton = ({ 
  children, 
  isLoading = false, 
  disabled = false, 
  onClick,
  className = '',
  variant = 'primary',
  theme = 'light',
  ...props 
}) => {
  const buttonClass = {
    primary: components.buttonPrimary,
    secondary: theme === 'dark' ? components.buttonSecondaryDark : components.buttonSecondary,
    outline: theme === 'dark' ? components.buttonOutlineDark : components.buttonOutline
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        ${components.button}
        ${buttonClass[variant]}
        ${isLoading ? components.buttonLoading : ''}
        ${disabled ? components.buttonDisabled : ''}
        ${className}
      `}
      {...props}
    >
      {isLoading && (
        <LoadingSpinner 
          size="small" 
          theme={variant === 'primary' ? 'white' : theme} 
          className="mr-2" 
        />
      )}
      {children}
    </button>
  );
};

const SkeletonText = ({ lines = 3, className = '' }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`
            ${components.loadingPulse} 
            h-4 bg-gray-300 rounded
            ${index === lines - 1 ? 'w-3/4' : 'w-full'}
          `}
        />
      ))}
    </div>
  );
};

const SkeletonCard = ({ theme = 'light', className = '' }) => {
  return (
    <div className={`
      ${components.card}
      ${theme === 'dark' ? components.cardDark : components.cardLight}
      p-6 ${className}
    `}>
      {/* Header skeleton */}
      <div className="flex items-center space-x-3 mb-4">
        <div className={`${components.loadingPulse} w-12 h-12 bg-gray-300 rounded-full`}></div>
        <div className="flex-1">
          <div className={`${components.loadingPulse} h-4 bg-gray-300 rounded mb-2`}></div>
          <div className={`${components.loadingPulse} h-3 bg-gray-300 rounded w-1/2`}></div>
        </div>
      </div>
      
      {/* Content skeleton */}
      <SkeletonText lines={3} className="mb-4" />
      
      {/* Footer skeleton */}
      <div className="flex justify-between items-center">
        <div className={`${components.loadingPulse} h-8 w-20 bg-gray-300 rounded`}></div>
        <div className={`${components.loadingPulse} h-8 w-16 bg-gray-300 rounded`}></div>
      </div>
    </div>
  );
};

const PageLoading = ({ theme = 'light' }) => {
  return (
    <div className={`min-h-screen flex items-center justify-center ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-white'
    }`}>
      <div className="text-center">
        <div className={`${animations.bounceSubtle} mb-8`}>
          <LoadingSpinner size="large" theme={theme} />
        </div>
        <h2 className={`text-2xl font-semibold mb-4 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Loading CoinEstate Platform
        </h2>
        <p className={`text-lg ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Preparing your premium real estate dashboard...
        </p>
      </div>
    </div>
  );
};

// PropTypes
LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  className: PropTypes.string,
  theme: PropTypes.oneOf(['light', 'dark', 'white'])
};

LoadingCard.propTypes = {
  theme: PropTypes.oneOf(['light', 'dark']),
  className: PropTypes.string
};

LoadingSection.propTypes = {
  theme: PropTypes.oneOf(['light', 'dark']),
  title: PropTypes.string,
  description: PropTypes.string
};

LoadingButton.propTypes = {
  children: PropTypes.node.isRequired,
  isLoading: PropTypes.bool,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string,
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline']),
  theme: PropTypes.oneOf(['light', 'dark'])
};

SkeletonText.propTypes = {
  lines: PropTypes.number,
  className: PropTypes.string
};

SkeletonCard.propTypes = {
  theme: PropTypes.oneOf(['light', 'dark']),
  className: PropTypes.string
};

PageLoading.propTypes = {
  theme: PropTypes.oneOf(['light', 'dark'])
};

export {
  LoadingSpinner,
  LoadingCard,
  LoadingSection,
  LoadingButton,
  SkeletonText,
  SkeletonCard,
  PageLoading
};

export default LoadingSpinner;