// src/components/ui/LoadingSpinner.js
import React from 'react';

const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizes = { 
    sm: 'w-4 h-4', 
    md: 'w-6 h-6', 
    lg: 'w-8 h-8', 
    xl: 'w-12 h-12' 
  };
  
  return (
    <div 
      className={`animate-spin rounded-full border-2 border-blue-600 border-t-transparent ${sizes[size]} ${className}`}
    />
  );
};

export default LoadingSpinner;