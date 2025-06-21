// src/context/AppContext.js
import React, { createContext, useContext, useState } from 'react';
import { ALL_PROJECTS, DASHBOARD_PROJECTS } from '../data/projects';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [state, setState] = useState({
    isConnected: false,
    walletAddress: '',
    kycStatus: 'unverified',
    currentPage: 'home',
    theme: 'light',
    loading: false,
    error: null,
    notifications: [],
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
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask not installed. Please install MetaMask to continue.');
      }

      const mockAddress = '0x742d35Cc6Bf4532B8C3F8C71F7Eab0a4A4b7c8f9';
      const mockNFTs = [
        { projectSlug: 'vienna-luxury-apartments', nftId: 'VLA-247', verified: true },
        { projectSlug: 'berlin-tech-hub', nftId: 'BTH-145', verified: true }
      ];

      updateState({
        isConnected: true,
        walletAddress: mockAddress,
        nftAccess: mockNFTs,
        loading: false,
        kycStatus: 'verified'
      });

      addNotification('Wallet connected successfully! NFT access credentials verified.', 'success');

    } catch (error) {
      updateState({ loading: false, error: error.message });
      addNotification(error.message, 'error');
    }
  };

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