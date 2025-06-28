import React from 'react';
import { Shield, Key } from '../../icons';
import animations from '../../../styles/animations.module.css';

const HeroFloatingElements = () => {
  const floatingElements = [
    {
      icon: Shield,
      position: 'absolute -top-6 -right-6',
      gradient: 'from-blue-600 to-indigo-600',
      delay: '',
      ariaLabel: 'Security Shield Icon'
    },
    {
      icon: Key,
      position: 'absolute -bottom-6 -left-6',
      gradient: 'from-purple-600 to-pink-600',
      delay: animations['delay-1000'],
      ariaLabel: 'Access Key Icon'
    }
  ];

  return (
    <>
      {floatingElements.map(({ icon: Icon, position, gradient, delay, ariaLabel }, index) => (
        <FloatingElement
          key={index}
          Icon={Icon}
          position={position}
          gradient={gradient}
          delay={delay}
          ariaLabel={ariaLabel}
        />
      ))}
    </>
  );
};

const FloatingElement = ({ Icon, position, gradient, delay, ariaLabel }) => (
  <div 
    className={`${position} bg-gradient-to-r ${gradient} text-white p-4 rounded-xl shadow-lg ${animations.bounceSubtle} ${delay}`}
    role="presentation"
    aria-label={ariaLabel}
  >
    <Icon className="h-8 w-8" aria-hidden="true" />
  </div>
);

export default HeroFloatingElements;