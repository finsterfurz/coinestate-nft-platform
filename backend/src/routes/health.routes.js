const express = require('express');
const mongoose = require('mongoose');
const redis = require('../config/redis');

const router = express.Router();

/**
 * @desc    Health check endpoint
 * @route   GET /api/v1/health
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const health = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: 'unknown',
        redis: 'unknown'
      },
      memory: {
        used: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100,
        total: Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) / 100
      }
    };

    // Check database connection
    try {
      const dbState = mongoose.connection.readyState;
      health.services.database = dbState === 1 ? 'connected' : 'disconnected';
    } catch (error) {
      health.services.database = 'error';
    }

    // Check Redis connection
    try {
      if (redis && redis.status === 'ready') {
        health.services.redis = 'connected';
      } else {
        health.services.redis = 'disconnected';
      }
    } catch (error) {
      health.services.redis = 'error';
    }

    // Determine overall status
    const isHealthy = health.services.database === 'connected' && 
                     health.services.redis === 'connected';
    
    if (!isHealthy) {
      health.status = 'DEGRADED';
    }

    const statusCode = isHealthy ? 200 : 503;
    res.status(statusCode).json(health);

  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

/**
 * @desc    Readiness check endpoint
 * @route   GET /api/v1/health/ready
 * @access  Public
 */
router.get('/ready', async (req, res) => {
  try {
    // Check if all required services are ready
    const checks = [];

    // Database check
    checks.push(new Promise((resolve) => {
      const dbState = mongoose.connection.readyState;
      resolve({
        service: 'database',
        status: dbState === 1 ? 'ready' : 'not_ready',
        details: {
          state: dbState,
          host: mongoose.connection.host,
          name: mongoose.connection.name
        }
      });
    }));

    // Redis check
    checks.push(new Promise((resolve) => {
      try {
        resolve({
          service: 'redis',
          status: redis && redis.status === 'ready' ? 'ready' : 'not_ready',
          details: {
            status: redis ? redis.status : 'unavailable'
          }
        });
      } catch (error) {
        resolve({
          service: 'redis',
          status: 'error',
          details: { error: error.message }
        });
      }
    }));

    const results = await Promise.all(checks);
    const allReady = results.every(result => result.status === 'ready');

    const response = {
      ready: allReady,
      timestamp: new Date().toISOString(),
      checks: results
    };

    res.status(allReady ? 200 : 503).json(response);

  } catch (error) {
    res.status(500).json({
      ready: false,
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

/**
 * @desc    Liveness check endpoint
 * @route   GET /api/v1/health/live
 * @access  Public
 */
router.get('/live', (req, res) => {
  res.status(200).json({
    alive: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    pid: process.pid
  });
});

module.exports = router;