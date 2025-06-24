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
    theme: 'light',
    loading: false,
    error: null,
    notifications: [],
    
    // App Data
    nftAccess: [],
    selectedProject: null,
    realTimeData: {},
    dashboardView: 'public',
    refreshInterval: null
  });

  const updateState = (updates) => {
    setState(prev => typeof updates === 'function' ? updates(prev) : { ...prev, ...updates });
  };

  const addNotification = (message, type = 'info', duration = 5000) => {
    const id = Date.now();
    const notification = { id, message, type, timestamp: Date.now() };
    
    updateState(prev => ({
      notifications: [...prev.notifications, notification]
    }));

    setTimeout(() => {
      updateState(prev => ({
        notifications: prev.notifications.filter(n => n.id !== id)
      }));
    }, duration);
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

  const value = { 
    ...state, 
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
  return context;
};
