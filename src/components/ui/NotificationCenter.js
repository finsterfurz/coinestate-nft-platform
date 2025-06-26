import React from 'react';
import { useApp } from '../../context/AppContext';
import { X } from '../icons/AllIcons.js';

// ==================== NOTIFICATION CENTER ====================
const NotificationCenter = () => {
  const { notifications, updateState } = useApp();

  const removeNotification = (id) => {
    updateState(prev => ({ notifications: prev.notifications.filter(n => n.id !== id) }));
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-4 rounded-lg shadow-lg transform transition-all duration-300 animate-slideIn ${
            notification.type === 'success' ? 'bg-green-100 border-green-200 text-green-800' :
            notification.type === 'error' ? 'bg-red-100 border-red-200 text-red-800' :
            notification.type === 'warning' ? 'bg-yellow-100 border-yellow-200 text-yellow-800' :
            'bg-blue-100 border-blue-200 text-blue-800'
          }`}
        >
          <div className="flex justify-between items-start">
            <p className="text-sm font-medium">{notification.message}</p>
            <button onClick={() => removeNotification(notification.id)} className="ml-4 text-gray-500 hover:text-gray-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationCenter;
