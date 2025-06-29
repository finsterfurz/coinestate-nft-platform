/**
 * CoinEstate Backend - Main Router
 * Central routing configuration for all API endpoints
 */

import express from 'express';
import { config } from '../config/index.js';
import logger from '../utils/logger.js';

// Import route modules
import authRoutes from './auth.js';
import userRoutes from './users.js';
import propertyRoutes from './properties.js';
import nftRoutes from './nfts.js';
import governanceRoutes from './governance.js';
import transactionRoutes from './transactions.js';
import analyticsRoutes from './analytics.js';
import uploadRoutes from './uploads.js';
import adminRoutes from './admin.js';
import healthRoutes from './health.js';

/**
 * Setup API routes
 */
export const setupRoutes = (app) => {
  // Create API router
  const apiRouter = express.Router();
  
  // Request logging middleware
  apiRouter.use((req, res, next) => {
    req.startTime = Date.now();
    next();
  });
  
  // Response time middleware
  apiRouter.use((req, res, next) => {
    const originalSend = res.send;
    res.send = function(body) {
      const responseTime = Date.now() - req.startTime;
      res.setHeader('X-Response-Time', `${responseTime}ms`);
      return originalSend.call(this, body);
    };
    next();
  });
  
  // API version header
  apiRouter.use((req, res, next) => {
    res.setHeader('X-API-Version', config.apiVersion);
    next();
  });
  
  // Health check (no auth required)
  apiRouter.use('/health', healthRoutes);
  
  // Authentication routes
  apiRouter.use('/auth', authRoutes);
  
  // User management routes
  apiRouter.use('/users', userRoutes);
  
  // Property management routes
  apiRouter.use('/properties', propertyRoutes);
  
  // NFT management routes
  apiRouter.use('/nfts', nftRoutes);
  
  // Governance routes
  apiRouter.use('/governance', governanceRoutes);
  
  // Transaction routes
  apiRouter.use('/transactions', transactionRoutes);
  
  // Analytics routes
  apiRouter.use('/analytics', analyticsRoutes);
  
  // File upload routes
  apiRouter.use('/uploads', uploadRoutes);
  
  // Admin routes
  apiRouter.use('/admin', adminRoutes);
  
  // Mount API router
  app.use(`/api/${config.apiVersion}`, apiRouter);
  
  // Root endpoint
  app.get('/', (req, res) => {
    res.json({
      name: 'CoinEstate NFT Platform API',
      version: config.apiVersion,
      environment: config.nodeEnv,
      timestamp: new Date().toISOString(),
      documentation: config.apiDocsEnabled ? '/api-docs' : 'Documentation disabled',
      health: `/api/${config.apiVersion}/health`
    });
  });
  
  logger.info('✅ API routes configured', {
    version: config.apiVersion,
    environment: config.nodeEnv
  });
};

export default setupRoutes;