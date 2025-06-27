/**
 * Security Hook for CoinEstate NFT Platform
 * Provides security utilities, validation, and monitoring
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  generateCSRFToken, 
  validateCSRFToken,
  validateAndSanitize,
  rateLimiter,
  hashData
} from '../utils/validation';
import { 
  isSecureContext, 
  getSecurityConfig,
  RATE_LIMITS,
  SECURITY_CONSTANTS
} from '../config/security';

/**
 * Main Security Hook
 * Provides comprehensive security functionality
 */
export const useSecurity = () => {
  const [securityState, setSecurityState] = useState({
    isSecureContext: false,
    csrfToken: null,
    sessionId: null,
    lastActivity: Date.now(),
    isSessionValid: true,
    securityConfig: null
  });
  
  const sessionTimeoutRef = useRef(null);
  const securityLog = useRef([]);

  // Initialize security on mount
  useEffect(() => {
    initializeSecurity();
    setupSessionMonitoring();
    setupSecurityHeaders();
    
    return () => {
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Initialize security configuration
   */
  const initializeSecurity = useCallback(() => {
    const config = getSecurityConfig();
    const csrfToken = generateCSRFToken();
    const sessionId = generateSessionId();
    
    setSecurityState(prev => ({
      ...prev,
      isSecureContext: isSecureContext(),
      csrfToken,
      sessionId,
      securityConfig: config,
      lastActivity: Date.now()
    }));
    
    // Log security initialization
    logSecurityEvent('SECURITY_INITIALIZED', {
      secureContext: isSecureContext(),
      sessionId
    });
    
    // Warn if not in secure context
    if (!isSecureContext()) {
      console.warn('⚠️ Application not running in secure context (HTTPS)');
    }
  }, []);

  /**
   * Setup session timeout monitoring
   */
  const setupSessionMonitoring = useCallback(() => {
    const resetTimeout = () => {
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
      }
      
      sessionTimeoutRef.current = setTimeout(() => {
        handleSessionTimeout();
      }, SECURITY_CONSTANTS.SESSION_TIMEOUT_MS);
    };
    
    // Reset timeout on user activity
    const handleActivity = () => {
      setSecurityState(prev => ({
        ...prev,
        lastActivity: Date.now()
      }));
      resetTimeout();
    };
    
    // Listen for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });
    
    resetTimeout();
    
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, []);

  /**
   * Setup security headers via meta tags
   */
  const setupSecurityHeaders = useCallback(() => {
    const config = getSecurityConfig();
    
    if (config.enableSecurityHeaders) {
      // Add CSP meta tag
      if (config.enableCSP) {
        const existingCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
        if (!existingCSP) {
          const meta = document.createElement('meta');
          meta.httpEquiv = 'Content-Security-Policy';
          meta.content = generateCSPString();
          document.head.appendChild(meta);
        }
      }
      
      // Add other security meta tags
      addSecurityMetaTag('X-Content-Type-Options', 'nosniff');
      addSecurityMetaTag('X-Frame-Options', 'DENY');
      addSecurityMetaTag('Referrer-Policy', 'strict-origin-when-cross-origin');
    }
  }, []);

  /**
   * Add security meta tag
   */
  const addSecurityMetaTag = (name, content) => {
    const existing = document.querySelector(`meta[http-equiv="${name}"]`);
    if (!existing) {
      const meta = document.createElement('meta');
      meta.httpEquiv = name;
      meta.content = content;
      document.head.appendChild(meta);
    }
  };

  /**
   * Handle session timeout
   */
  const handleSessionTimeout = useCallback(() => {
    setSecurityState(prev => ({
      ...prev,
      isSessionValid: false
    }));
    
    logSecurityEvent('SESSION_TIMEOUT', {
      sessionId: securityState.sessionId,
      lastActivity: securityState.lastActivity
    });
    
    // Clear sensitive data
    clearSensitiveData();
    
    // Notify user
    alert('Your session has expired for security reasons. Please refresh the page.');
  }, [securityState.sessionId, securityState.lastActivity]);

  /**
   * Clear sensitive data from memory and storage
   */
  const clearSensitiveData = useCallback(() => {
    // Clear localStorage (except theme preferences)
    const keysToKeep = ['coinstate-theme'];
    Object.keys(localStorage).forEach(key => {
      if (!keysToKeep.includes(key)) {
        localStorage.removeItem(key);
      }
    });
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Reset security state
    setSecurityState(prev => ({
      ...prev,
      csrfToken: null,
      sessionId: null
    }));
  }, []);

  /**
   * Generate session ID
   */
  const generateSessionId = () => {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2);
    return hashData(timestamp + random).substring(0, 16);
  };

  /**
   * Log security events
   */
  const logSecurityEvent = useCallback((event, data = {}) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      data,
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    securityLog.current.push(logEntry);
    
    // Keep only last 100 events
    if (securityLog.current.length > 100) {
      securityLog.current = securityLog.current.slice(-100);
    }
    
    // Console log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔒 Security Event:', event, data);
    }
  }, []);

  /**
   * Validate input with rate limiting
   */
  const validateWithRateLimit = useCallback((input, schema, rateLimitKey) => {
    // Check rate limit first
    if (rateLimitKey) {
      const isAllowed = rateLimiter.isAllowed(
        rateLimitKey,
        RATE_LIMITS.API_CALLS_PER_MINUTE,
        60000 // 1 minute
      );
      
      if (!isAllowed) {
        logSecurityEvent('RATE_LIMIT_EXCEEDED', { key: rateLimitKey });
        return {
          isValid: false,
          error: 'Rate limit exceeded. Please try again later.',
          rateLimited: true
        };
      }
    }
    
    // Validate input
    const result = validateAndSanitize(input, schema);
    
    if (!result.isValid) {
      logSecurityEvent('VALIDATION_FAILED', {
        error: result.error,
        rateLimitKey
      });
    }
    
    return result;
  }, [logSecurityEvent]);

  /**
   * Validate CSRF token
   */
  const validateCSRF = useCallback((token) => {
    const isValid = validateCSRFToken(token, securityState.csrfToken);
    
    if (!isValid) {
      logSecurityEvent('CSRF_VALIDATION_FAILED', {
        providedToken: token ? 'present' : 'missing',
        sessionId: securityState.sessionId
      });
    }
    
    return isValid;
  }, [securityState.csrfToken, securityState.sessionId, logSecurityEvent]);

  /**
   * Refresh CSRF token
   */
  const refreshCSRFToken = useCallback(() => {
    const newToken = generateCSRFToken();
    setSecurityState(prev => ({
      ...prev,
      csrfToken: newToken
    }));
    
    logSecurityEvent('CSRF_TOKEN_REFRESHED', {
      sessionId: securityState.sessionId
    });
    
    return newToken;
  }, [securityState.sessionId, logSecurityEvent]);

  /**
   * Check for suspicious activity
   */
  const checkSuspiciousActivity = useCallback((activity) => {
    const suspiciousPatterns = [
      /script/i,
      /javascript:/i,
      /on\w+=/i,
      /<iframe/i,
      /eval\(/i
    ];
    
    const isSuspicious = suspiciousPatterns.some(pattern => 
      pattern.test(JSON.stringify(activity))
    );
    
    if (isSuspicious) {
      logSecurityEvent('SUSPICIOUS_ACTIVITY_DETECTED', activity);
      return true;
    }
    
    return false;
  }, [logSecurityEvent]);

  /**
   * Get security audit log
   */
  const getSecurityLog = useCallback(() => {
    return [...securityLog.current];
  }, []);

  /**
   * Reset session (for logout)
   */
  const resetSession = useCallback(() => {
    clearSensitiveData();
    const newCSRFToken = generateCSRFToken();
    const newSessionId = generateSessionId();
    
    setSecurityState(prev => ({
      ...prev,
      csrfToken: newCSRFToken,
      sessionId: newSessionId,
      lastActivity: Date.now(),
      isSessionValid: true
    }));
    
    logSecurityEvent('SESSION_RESET', {
      newSessionId
    });
  }, [logSecurityEvent]);

  return {
    // State
    ...securityState,
    
    // Validation functions
    validateWithRateLimit,
    validateCSRF,
    checkSuspiciousActivity,
    
    // Token management
    refreshCSRFToken,
    
    // Session management
    resetSession,
    clearSensitiveData,
    
    // Logging
    logSecurityEvent,
    getSecurityLog
  };
};

/**
 * Hook for secure form handling
 */
export const useSecureForm = (schema, options = {}) => {
  const security = useSecurity();
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const rateLimitKey = options.rateLimitKey || 'form_submission';
  
  const handleInputChange = useCallback((name, value) => {
    // Check for suspicious activity
    if (security.checkSuspiciousActivity({ [name]: value })) {
      setErrors(prev => ({
        ...prev,
        [name]: 'Suspicious input detected'
      }));
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear previous error
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [security, errors]);
  
  const validateForm = useCallback(() => {
    const result = security.validateWithRateLimit(
      formData,
      schema,
      rateLimitKey
    );
    
    if (!result.isValid) {
      if (result.rateLimited) {
        setErrors({ _global: result.error });
      } else {
        // Parse field-specific errors
        const fieldErrors = {};
        if (result.error.includes(',')) {
          result.error.split(',').forEach(error => {
            const trimmedError = error.trim();
            // Simple field extraction - could be improved
            const fieldMatch = trimmedError.match(/"([^"]+)"/);;
            const field = fieldMatch ? fieldMatch[1] : '_global';
            fieldErrors[field] = trimmedError;
          });
        } else {
          fieldErrors._global = result.error;
        }
        setErrors(fieldErrors);
      }
    } else {
      setErrors({});
    }
    
    return result;
  }, [security, formData, schema, rateLimitKey]);
  
  const handleSubmit = useCallback(async (onSubmit) => {
    setIsSubmitting(true);
    
    try {
      const validation = validateForm();
      if (!validation.isValid) {
        return false;
      }
      
      // Add CSRF token to submission
      const submissionData = {
        ...validation.value,
        _csrf: security.csrfToken
      };
      
      await onSubmit(submissionData);
      return true;
    } catch (error) {
      setErrors({ _global: error.message });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm, security.csrfToken]);
  
  return {
    formData,
    errors,
    isSubmitting,
    handleInputChange,
    validateForm,
    handleSubmit,
    resetForm: () => {
      setFormData({});
      setErrors({});
      setIsSubmitting(false);
    }
  };
};

export default useSecurity;