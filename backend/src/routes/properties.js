/**
 * CoinEstate Backend - Property Routes
 * Real estate property management endpoints
 */

import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validate } from '../utils/validation.js';
import { propertySchemas } from '../utils/validation.js';
import { authenticate, optionalAuth, requireVerified } from '../middleware/auth.js';
import { userRateLimit } from '../middleware/security.js';
import * as propertyController from '../controllers/propertyController.js';

const router = express.Router();

/**
 * @swagger
 * /api/v1/properties:
 *   get:
 *     tags: [Properties]
 *     summary: Get all properties
 *     description: Retrieve a list of all properties with filtering and pagination
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [upcoming, minting, active, completed, sold]
 *       - in: query
 *         name: propertyType
 *         schema:
 *           type: string
 *           enum: [residential, commercial, mixed_use, industrial]
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *       - in: query
 *         name: minValue
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxValue
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Properties retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     properties:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Property'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 */
router.get('/',
  optionalAuth,
  validate(propertySchemas.filter, 'query'),
  asyncHandler(propertyController.getAllProperties)
);

/**
 * @swagger
 * /api/v1/properties/{id}:
 *   get:
 *     tags: [Properties]
 *     summary: Get property by ID
 *     description: Retrieve detailed information about a specific property
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Property retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/PropertyDetails'
 */
router.get('/:id',
  optionalAuth,
  validate({ id: require('joi').string().uuid().required() }, 'params'),
  asyncHandler(propertyController.getPropertyById)
);

/**
 * @swagger
 * /api/v1/properties:
 *   post:
 *     tags: [Properties]
 *     summary: Create new property
 *     description: Create a new real estate property (admin only)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePropertyRequest'
 *     responses:
 *       201:
 *         description: Property created successfully
 */
router.post('/',
  authenticate,
  requireVerified,
  userRateLimit(15 * 60 * 1000, 5), // 5 requests per 15 minutes
  validate(propertySchemas.create),
  asyncHandler(propertyController.createProperty)
);

/**
 * @swagger
 * /api/v1/properties/{id}:
 *   put:
 *     tags: [Properties]
 *     summary: Update property
 *     description: Update property information (admin only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePropertyRequest'
 *     responses:
 *       200:
 *         description: Property updated successfully
 */
router.put('/:id',
  authenticate,
  requireVerified,
  userRateLimit(15 * 60 * 1000, 10), // 10 requests per 15 minutes
  validate({ id: require('joi').string().uuid().required() }, 'params'),
  validate(propertySchemas.update),
  asyncHandler(propertyController.updateProperty)
);

/**
 * @swagger
 * /api/v1/properties/{id}:
 *   delete:
 *     tags: [Properties]
 *     summary: Delete property
 *     description: Delete a property (admin only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Property deleted successfully
 */
router.delete('/:id',
  authenticate,
  requireVerified,
  userRateLimit(15 * 60 * 1000, 3), // 3 requests per 15 minutes
  validate({ id: require('joi').string().uuid().required() }, 'params'),
  asyncHandler(propertyController.deleteProperty)
);

/**
 * @swagger
 * /api/v1/properties/{id}/metrics:
 *   get:
 *     tags: [Properties]
 *     summary: Get property metrics
 *     description: Retrieve performance metrics for a property
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Property metrics retrieved successfully
 */
router.get('/:id/metrics',
  optionalAuth,
  validate({ id: require('joi').string().uuid().required() }, 'params'),
  validate({
    startDate: require('joi').date().iso().optional(),
    endDate: require('joi').date().iso().optional()
  }, 'query'),
  asyncHandler(propertyController.getPropertyMetrics)
);

/**
 * @swagger
 * /api/v1/properties/{id}/nfts:
 *   get:
 *     tags: [Properties]
 *     summary: Get property NFTs
 *     description: Retrieve all NFTs associated with a property
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *     responses:
 *       200:
 *         description: Property NFTs retrieved successfully
 */
router.get('/:id/nfts',
  optionalAuth,
  validate({ id: require('joi').string().uuid().required() }, 'params'),
  validate({
    page: require('joi').number().integer().min(1).default(1),
    limit: require('joi').number().integer().min(1).max(100).default(20)
  }, 'query'),
  asyncHandler(propertyController.getPropertyNFTs)
);

/**
 * @swagger
 * /api/v1/properties/{id}/stakeholders:
 *   get:
 *     tags: [Properties]
 *     summary: Get property stakeholders
 *     description: Retrieve all stakeholders (NFT holders) for a property
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Property stakeholders retrieved successfully
 */
router.get('/:id/stakeholders',
  authenticate,
  validate({ id: require('joi').string().uuid().required() }, 'params'),
  asyncHandler(propertyController.getPropertyStakeholders)
);

/**
 * @swagger
 * /api/v1/properties/{id}/income-history:
 *   get:
 *     tags: [Properties]
 *     summary: Get property income history
 *     description: Retrieve income distribution history for a property
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 12
 *     responses:
 *       200:
 *         description: Property income history retrieved successfully
 */
router.get('/:id/income-history',
  authenticate,
  validate({ id: require('joi').string().uuid().required() }, 'params'),
  validate({
    page: require('joi').number().integer().min(1).default(1),
    limit: require('joi').number().integer().min(1).max(100).default(12)
  }, 'query'),
  asyncHandler(propertyController.getPropertyIncomeHistory)
);

export default router;