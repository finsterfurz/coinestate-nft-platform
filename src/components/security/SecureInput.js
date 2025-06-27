/**
 * Secure Input Component
 * Input component with built-in validation and sanitization
 */

import React, { useState, useCallback } from 'react';
import { useSecurityContext } from './SecurityProvider';
import { sanitizeInput } from '../../utils/validation';

/**
 * Secure Input Component
 */
const SecureInput = ({
  type = 'text',
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  className = '',
  disabled = false,
  required = false,
  schema = null,
  rateLimitKey = null,
  maxLength = null,
  autoComplete = 'off',
  ...props
}) => {
  const security = useSecurityContext();
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

  /**
   * Handle input change with security validation
   */
  const handleChange = useCallback((event) => {
    const rawValue = event.target.value;
    
    // Check for suspicious activity
    if (security.checkSuspiciousActivity({ [name]: rawValue })) {
      setError('Suspicious input detected');
      security.logSecurityEvent('SUSPICIOUS_INPUT_DETECTED', {
        field: name,
        length: rawValue.length
      });
      return;
    }
    
    // Sanitize input
    const sanitizedValue = sanitizeInput(rawValue);
    
    // Validate if schema provided
    if (schema) {
      const validation = security.validateWithRateLimit(
        sanitizedValue,
        schema,
        rateLimitKey
      );
      
      if (!validation.isValid) {
        setError(validation.error);
      } else {
        setError('');
      }
    }
    
    // Call parent onChange
    if (onChange) {
      onChange({
        ...event,
        target: {
          ...event.target,
          name,
          value: sanitizedValue
        }
      });
    }
  }, [name, onChange, schema, rateLimitKey, security]);

  /**
   * Handle input blur
   */
  const handleBlur = useCallback((event) => {
    setTouched(true);
    
    if (onBlur) {
      onBlur(event);
    }
  }, [onBlur]);

  /**
   * Get input styling based on validation state
   */
  const getInputStyles = () => {
    const baseStyles = `
      w-full px-3 py-2 border rounded-md 
      focus:outline-none focus:ring-2 
      transition-colors duration-200
      ${className}
    `;
    
    if (error && touched) {
      return `${baseStyles} border-red-300 focus:border-red-500 focus:ring-red-200`;
    }
    
    return `${baseStyles} border-gray-300 focus:border-blue-500 focus:ring-blue-200 
            dark:border-gray-600 dark:bg-gray-700 dark:text-white 
            dark:focus:border-blue-400`;
  };

  return (
    <div className="relative">
      <input
        type={type}
        name={name}
        value={value || ''}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={getInputStyles()}
        disabled={disabled}
        required={required}
        maxLength={maxLength}
        autoComplete={autoComplete}
        {...props}
      />
      
      {/* Error Display */}
      {error && touched && (
        <div className="absolute left-0 mt-1 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}
      
      {/* Security Indicator */}
      {security.isSecureContext && (
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
          <div className="w-2 h-2 bg-green-500 rounded-full" title="Secure Input" />
        </div>
      )}
    </div>
  );
};

export default SecureInput;