import React from 'react';
import PropTypes from 'prop-types';
import HeroContent from './HeroContent';
import HeroDashboardPreview from './HeroDashboardPreview';
import HeroFloatingElements from './HeroFloatingElements';

const HeroSection = ({ theme, onNavigate }) => {
  const backgroundGradient = theme === 'dark'
    ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900'
    : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50';

  return (
    <section className={`relative pt-24 pb-20 overflow-hidden ${backgroundGradient}`}>
      {/* Animated Background Elements */}
      <BackgroundElements />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Content */}
          <HeroContent theme={theme} onNavigate={onNavigate} />
          
          {/* Right Column - Dashboard Preview */}
          <div className="relative">
            <HeroDashboardPreview theme={theme} />
            <HeroFloatingElements />
          </div>
        </div>
      </div>
    </section>
  );
};

const BackgroundElements = () => (
  <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
    <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" />
    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '200ms' }} />
  </div>
);

HeroSection.propTypes = {
  theme: PropTypes.oneOf(['light', 'dark', 'blue']).isRequired,
  onNavigate: PropTypes.func.isRequired,
};

export default HeroSection;