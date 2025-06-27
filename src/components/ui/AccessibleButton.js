/**
 * Accessible Button Component
 * WCAG 2.1 AA compliant button with comprehensive accessibility features
 */

import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { ButtonLoader } from './LoadingSpinner';
import animations from '../../styles/animations.module.css';

const AccessibleButton = forwardRef(({ 
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon = null,
  iconPosition = 'left',
  ariaLabel = null,
  ariaDescribedBy = null,
  ariaExpanded = null,
  ariaPressed = null,
  onClick,
  onKeyDown,
  className = '',
  type = 'button',
  ...props
}, ref) => {
  
  // Base styles for all buttons
  const baseStyles = `
    inline-flex items-center justify-center
    font-semibold rounded-lg
    transition-all duration-200
    focus:outline-none focus:ring-4 focus:ring-opacity-50
    disabled:opacity-50 disabled:cursor-not-allowed
    ${animations.hoverScale}
    ${fullWidth ? 'w-full' : ''}
  `;

  // Size variants
  const sizeStyles = {
    small: 'px-3 py-2 text-sm min-h-[36px]',
    medium: 'px-6 py-3 text-base min-h-[44px]',
    large: 'px-8 py-4 text-lg min-h-[52px]'
  };

  // Color variants with WCAG AA contrast ratios
  const variantStyles = {
    primary: `
      bg-blue-600 hover:bg-blue-700 active:bg-blue-800
      text-white focus:ring-blue-300
      disabled:bg-blue-300
    `,
    secondary: `
      bg-gray-200 hover:bg-gray-300 active:bg-gray-400
      text-gray-900 focus:ring-gray-300
      disabled:bg-gray-100 disabled:text-gray-400
      dark:bg-gray-700 dark:hover:bg-gray-600 dark:active:bg-gray-500
      dark:text-white dark:focus:ring-gray-500
    `,
    outline: `
      border-2 border-blue-600 hover:bg-blue-50 active:bg-blue-100
      text-blue-600 focus:ring-blue-300
      disabled:border-blue-300 disabled:text-blue-300
      dark:hover:bg-blue-900/20 dark:active:bg-blue-900/30
    `,
    ghost: `
      hover:bg-gray-100 active:bg-gray-200
      text-gray-700 focus:ring-gray-300
      disabled:text-gray-400
      dark:hover:bg-gray-800 dark:active:bg-gray-700
      dark:text-gray-300 dark:focus:ring-gray-600
    `,
    danger: `
      bg-red-600 hover:bg-red-700 active:bg-red-800
      text-white focus:ring-red-300
      disabled:bg-red-300
    `,
    success: `
      bg-green-600 hover:bg-green-700 active:bg-green-800
      text-white focus:ring-green-300
      disabled:bg-green-300
    `
  };

  // Handle keyboard navigation
  const handleKeyDown = (event) => {
    // Activate button on Enter or Space
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!disabled && !loading && onClick) {
        onClick(event);
      }
    }
    
    // Custom key handler
    if (onKeyDown) {
      onKeyDown(event);
    }
  };

  // Handle click events
  const handleClick = (event) => {
    if (disabled || loading) {
      event.preventDefault();
      return;
    }
    
    if (onClick) {
      onClick(event);
    }
  };

  // Combine all styles
  const buttonStyles = `
    ${baseStyles}
    ${sizeStyles[size]}
    ${variantStyles[variant]}
    ${className}
  `;

  // Icon element
  const iconElement = icon && (
    <span className={`
      flex items-center
      ${children ? (iconPosition === 'left' ? 'mr-2' : 'ml-2') : ''}
    `}>
      {React.cloneElement(icon, {
        className: `${icon.props.className || ''} ${size === 'small' ? 'w-4 h-4' : size === 'large' ? 'w-6 h-6' : 'w-5 h-5'}`,
        'aria-hidden': 'true'
      })}
    </span>
  );

  return (
    <button
      ref={ref}
      type={type}
      className={buttonStyles}
      disabled={disabled || loading}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
      aria-describedby={ariaDescribedBy}
      aria-expanded={ariaExpanded}
      aria-pressed={ariaPressed}
      aria-busy={loading ? 'true' : undefined}
      {...props}
    >
      {loading ? (
        <>
          <ButtonLoader 
            size={size === 'large' ? 'medium' : 'small'}
            color={variant === 'primary' || variant === 'danger' || variant === 'success' ? 'white' : 'blue'}
            className="mr-2"
          />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {iconPosition === 'left' && iconElement}
          {children && (
            <span className={icon && !children ? 'sr-only' : ''}>
              {children}
            </span>
          )}
          {iconPosition === 'right' && iconElement}
        </>
      )}
    </button>
  );
});

AccessibleButton.displayName = 'AccessibleButton';

AccessibleButton.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'ghost', 'danger', 'success']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  fullWidth: PropTypes.bool,
  icon: PropTypes.element,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  ariaLabel: PropTypes.string,
  ariaDescribedBy: PropTypes.string,
  ariaExpanded: PropTypes.bool,
  ariaPressed: PropTypes.bool,
  onClick: PropTypes.func,
  onKeyDown: PropTypes.func,
  className: PropTypes.string,
  type: PropTypes.oneOf(['button', 'submit', 'reset'])
};

export default AccessibleButton;