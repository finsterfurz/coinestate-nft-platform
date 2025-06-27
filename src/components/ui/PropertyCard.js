// src/components/ui/PropertyCard.js
import React from 'react';
import { Building, Key } from '../icons/AllIcons.js';
import { themes } from '../../utils/themes';
import { typography } from '../../utils/typography';
import { formatCurrency, getStatusColor } from '../../utils/helpers';
import { useApp } from '../../context/AppContext';

const PropertyCard = ({ project, onClick }) => {
  const { theme } = useApp();
  const statusColors = getStatusColor(project.status);

  return (
    <div 
      className={`rounded-xl overflow-hidden shadow-lg border transition-all hover:shadow-xl cursor-pointer transform hover:scale-105 ${themes[theme].card}`}
      onClick={() => onClick && onClick(project)}
    >
      <div className="relative">
        <img 
          src={project.image} 
          alt={project.name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors.bg} ${statusColors.text}`}>
            {project.status}
          </span>
        </div>
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-2">
          <Building className="h-4 w-4 text-blue-600" />
        </div>
        {project.privateInfo && (
          <div className="absolute bottom-4 right-4 bg-green-600 text-white rounded-lg p-2">
            <Key className="h-4 w-4" />
          </div>
        )}
      </div>
      
      <div className="p-6">
        <h3 className={`${typography.h5(theme)} mb-2 line-clamp-1`}>{project.name}</h3>
        <p className={`${typography.bodySmall(theme)} mb-4 line-clamp-2`}>{project.location}</p>
        
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className={`block ${themes[theme].text.tertiary}`}>Total Value</span>
              <span className={`font-semibold ${themes[theme].text.primary}`}>
                {formatCurrency(project.totalValue)}
              </span>
            </div>
            <div>
              <span className={`block ${themes[theme].text.tertiary}`}>NFT Count</span>
              <span className={`font-semibold ${themes[theme].text.primary}`}>
                {project.nftCount.toLocaleString()}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className={`block ${themes[theme].text.tertiary}`}>Monthly Rent</span>
              <span className={`font-semibold ${themes[theme].text.primary}`}>
                {formatCurrency(project.monthlyRent)}
              </span>
            </div>
            <div>
              <span className={`block ${themes[theme].text.tertiary}`}>Success Rate</span>
              <span className={`font-semibold text-green-600`}>
                {project.marketData?.successRate}%
              </span>
            </div>
          </div>
          
          <div className="pt-3 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              {project.highlights.slice(0, 2).map((highlight, index) => (
                <span 
                  key={index} 
                  className={`text-xs px-2 py-1 rounded-full ${themes[theme].text.tertiary} ${
                    theme === 'coinblue' ? 'bg-blue-800/30' : 
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                  }`}
                >
                  {highlight}
                </span>
              ))}
              {project.highlights.length > 2 && (
                <span className={`text-xs px-2 py-1 rounded-full ${themes[theme].text.tertiary}`}>
                  +{project.highlights.length - 2} more
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;