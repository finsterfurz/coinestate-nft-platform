/**
 * Toast Hook
 * Manages toast notifications with accessibility and performance
 */

import { useState, useCallback, useRef } from 'react';

export const useToast = () => {
  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(0);

  // Generate unique ID for each toast
  const generateId = () => {
    toastIdRef.current += 1;
    return `toast-${toastIdRef.current}`;
  };

  // Add a new toast
  const addToast = useCallback((toastData) => {
    const id = generateId();
    const toast = {
      id,
      ...toastData
    };

    setToasts(prev => {
      // Limit to maximum 5 toasts to prevent screen overflow
      const newToasts = [toast, ...prev.slice(0, 4)];
      return newToasts;
    });

    return id;
  }, []);

  // Remove a specific toast
  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Clear all toasts
  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods for different toast types
  const success = useCallback((message, options = {}) => {
    return addToast({
      type: 'success',
      message,
      ...options
    });
  }, [addToast]);

  const error = useCallback((message, options = {}) => {
    return addToast({
      type: 'error',
      message,
      persistent: true, // Error toasts should be persistent by default
      ...options
    });
  }, [addToast]);

  const warning = useCallback((message, options = {}) => {
    return addToast({
      type: 'warning',
      message,
      duration: 7000, // Warnings stay longer
      ...options
    });
  }, [addToast]);

  const info = useCallback((message, options = {}) => {
    return addToast({
      type: 'info',
      message,
      ...options
    });
  }, [addToast]);

  // Promise-based toast for async operations
  const promise = useCallback(async (promiseFunc, messages = {}) => {
    const defaultMessages = {
      loading: 'Processing...',
      success: 'Success!',
      error: 'An error occurred'
    };

    const finalMessages = { ...defaultMessages, ...messages };
    
    // Show loading toast
    const loadingId = addToast({
      type: 'info',
      message: finalMessages.loading,
      persistent: true
    });

    try {
      const result = await promiseFunc();
      
      // Remove loading toast
      removeToast(loadingId);
      
      // Show success toast
      success(finalMessages.success);
      
      return result;
    } catch (error) {
      // Remove loading toast
      removeToast(loadingId);
      
      // Show error toast
      const errorMessage = error.message || finalMessages.error;
      error(errorMessage);
      
      throw error;
    }
  }, [addToast, removeToast, success, error]);

  return {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    success,
    error,
    warning,
    info,
    promise
  };
};

export default useToast;