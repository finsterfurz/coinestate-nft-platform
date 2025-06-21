// src/components/ui/MetricCard.js
import React from 'react';
import { themes } from '../../utils/themes';
import { typography } from '../../utils/typography';
import { useApp } from '../../context/AppContext';

const MetricCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  trendDirection = 'up',
  color = 'blue',
  loading = false 
}) => {
  const { theme } = useApp();
  
  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600',
    purple: 'text-purple-600'
  };
  
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600'
  };

  return (
    <div className={`p-6 rounded-xl border transition-all hover:shadow-lg ${themes[theme].card}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]} ${
          theme === 'coinblue' ? 'bg-blue-900/20' : 
          theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
        }`}>
          {Icon && <Icon className="h-6 w-6" />}
        </div>
        
        {trend && (
          <div className={`text-sm font-medium ${trendColors[trendDirection]}`}>
            {trendDirection === 'up' && '↗'}
            {trendDirection === 'down' && '↘'}
            {trendDirection === 'neutral' && '→'}
            {trend}
          </div>
        )}
      </div>
      
      <div>
        <p className={`text-sm font-medium ${themes[theme].text.tertiary} mb-1`}>{title}</p>
        
        {loading ? (
          <div className={`h-8 bg-gray-200 rounded animate-pulse ${theme === 'dark' ? 'bg-gray-700' : ''}`} />
        ) : (
          <p className={`${typography.h3(theme)} mb-1`}>{value}</p>
        )}
        
        {subtitle && (
          <p className={`text-sm ${themes[theme].text.tertiary}`}>{subtitle}</p>
        )}
      </div>
    </div>
  );
};

export default MetricCard;