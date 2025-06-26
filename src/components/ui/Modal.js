// src/components/ui/Modal.js
import React, { useEffect } from 'react';
import { X } from '../components/icons/AllIcons.js';
import { themes } from '../../utils/themes';
import { useApp } from '../../context/AppContext';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  hideCloseButton = false 
}) => {
  const { theme } = useApp();
  
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl'
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className={`relative w-full ${sizeClasses[size]} transform transition-all`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={`rounded-lg shadow-2xl border-2 ${themes[theme].card} ${themes[theme].border}`}>
            {/* Header */}
            {(title || !hideCloseButton) && (
              <div className={`px-6 py-4 border-b ${themes[theme].border} flex items-center justify-between`}>
                {title && (
                  <h3 className={`text-lg font-semibold ${themes[theme].text.primary}`}>
                    {title}
                  </h3>
                )}
                
                {!hideCloseButton && (
                  <button
                    onClick={onClose}
                    className={`p-2 rounded-lg transition-colors ${themes[theme].button.ghost}`}
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            )}
            
            {/* Content */}
            <div className="px-6 py-4">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;