/**
 * CoinEstate Backend - Database Connection Management
 * PostgreSQL connection with connection pooling and retry logic
 */

import { Pool } from 'pg';
import { config } from '../config/index.js';
import logger from '../utils/logger.js';

class DatabaseConnection {
  constructor() {
    this.pool = null;
    this.isConnected = false;
    this.retryAttempts = 0;
    this.maxRetries = 5;
    this.retryDelay = 5000;
  }

  /**
   * Initialize database connection pool
   */
  async initialize() {
    try {
      this.pool = new Pool({
        host: config.database.host,
        port: config.database.port,
        database: config.database.name,
        user: config.database.user,
        password: config.database.password,
        max: config.database.maxConnections,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
        ssl: config.database.ssl ? { rejectUnauthorized: false } : false
      });

      // Test connection
      await this.testConnection();
      
      // Setup event handlers
      this.setupEventHandlers();
      
      this.isConnected = true;
      this.retryAttempts = 0;
      
      logger.info('✅ Database connection established', {
        host: config.database.host,
        database: config.database.name,
        maxConnections: config.database.maxConnections
      });
      
    } catch (error) {
      logger.error('❌ Database connection failed:', error);
      await this.handleConnectionError(error);
    }
  }

  /**
   * Test database connection
   */
  async testConnection() {
    const client = await this.pool.connect();
    try {
      const result = await client.query('SELECT NOW() as now, version() as version');
      logger.debug('🔍 Database connection test successful:', {
        timestamp: result.rows[0].now,
        version: result.rows[0].version.split(' ')[0]
      });
    } finally {
      client.release();
    }
  }

  /**
   * Setup database event handlers
   */
  setupEventHandlers() {
    this.pool.on('connect', (client) => {
      logger.debug('🔗 New database client connected');
    });

    this.pool.on('acquire', (client) => {
      logger.debug('🎯 Database client acquired from pool');
    });

    this.pool.on('remove', (client) => {
      logger.debug('🗑️ Database client removed from pool');
    });

    this.pool.on('error', (error, client) => {
      logger.error('❌ Database pool error:', error);
      this.handleConnectionError(error);
    });
  }

  /**
   * Handle connection errors with retry logic
   */
  async handleConnectionError(error) {
    this.isConnected = false;
    this.retryAttempts++;

    if (this.retryAttempts <= this.maxRetries) {
      logger.warn(`🔄 Retrying database connection (${this.retryAttempts}/${this.maxRetries})`);
      
      setTimeout(() => {
        this.initialize();
      }, this.retryDelay * this.retryAttempts);
    } else {
      logger.error('💥 Max database connection retries exceeded');
      process.exit(1);
    }
  }

  /**
   * Execute a query
   */
  async query(text, params = []) {
    if (!this.isConnected || !this.pool) {
      throw new Error('Database not connected');
    }

    const start = Date.now();
    const client = await this.pool.connect();
    
    try {
      const result = await client.query(text, params);
      const duration = Date.now() - start;
      
      if (config.development.debugMode) {
        logger.debug('📊 Database query executed:', {
          query: text.substring(0, 100),
          params: params.length,
          rows: result.rowCount,
          duration: `${duration}ms`
        });
      }
      
      return result;
    } catch (error) {
      logger.error('❌ Database query error:', {
        query: text,
        params,
        error: error.message
      });
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Execute a transaction
   */
  async transaction(callback) {
    if (!this.isConnected || !this.pool) {
      throw new Error('Database not connected');
    }

    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('❌ Transaction rolled back:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get connection pool statistics
   */
  getPoolStats() {
    if (!this.pool) {
      return null;
    }

    return {
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount,
      isConnected: this.isConnected
    };
  }

  /**
   * Close database connection
   */
  async close() {
    if (this.pool) {
      await this.pool.end();
      this.isConnected = false;
      logger.info('🔐 Database connection closed');
    }
  }

  /**
   * Check if database is healthy
   */
  async healthCheck() {
    try {
      await this.query('SELECT 1');
      return {
        status: 'healthy',
        connected: this.isConnected,
        poolStats: this.getPoolStats()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        connected: false,
        error: error.message
      };
    }
  }
}

// Create singleton instance
const database = new DatabaseConnection();

/**
 * Initialize database connection
 */
export const initializeDatabase = async () => {
  await database.initialize();
};

/**
 * Export database instance
 */
export { database };
export default database;