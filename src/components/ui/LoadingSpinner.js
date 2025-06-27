import React from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../../context/ThemeContext';

/**
 * LoadingSpinner Component
 * 
 * A reusable loading spinner with multiple variants and themes.
 * Used for page loading, async operations, and component loading states.
 * 
 * @param {Object} props - Component props
 * @param {string} [props.size="medium"] - Spinner size: "small", "medium", "large", "xl"
 * @param {string} [props.variant="spinner"] - Spinner variant: "spinner", "dots", "pulse", "skeleton"
 * @param {string} [props.message] - Optional loading message
 * @param {boolean} [props.fullScreen=false] - Whether to show as full screen overlay
 * @param {string} [props.color] - Custom color override
 */
const LoadingSpinner = ({ 
  size = "medium", 
  variant = "spinner", 
  message, 
  fullScreen = false,
  color 
}) => {
  const { darkMode } = useTheme();
  
  // Size mappings
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
    xl: 'w-16 h-16'
  };
  
  // Color classes
  const colorClass = color || (darkMode 
    ? 'text-blue-400 fill-blue-600' 
    : 'text-blue-600 fill-blue-800'
  );
  
  const bgColorClass = darkMode ? 'bg-gray-800/90' : 'bg-white/90';
  
  // Spinner variants
  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`${sizeClasses[size]} rounded-full bg-current animate-pulse`}
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        );
      
      case 'pulse':
        return (
          <div className={`${sizeClasses[size]} rounded-full bg-current animate-ping`} />
        );
      
      case 'skeleton':
        return (
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-current rounded-full w-32" />
            <div className="h-4 bg-current rounded-full w-24" />
            <div className="h-4 bg-current rounded-full w-28" />
          </div>
        );
      
      case 'spinner':
      default:
        return (
          <svg
            className={`${sizeClasses[size]} animate-spin ${colorClass}`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            role="img"
            aria-label="Loading"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        );
    }
  };
  
  // Full screen overlay variant
  if (fullScreen) {
    return (
      <div 
        className={`fixed inset-0 z-50 flex items-center justify-center ${bgColorClass} backdrop-blur-sm`}
        role="status"
        aria-live="polite"
        aria-label="Loading page content"
      >
        <div className="flex flex-col items-center space-y-4">
          <div className={colorClass}>
            {renderSpinner()}
          </div>
          {message && (
            <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {message}
            </p>
          )}
        </div>
      </div>
    );
  }
  
  // Inline spinner variant
  return (
    <div 
      className="flex flex-col items-center justify-center p-8"
      role="status"
      aria-live="polite"
      aria-label={message || "Loading"}
    >
      <div className={colorClass}>
        {renderSpinner()}
      </div>
      {message && (
        <p className={`mt-2 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {message}
        </p>
      )}
    </div>
  );
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large', 'xl']),
  variant: PropTypes.oneOf(['spinner', 'dots', 'pulse', 'skeleton']),
  message: PropTypes.string,
  fullScreen: PropTypes.bool,
  color: PropTypes.string,
};

/**
 * Page Loading Spinner
 * Pre-configured spinner for page transitions
 */
export const PageLoadingSpinner = ({ message = "Loading page..." }) => (
  <LoadingSpinner 
    size="large" 
    variant="spinner" 
    message={message}
    fullScreen={true}
  />
);

/**
 * Inline Loading Spinner
 * Small spinner for inline loading states
 */
export const InlineLoadingSpinner = ({ message }) => (
  <LoadingSpinner 
    size="small" 
    variant="spinner" 
    message={message}
  />
);

/**
 * Button Loading Spinner
 * Tiny spinner for button loading states
 */
export const ButtonLoadingSpinner = () => (
  <LoadingSpinner 
    size="small" 
    variant="spinner"
  />
);

/**
 * Loading Overlay Hook
 * Custom hook for managing loading overlay state
 */
export const useLoadingOverlay = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [message, setMessage] = React.useState('');
  
  const showLoading = (msg = 'Loading...') => {
    setMessage(msg);
    setIsLoading(true);
  };
  
  const hideLoading = () => {
    setIsLoading(false);
    setMessage('');
  };
  
  const LoadingOverlay = () => (
    isLoading ? <PageLoadingSpinner message={message} /> : null
  );
  
  return {
    isLoading,
    showLoading,
    hideLoading,
    LoadingOverlay,
  };
};

export default LoadingSpinner;
