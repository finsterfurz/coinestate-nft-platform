import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Building, BarChart3, Users, TrendingUp } from '../icons';
import { typography } from '../../utils/typography';
import animations from '../../styles/animations.module.css';
import components from '../../styles/components.module.css';

const StatsSection = ({ theme }) => {
  const [animatedStats, setAnimatedStats] = useState({
    totalValue: 0,
    properties: 0,
    holders: 0,
    yield: 0
  });

  // Animated counter effect
  useEffect(() => {
    const targets = {
      totalValue: 127500000,
      properties: 23,
      holders: 1847,
      yield: 8.4
    };

    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      
      setAnimatedStats({
        totalValue: Math.floor(targets.totalValue * progress),
        properties: Math.floor(targets.properties * progress),
        holders: Math.floor(targets.holders * progress),
        yield: parseFloat((targets.yield * progress).toFixed(1))
      });

      if (step >= steps) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const stats = [
    {
      label: "Total Property Value",
      value: `€${(animatedStats.totalValue / 1000000).toFixed(1)}M`,
      icon: Building,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      bgColorDark: "bg-blue-900/30"
    },
    {
      label: "Active Properties",
      value: animatedStats.properties,
      icon: BarChart3,
      color: "text-green-600",
      bgColor: "bg-green-100",
      bgColorDark: "bg-green-900/30"
    },
    {
      label: "NFT Holders",
      value: animatedStats.holders.toLocaleString(),
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      bgColorDark: "bg-purple-900/30"
    },
    {
      label: "Avg. Annual Yield",
      value: `${animatedStats.yield}%`,
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      bgColorDark: "bg-orange-900/30"
    }
  ];

  return (
    <section className={`py-16 ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50/50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-12 ${animations.fadeIn}`}>
          <h3 className={`${typography.h3(theme)} mb-4`}>
            Platform Performance
          </h3>
          <p className={`${typography.body(theme)} max-w-2xl mx-auto`}>
            Real-time metrics from our community-governed real estate portfolio
          </p>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div 
                key={index} 
                className={`
                  ${components.statsCard} 
                  ${theme === 'dark' ? components.statsCardDark : components.statsCardLight}
                  ${animations.cardSlideIn}
                  ${animations[`delay-${(index + 1) * 100}`] || ''}
                `}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`p-2 rounded-lg ${
                    theme === 'dark' ? stat.bgColorDark : stat.bgColor
                  }`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className={`w-2 h-2 bg-green-500 rounded-full ${animations.pulseSlow}`}></div>
                </div>
                <div className={`${components.statsValue} ${stat.color} ${animations.countUp}`}>
                  {stat.value}
                </div>
                <div className={`${components.statsLabel}`}>
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Platform Metrics */}
        <div className={`mt-12 text-center ${animations.slideUp} ${animations['delay-500']}`}>
          <div className={`inline-flex items-center space-x-8 px-8 py-4 rounded-2xl backdrop-blur-sm border ${
            theme === 'dark' 
              ? 'bg-gray-700/30 border-gray-600/50' 
              : 'bg-white/70 border-gray-200/50'
          }`}>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">97.8%</div>
              <div className="text-sm text-gray-500">Uptime</div>
            </div>
            <div className={`w-px h-12 ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">24/7</div>
              <div className="text-sm text-gray-500">Monitoring</div>
            </div>
            <div className={`w-px h-12 ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">15+</div>
              <div className="text-sm text-gray-500">Countries</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

StatsSection.propTypes = {
  theme: PropTypes.oneOf(['light', 'dark', 'blue']).isRequired,
};

export default StatsSection;