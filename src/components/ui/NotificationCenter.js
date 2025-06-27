import React from 'react';
import { useApp } from '../../context/AppContext';
import { X } from '../icons/AllIcons.js';

// ==================== NOTIFICATION CENTER ====================
const NotificationCenter = () => {
  const { notifications, updateState } = useApp();

  // 🛡️ DEFENSIVE PROGRAMMING - Sichere notifications vor .map() Fehlern
  const safeNotifications = React.useMemo(() => {
    if (!notifications) {
      console.warn('NotificationCenter: notifications is undefined, using empty array');
      return [];
    }
    
    if (!Array.isArray(notifications)) {
      console.warn('NotificationCenter: notifications is not an array:', typeof notifications);
      return [];
    }
    
    return notifications;
  }, [notifications]);

  const removeNotification = (id) => {
    try {
      updateState(prev => ({
        notifications: Array.isArray(prev.notifications) 
          ? prev.notifications.filter(n => n && n.id !== id)
          : []
      }));
    } catch (error) {
      console.error('Error removing notification:', error);
    }
  };

  // 🚀 SAFE RENDERING - Keine Fehler mehr bei Theme-Switch
  const renderNotifications = () => {
    if (safeNotifications.length === 0) {
      return null; // Keine Notifications = kein Container
    }

    return safeNotifications.map((notification) => {
      // Zusätzliche Absicherung für jede notification
      if (!notification || typeof notification !== 'object') {
        console.warn('Invalid notification object:', notification);
        return null;
      }

      const { id, message, type } = notification;
      
      if (!id || !message) {
        console.warn('Notification missing required fields:', notification);
        return null;
      }

      return (
        <div
          key={id}
          className={`p-4 rounded-lg shadow-lg transform transition-all duration-300 animate-slideIn ${
            type === 'success' ? 'bg-green-100 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-700 dark:text-green-200' :
            type === 'error' ? 'bg-red-100 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-700 dark:text-red-200' :
            type === 'warning' ? 'bg-yellow-100 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-700 dark:text-yellow-200' :
            'bg-blue-100 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-200'
          } border`}
        >
          <div className="flex justify-between items-start">
            <p className="text-sm font-medium">{message}</p>
            <button 
              onClick={() => removeNotification(id)} 
              className="ml-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              aria-label="Remove notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      );
    }).filter(Boolean); // Entferne alle null-Werte
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {renderNotifications()}
    </div>
  );
};

export default NotificationCenter;