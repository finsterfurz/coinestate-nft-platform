/**
 * Toast Notification Component
 * Accessible toast notifications with auto-dismiss and screen reader support
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Check, X, AlertTriangle, Info, AlertCircle } from '../icons';
import animations from '../../styles/animations.module.css';

const Toast = ({
  id,
  type = 'info',
  title,
  message,
  duration = 5000,
  onDismiss,
  persistent = false,
  actions = null,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  // Auto-dismiss timer
  useEffect(() => {
    if (!persistent && duration > 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, persistent]);

  // Handle dismiss with animation
  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onDismiss) {
        onDismiss(id);
      }
    }, 300); // Match exit animation duration
  };

  // Don't render if not visible
  if (!isVisible) return null;

  // Toast type configurations
  const typeConfig = {
    success: {
      icon: Check,
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
      iconColor: 'text-green-600 dark:text-green-400',
      titleColor: 'text-green-800 dark:text-green-200',
      messageColor: 'text-green-700 dark:text-green-300',
      role: 'status',
      ariaLive: 'polite'
    },
    error: {
      icon: AlertCircle,
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800',
      iconColor: 'text-red-600 dark:text-red-400',
      titleColor: 'text-red-800 dark:text-red-200',
      messageColor: 'text-red-700 dark:text-red-300',
      role: 'alert',
      ariaLive: 'assertive'
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      titleColor: 'text-yellow-800 dark:text-yellow-200',
      messageColor: 'text-yellow-700 dark:text-yellow-300',
      role: 'alert',
      ariaLive: 'assertive'
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      iconColor: 'text-blue-600 dark:text-blue-400',
      titleColor: 'text-blue-800 dark:text-blue-200',
      messageColor: 'text-blue-700 dark:text-blue-300',
      role: 'status',
      ariaLive: 'polite'
    }
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={`
        relative max-w-md w-full pointer-events-auto
        ${config.bgColor} ${config.borderColor}
        border rounded-lg shadow-lg
        transform transition-all duration-300 ease-in-out
        ${isExiting 
          ? 'translate-x-full opacity-0 scale-95' 
          : `translate-x-0 opacity-100 scale-100 ${animations.slideIn}`
        }
        ${className}
      `}
      role={config.role}
      aria-live={config.ariaLive}
      aria-atomic="true"
    >
      <div className="flex p-4">
        {/* Icon */}
        <div className="flex-shrink-0">
          <Icon 
            className={`h-6 w-6 ${config.iconColor}`} 
            aria-hidden="true"
          />
        </div>
        
        {/* Content */}
        <div className="ml-3 w-0 flex-1">
          {title && (
            <p className={`text-sm font-medium ${config.titleColor}`}>
              {title}
            </p>
          )}
          {message && (
            <p className={`${title ? 'mt-1' : ''} text-sm ${config.messageColor}`}>
              {message}
            </p>
          )}
          
          {/* Action buttons */}
          {actions && (
            <div className="mt-3 flex space-x-2">
              {actions}
            </div>
          )}
        </div>
        
        {/* Dismiss button */}
        {!persistent && (
          <div className="ml-4 flex flex-shrink-0">
            <button
              onClick={handleDismiss}
              className={`
                inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2
                ${config.iconColor} hover:opacity-75 focus:ring-blue-500
                p-1.5 transition-opacity
              `}
              aria-label="Dismiss notification"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
      
      {/* Progress bar for auto-dismiss */}
      {!persistent && duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10 rounded-b-lg overflow-hidden">
          <div 
            className={`h-full bg-current ${config.iconColor} transition-transform ease-linear`}
            style={{
              transform: `scaleX(0)`,
              transformOrigin: 'left',
              animation: `progressBar ${duration}ms linear forwards`
            }}
          />
        </div>
      )}
      
      <style jsx>{`
        @keyframes progressBar {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
      `}</style>
    </div>
  );
};

/**
 * Toast Container Component
 */
export const ToastContainer = ({ toasts = [], onDismiss, position = 'top-right' }) => {
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  };

  if (toasts.length === 0) return null;

  return (
    <div 
      className={`fixed z-50 pointer-events-none ${positionClasses[position]}`}
      aria-label="Notifications"
      role="region"
    >
      <div className="flex flex-col space-y-3">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            onDismiss={onDismiss}
          />
        ))}
      </div>
    </div>
  );
};

// PropTypes
Toast.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
  title: PropTypes.string,
  message: PropTypes.string.isRequired,
  duration: PropTypes.number,
  onDismiss: PropTypes.func,
  persistent: PropTypes.bool,
  actions: PropTypes.node,
  className: PropTypes.string
};

ToastContainer.propTypes = {
  toasts: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
    title: PropTypes.string,
    message: PropTypes.string.isRequired,
    duration: PropTypes.number,
    persistent: PropTypes.bool,
    actions: PropTypes.node
  })),
  onDismiss: PropTypes.func.isRequired,
  position: PropTypes.oneOf([
    'top-right', 'top-left', 'bottom-right', 
    'bottom-left', 'top-center', 'bottom-center'
  ])
};

export default Toast;