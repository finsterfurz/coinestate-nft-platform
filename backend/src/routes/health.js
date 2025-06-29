/**
 * CoinEstate Backend - Health Check Routes
 * System health monitoring endpoints
 */

import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import * as healthController from '../controllers/healthController.js';

const router = express.Router();

/**
 * @swagger
 * /api/v1/health:
 *   get:
 *     tags: [Health]
 *     summary: Basic health check
 *     description: Check if the API is running
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: healthy
 *                 timestamp:
 *                   type: string
 *                   example: '2024-12-21T10:30:00.000Z'
 *                 uptime:
 *                   type: number
 *                   example: 3600.123
 *                 version:
 *                   type: string
 *                   example: v1
 */
router.get('/', asyncHandler(healthController.basicHealthCheck));

/**
 * @swagger
 * /api/v1/health/detailed:
 *   get:
 *     tags: [Health]
 *     summary: Detailed health check
 *     description: Comprehensive system health including database, Redis, and services
 *     responses:
 *       200:
 *         description: Detailed health information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 services:
 *                   type: object
 */
router.get('/detailed', asyncHandler(healthController.detailedHealthCheck));

/**
 * @swagger
 * /api/v1/health/readiness:
 *   get:
 *     tags: [Health]
 *     summary: Readiness probe
 *     description: Check if the application is ready to serve requests
 *     responses:
 *       200:
 *         description: Application is ready
 *       503:
 *         description: Application is not ready
 */
router.get('/readiness', asyncHandler(healthController.readinessCheck));

/**
 * @swagger
 * /api/v1/health/liveness:
 *   get:
 *     tags: [Health]
 *     summary: Liveness probe
 *     description: Check if the application is alive
 *     responses:
 *       200:
 *         description: Application is alive
 */
router.get('/liveness', asyncHandler(healthController.livenessCheck));

export default router;