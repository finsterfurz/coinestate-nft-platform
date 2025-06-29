/**
 * CoinEstate Backend - Health Controller
 * System health monitoring and diagnostics
 */

import { config } from '../config/index.js';
import { database } from '../database/connection.js';
import { redis } from '../services/redis.js';
import { blockchain } from '../services/blockchain.js';
import { queueService } from '../services/queue.js';
import logger from '../utils/logger.js';

/**
 * Basic health check
 */
export const basicHealthCheck = async (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
    version: config.apiVersion,
    node: {
      version: process.version,
      platform: process.platform,
      arch: process.arch
    },
    memory: {
      used: process.memoryUsage().heapUsed,
      total: process.memoryUsage().heapTotal,
      external: process.memoryUsage().external,
      rss: process.memoryUsage().rss
    }
  });
};

/**
 * Detailed health check
 */
export const detailedHealthCheck = async (req, res) => {
  const startTime = Date.now();
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
    version: config.apiVersion,
    services: {},
    checks: []
  };

  let overallHealthy = true;

  // Database health check
  try {
    const dbHealth = await database.healthCheck();
    healthData.services.database = dbHealth;
    healthData.checks.push({
      name: 'database',
      status: dbHealth.status,
      responseTime: dbHealth.responseTime
    });
    
    if (dbHealth.status !== 'healthy') {
      overallHealthy = false;
    }
  } catch (error) {
    healthData.services.database = {
      status: 'unhealthy',
      error: error.message
    };
    healthData.checks.push({
      name: 'database',
      status: 'unhealthy',
      error: error.message
    });
    overallHealthy = false;
  }

  // Redis health check
  try {
    const redisHealth = await redis.healthCheck();
    healthData.services.redis = redisHealth;
    healthData.checks.push({
      name: 'redis',
      status: redisHealth.status,
      responseTime: redisHealth.responseTime
    });
    
    if (redisHealth.status !== 'healthy') {
      overallHealthy = false;
    }
  } catch (error) {
    healthData.services.redis = {
      status: 'unhealthy',
      error: error.message
    };
    healthData.checks.push({
      name: 'redis',
      status: 'unhealthy',
      error: error.message
    });
    overallHealthy = false;
  }

  // Blockchain health check
  if (!config.development.mockBlockchain) {
    try {
      const blockchainHealth = await blockchain.healthCheck();
      healthData.services.blockchain = blockchainHealth;
      healthData.checks.push({
        name: 'blockchain',
        status: blockchainHealth.status,
        blockNumber: blockchainHealth.blockNumber
      });
      
      if (blockchainHealth.status !== 'healthy') {
        overallHealthy = false;
      }
    } catch (error) {
      healthData.services.blockchain = {
        status: 'unhealthy',
        error: error.message
      };
      healthData.checks.push({
        name: 'blockchain',
        status: 'unhealthy',
        error: error.message
      });
      overallHealthy = false;
    }
  } else {
    healthData.services.blockchain = {
      status: 'mocked',
      message: 'Using mock blockchain service'
    };
    healthData.checks.push({
      name: 'blockchain',
      status: 'mocked'
    });
  }

  // Queue service health check
  try {
    const queueStats = await queueService.getAllQueueStats();
    healthData.services.queues = {
      status: 'healthy',
      stats: queueStats
    };
    healthData.checks.push({
      name: 'queues',
      status: 'healthy',
      totalQueues: Object.keys(queueStats).length
    });
  } catch (error) {
    healthData.services.queues = {
      status: 'unhealthy',
      error: error.message
    };
    healthData.checks.push({
      name: 'queues',
      status: 'unhealthy',
      error: error.message
    });
    overallHealthy = false;
  }

  // System metrics
  healthData.system = {
    platform: process.platform,
    arch: process.arch,
    nodeVersion: process.version,
    cpuUsage: process.cpuUsage(),
    memoryUsage: process.memoryUsage(),
    loadAverage: process.platform !== 'win32' ? require('os').loadavg() : null,
    freeMem: require('os').freemem(),
    totalMem: require('os').totalmem()
  };

  // Performance metrics
  const responseTime = Date.now() - startTime;
  healthData.performance = {
    responseTime: `${responseTime}ms`,
    checksCompleted: healthData.checks.length
  };

  // Set overall status
  healthData.status = overallHealthy ? 'healthy' : 'unhealthy';

  // Return appropriate status code
  const statusCode = overallHealthy ? 200 : 503;
  res.status(statusCode).json(healthData);
};

/**
 * Readiness probe for Kubernetes
 */
export const readinessCheck = async (req, res) => {
  try {
    // Check critical services
    const dbHealthy = await checkDatabaseReadiness();
    const redisHealthy = await checkRedisReadiness();
    
    if (dbHealthy && redisHealthy) {
      res.json({
        status: 'ready',
        timestamp: new Date().toISOString(),
        checks: {
          database: 'ready',
          redis: 'ready'
        }
      });
    } else {
      res.status(503).json({
        status: 'not ready',
        timestamp: new Date().toISOString(),
        checks: {
          database: dbHealthy ? 'ready' : 'not ready',
          redis: redisHealthy ? 'ready' : 'not ready'
        }
      });
    }
  } catch (error) {
    logger.error('Readiness check failed:', error);
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
};

/**
 * Liveness probe for Kubernetes
 */
export const livenessCheck = async (req, res) => {
  // Simple liveness check - if we can respond, we're alive
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    pid: process.pid
  });
};

/**
 * Helper functions
 */

/**
 * Check database readiness
 */
const checkDatabaseReadiness = async () => {
  try {
    await database.query('SELECT 1');
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Check Redis readiness
 */
const checkRedisReadiness = async () => {
  try {
    await redis.set('health_check', 'ok', 1);
    const result = await redis.get('health_check');
    return result === 'ok';
  } catch (error) {
    return false;
  }
};

export default {
  basicHealthCheck,
  detailedHealthCheck,
  readinessCheck,
  livenessCheck
};