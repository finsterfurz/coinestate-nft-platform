/**
 * CoinEstate Backend - Redis Service
 * Redis connection and caching utilities
 */

import Redis from 'ioredis';
import { config } from '../config/index.js';
import logger from '../utils/logger.js';

class RedisService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.retryAttempts = 0;
    this.maxRetries = 5;
    this.retryDelay = 2000;
  }

  /**
   * Initialize Redis connection
   */
  async initialize() {
    try {
      this.client = new Redis({
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password || undefined,
        db: config.redis.db,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        keepAlive: 30000,
        family: 4,
        connectionName: 'coinestate-api'
      });

      // Setup event handlers
      this.setupEventHandlers();
      
      // Connect to Redis
      await this.client.connect();
      
      this.isConnected = true;
      this.retryAttempts = 0;
      
      logger.info('✅ Redis connection established', {
        host: config.redis.host,
        port: config.redis.port,
        db: config.redis.db
      });
      
    } catch (error) {
      logger.error('❌ Redis connection failed:', error);
      await this.handleConnectionError(error);
    }
  }

  /**
   * Setup Redis event handlers
   */
  setupEventHandlers() {
    this.client.on('connect', () => {
      logger.debug('🔗 Redis client connected');
    });

    this.client.on('ready', () => {
      logger.debug('✅ Redis client ready');
      this.isConnected = true;
    });

    this.client.on('error', (error) => {
      logger.error('❌ Redis client error:', error);
      this.isConnected = false;
    });

    this.client.on('close', () => {
      logger.warn('🔌 Redis connection closed');
      this.isConnected = false;
    });

    this.client.on('reconnecting', (delay) => {
      logger.info(`🔄 Redis reconnecting in ${delay}ms`);
    });
  }

  /**
   * Handle connection errors with retry logic
   */
  async handleConnectionError(error) {
    this.isConnected = false;
    this.retryAttempts++;

    if (this.retryAttempts <= this.maxRetries) {
      logger.warn(`🔄 Retrying Redis connection (${this.retryAttempts}/${this.maxRetries})`);
      
      setTimeout(() => {
        this.initialize();
      }, this.retryDelay * this.retryAttempts);
    } else {
      logger.error('💥 Max Redis connection retries exceeded');
      // Don't exit process for Redis failures
    }
  }

  /**
   * Get Redis client
   */
  getClient() {
    return this.client;
  }

  /**
   * Set key with optional expiration
   */
  async set(key, value, ttl = null) {
    try {
      const serializedValue = JSON.stringify(value);
      
      if (ttl) {
        return await this.client.setex(key, ttl, serializedValue);
      } else {
        return await this.client.set(key, serializedValue);
      }
    } catch (error) {
      logger.error('Redis SET error:', { key, error: error.message });
      return null;
    }
  }

  /**
   * Set key with expiration in seconds
   */
  async setex(key, seconds, value) {
    try {
      const serializedValue = JSON.stringify(value);
      return await this.client.setex(key, seconds, serializedValue);
    } catch (error) {
      logger.error('Redis SETEX error:', { key, seconds, error: error.message });
      return null;
    }
  }

  /**
   * Get value by key
   */
  async get(key) {
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Redis GET error:', { key, error: error.message });
      return null;
    }
  }

  /**
   * Delete key(s)
   */
  async del(...keys) {
    try {
      return await this.client.del(...keys);
    } catch (error) {
      logger.error('Redis DEL error:', { keys, error: error.message });
      return 0;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key) {
    try {
      return await this.client.exists(key);
    } catch (error) {
      logger.error('Redis EXISTS error:', { key, error: error.message });
      return 0;
    }
  }

  /**
   * Set expiration for key
   */
  async expire(key, seconds) {
    try {
      return await this.client.expire(key, seconds);
    } catch (error) {
      logger.error('Redis EXPIRE error:', { key, seconds, error: error.message });
      return 0;
    }
  }

  /**
   * Get time to live for key
   */
  async ttl(key) {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      logger.error('Redis TTL error:', { key, error: error.message });
      return -1;
    }
  }

  /**
   * Increment key value
   */
  async incr(key) {
    try {
      return await this.client.incr(key);
    } catch (error) {
      logger.error('Redis INCR error:', { key, error: error.message });
      return 0;
    }
  }

  /**
   * Cache with automatic expiration and cache-aside pattern
   */
  async cache(key, dataFunction, ttl = config.redis.ttl) {
    try {
      // Try to get from cache first
      const cached = await this.get(key);
      if (cached !== null) {
        logger.debug('Cache hit', { key });
        return cached;
      }
      
      // Cache miss - get fresh data
      logger.debug('Cache miss', { key });
      const data = await dataFunction();
      
      // Store in cache with TTL
      await this.setex(key, ttl, data);
      
      return data;
    } catch (error) {
      logger.error('Cache operation error:', { key, error: error.message });
      // Fallback to direct data function call
      return await dataFunction();
    }
  }

  /**
   * Invalidate cache keys by pattern
   */
  async invalidatePattern(pattern) {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.del(...keys);
        logger.debug('Cache invalidated', { pattern, count: keys.length });
      }
      return keys.length;
    } catch (error) {
      logger.error('Cache invalidation error:', { pattern, error: error.message });
      return 0;
    }
  }

  /**
   * Distributed lock implementation
   */
  async acquireLock(key, ttl = 10, retries = 3) {
    const lockKey = `lock:${key}`;
    const lockValue = `${Date.now()}-${Math.random()}`;
    
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const result = await this.client.set(lockKey, lockValue, 'EX', ttl, 'NX');
        if (result === 'OK') {
          logger.debug('Lock acquired', { key, attempt });
          return lockValue;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 100));
      } catch (error) {
        logger.error('Lock acquisition error:', { key, attempt, error: error.message });
      }
    }
    
    logger.warn('Failed to acquire lock', { key, retries });
    return null;
  }

  /**
   * Release distributed lock
   */
  async releaseLock(key, lockValue) {
    const lockKey = `lock:${key}`;
    
    try {
      // Use Lua script to ensure atomicity
      const script = `
        if redis.call("get", KEYS[1]) == ARGV[1] then
          return redis.call("del", KEYS[1])
        else
          return 0
        end
      `;
      
      const result = await this.client.eval(script, 1, lockKey, lockValue);
      logger.debug('Lock release result', { key, result });
      return result === 1;
    } catch (error) {
      logger.error('Lock release error:', { key, error: error.message });
      return false;
    }
  }

  /**
   * Pub/Sub operations
   */
  async publish(channel, message) {
    try {
      const serializedMessage = JSON.stringify(message);
      return await this.client.publish(channel, serializedMessage);
    } catch (error) {
      logger.error('Redis PUBLISH error:', { channel, error: error.message });
      return 0;
    }
  }

  async subscribe(channel, callback) {
    try {
      const subscriber = this.client.duplicate();
      await subscriber.subscribe(channel);
      
      subscriber.on('message', (receivedChannel, message) => {
        if (receivedChannel === channel) {
          try {
            const parsedMessage = JSON.parse(message);
            callback(parsedMessage);
          } catch (error) {
            logger.error('Message parsing error:', { channel, error: error.message });
            callback(message);
          }
        }
      });
      
      return subscriber;
    } catch (error) {
      logger.error('Redis SUBSCRIBE error:', { channel, error: error.message });
      return null;
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const start = Date.now();
      await this.client.ping();
      const responseTime = Date.now() - start;
      
      return {
        status: 'healthy',
        connected: this.isConnected,
        responseTime: `${responseTime}ms`,
        memory: await this.client.memory('usage'),
        connections: await this.client.info('clients')
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        connected: false,
        error: error.message
      };
    }
  }

  /**
   * Close Redis connection
   */
  async close() {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
      logger.info('🔐 Redis connection closed');
    }
  }
}

// Create singleton instance
const redis = new RedisService();

/**
 * Initialize Redis connection
 */
export const initializeRedis = async () => {
  await redis.initialize();
};

/**
 * Export Redis instance
 */
export { redis };
export default redis;