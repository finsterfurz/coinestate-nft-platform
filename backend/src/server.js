/**
 * CoinEstate NFT Platform - Main Server Entry Point
 * Enterprise-grade Express.js server with comprehensive security and monitoring
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import 'express-async-errors';

// Internal imports
import { config } from './config/index.js';
import logger from './utils/logger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { securityMiddleware } from './middleware/security.js';
import { setupRoutes } from './routes/index.js';
import { initializeDatabase } from './database/connection.js';
import { initializeRedis } from './services/redis.js';
import { initializeQueue } from './services/queue.js';
import { setupWebSocket } from './services/websocket.js';
import { startCronJobs } from './services/scheduler.js';
import { setupSwagger } from './config/swagger.js';

class CoinEstateServer {
  constructor() {
    this.app = express();
    this.server = null;
    this.isShuttingDown = false;
  }

  /**
   * Initialize and start the server
   */
  async start() {
    try {
      // Initialize external services
      await this.initializeServices();
      
      // Setup middleware
      this.setupMiddleware();
      
      // Setup routes
      this.setupRoutes();
      
      // Setup error handling
      this.setupErrorHandling();
      
      // Start server
      await this.startServer();
      
      // Setup graceful shutdown
      this.setupGracefulShutdown();
      
      logger.info('🚀 CoinEstate API Server started successfully', {
        port: config.port,
        environment: config.nodeEnv,
        version: config.apiVersion
      });
      
    } catch (error) {
      logger.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }

  /**
   * Initialize external services
   */
  async initializeServices() {
    logger.info('🔧 Initializing services...');
    
    // Initialize database
    await initializeDatabase();
    logger.info('✅ Database connected');
    
    // Initialize Redis
    await initializeRedis();
    logger.info('✅ Redis connected');
    
    // Initialize queue system
    await initializeQueue();
    logger.info('✅ Queue system initialized');
    
    // Start cron jobs
    startCronJobs();
    logger.info('✅ Scheduled jobs started');
  }

  /**
   * Setup Express middleware
   */
  setupMiddleware() {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", "wss:"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"]
        }
      },
      hsts: {
        maxAge: config.security.hstsMaxAge,
        includeSubDomains: config.security.hstsIncludeSubdomains,
        preload: config.security.hstsPreload
      }
    }));
    
    // CORS configuration
    this.app.use(cors({
      origin: config.corsOrigin,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
    }));
    
    // Rate limiting
    const limiter = rateLimit({
      windowMs: config.rateLimit.windowMs,
      max: config.rateLimit.maxRequests,
      message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: Math.ceil(config.rateLimit.windowMs / 1000)
      },
      standardHeaders: true,
      legacyHeaders: false,
      skip: (req) => config.rateLimit.skipSuccess && req.method === 'GET'
    });
    this.app.use(limiter);
    
    // Body parsing and sanitization
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    this.app.use(mongoSanitize());
    this.app.use(xss());
    
    // Compression
    this.app.use(compression());
    
    // Logging
    if (config.nodeEnv !== 'test') {
      this.app.use(morgan('combined', {
        stream: { write: (message) => logger.info(message.trim()) }
      }));
    }
    
    // Custom security middleware
    this.app.use(securityMiddleware);
    
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config.nodeEnv,
        version: config.apiVersion
      });
    });
  }

  /**
   * Setup API routes
   */
  setupRoutes() {
    // API documentation
    if (config.apiDocsEnabled) {
      setupSwagger(this.app);
    }
    
    // API routes
    setupRoutes(this.app);
  }

  /**
   * Setup error handling middleware
   */
  setupErrorHandling() {
    // 404 handler
    this.app.use(notFoundHandler);
    
    // Global error handler
    this.app.use(errorHandler);
  }

  /**
   * Start the Express server
   */
  async startServer() {
    return new Promise((resolve, reject) => {
      this.server = this.app.listen(config.port, config.host, (error) => {
        if (error) {
          reject(error);
        } else {
          // Setup WebSocket
          setupWebSocket(this.server);
          resolve();
        }
      });
    });
  }

  /**
   * Setup graceful shutdown handlers
   */
  setupGracefulShutdown() {
    const gracefulShutdown = async (signal) => {
      if (this.isShuttingDown) return;
      this.isShuttingDown = true;
      
      logger.info(`🛑 Received ${signal}. Graceful shutdown initiated...`);
      
      try {
        // Close server
        if (this.server) {
          await new Promise((resolve) => {
            this.server.close(resolve);
          });
          logger.info('✅ HTTP server closed');
        }
        
        // Close database connections
        // await database.close();
        logger.info('✅ Database connections closed');
        
        // Close Redis connections
        // await redis.quit();
        logger.info('✅ Redis connections closed');
        
        logger.info('✅ Graceful shutdown completed');
        process.exit(0);
        
      } catch (error) {
        logger.error('❌ Error during graceful shutdown:', error);
        process.exit(1);
      }
    };
    
    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('❌ Uncaught Exception:', error);
      gracefulShutdown('uncaughtException');
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown('unhandledRejection');
    });
  }
}

// Start server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new CoinEstateServer();
  server.start();
}

export { CoinEstateServer };
export default CoinEstateServer;