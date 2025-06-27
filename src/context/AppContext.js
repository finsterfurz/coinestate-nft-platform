import React, { createContext, useContext, useState, useEffect } from 'react';
import { ALL_PROJECTS, DASHBOARD_PROJECTS } from '../data/projects';

// ==================== CONTEXT & STATE MANAGEMENT ====================
const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [state, setState] = useState({
    // User & Auth
    isConnected: false,
    walletAddress: '',
    kycStatus: 'unverified',
    
    // UI State
    currentPage: 'home',
    // 🔥 THEME REMOVED - Now handled by separate ThemeContext
    loading: false,
    error: null,
    notifications: [], // 🛡️ Always initialized as empty array
    
    // App Data
    nftAccess: [],
    selectedProject: null,
    realTimeData: {},
    dashboardView: 'public',
    refreshInterval: null
  });

  // 🛡️ SAFE STATE UPDATER - Prevents undefined notifications
  const updateState = (updates) => {
    setState(prev => {
      const newState = typeof updates === 'function' ? updates(prev) : { ...prev, ...updates };
      
      // Ensure notifications is always an array
      if (newState.notifications && !Array.isArray(newState.notifications)) {
        console.warn('AppContext: notifications must be an array, resetting to empty array');
        newState.notifications = [];
      }
      
      return newState;
    });
  };

  // 🔥 THEME EFFECT REMOVED - No longer interferes with app state
  // Theme management is now handled by ThemeContext

  const addNotification = (message, type = 'info', duration = 5000) => {
    try {
      const id = Date.now() + Math.random(); // More unique ID
      const notification = { id, message, type, timestamp: Date.now() };
      
      updateState(prev => ({
        notifications: Array.isArray(prev.notifications) 
          ? [...prev.notifications, notification]
          : [notification] // Fallback if notifications is not array
      }));

      // Auto-remove notification after duration
      setTimeout(() => {
        updateState(prev => ({
          notifications: Array.isArray(prev.notifications)
            ? prev.notifications.filter(n => n && n.id !== id)
            : []
        }));
      }, duration);
    } catch (error) {
      console.error('Error adding notification:', error);
    }
  };

  const connectWallet = async () => {
    updateState({ loading: true, error: null });
    
    try {
      // Simulate wallet connection delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask not installed. Please install MetaMask to continue.');
      }

      // Simulate wallet connection
      const mockAddress = '0x742d35Cc6Bf4532B8C3F8C71F7Eab0a4A4b7c8f9';
      
      // Simulate NFT access credentials for demo
      const mockNFTs = [
        { projectSlug: 'vienna-luxury-apartments', nftId: 'VLA-247', verified: true },
        { projectSlug: 'berlin-tech-hub', nftId: 'BTH-145', verified: true }
      ];

      updateState({
        isConnected: true,
        walletAddress: mockAddress,
        nftAccess: mockNFTs,
        loading: false,
        kycStatus: 'verified' // Auto-verify for demo
      });

      addNotification('Wallet connected successfully! NFT access credentials verified.', 'success');
      startRealTimeUpdates();

    } catch (error) {
      updateState({ loading: false, error: error.message });
      addNotification(error.message, 'error');
    }
  };

  const startRealTimeUpdates = () => {
    const interval = setInterval(() => {
      updateState(prev => ({
        realTimeData: {
          ...prev.realTimeData,
          lastUpdate: Date.now(),
          prices: {
            vienna: 24977 + (Math.random() - 0.5) * 100,
            berlin: 7000 + (Math.random() - 0.5) * 50,
            zurich: 10500 + (Math.random() - 0.5) * 75
          },
          occupancy: {
            vienna: 97.3 + (Math.random() - 0.5) * 2,
            berlin: 94.8 + (Math.random() - 0.5) * 3,
            zurich: 96.1 + (Math.random() - 0.5) * 2
          }
        }
      }));
    }, 10000);

    updateState({ refreshInterval: interval });
  };

  useEffect(() => {
    return () => {
      if (state.refreshInterval) clearInterval(state.refreshInterval);
    };
  }, [state.refreshInterval]);

  // 🛡️ SAFE CONTEXT VALUE - Always provides valid notifications array
  const value = { 
    ...state, 
    notifications: Array.isArray(state.notifications) ? state.notifications : [], // Extra safety
    updateState, 
    addNotification, 
    connectWallet,
    projects: ALL_PROJECTS,
    dashboardProjects: DASHBOARD_PROJECTS
  };
  
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  
  // 🛡️ EXTRA SAFETY - Ensure notifications is always an array
  return {
    ...context,
    notifications: Array.isArray(context.notifications) ? context.notifications : []
  };
};