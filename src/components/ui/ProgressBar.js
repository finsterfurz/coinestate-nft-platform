// src/components/ui/ProgressBar.js
import React from 'react';
import { useApp } from '../../context/AppContext';
import { themes } from '../../utils/themes';

const ProgressBar = ({ 
  value = 0, 
  max = 100, 
  label, 
  showPercentage = true, 
  color = 'blue',
  size = 'md',
  animated = false 
}) => {
  const { theme } = useApp();
  
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-4',
    lg: 'h-6'
  };
  
  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    red: 'bg-red-600',
    yellow: 'bg-yellow-600',
    purple: 'bg-purple-600'
  };

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <span className={`text-sm font-medium ${themes[theme].text.primary}`}>{label}</span>
          )}
          {showPercentage && (
            <span className={`text-sm ${themes[theme].text.tertiary}`}>
              {percentage.toFixed(1)}%
            </span>
          )}
        </div>
      )}
      
      <div className={`w-full rounded-full overflow-hidden ${
        theme === 'coinblue' ? 'bg-blue-900/30' : 
        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
      } ${sizeClasses[size]}`}>
        <div 
          className={`h-full rounded-full transition-all duration-500 ease-out ${
            colorClasses[color]
          } ${animated ? 'animate-pulse' : ''}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {size === 'lg' && showPercentage && (
        <div className="text-center mt-2">
          <span className={`text-lg font-semibold ${themes[theme].text.primary}`}>
            {value.toLocaleString()} / {max.toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;