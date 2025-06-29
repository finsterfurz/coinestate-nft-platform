const express = require('express');
const { body, query, param } = require('express-validator');
const propertyController = require('../controllers/property.controller');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const cache = require('../middleware/cache');

const router = express.Router();

// Validation rules
const createPropertyValidation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('currency')
    .isIn(['USD', 'EUR', 'ETH', 'BTC'])
    .withMessage('Currency must be USD, EUR, ETH, or BTC'),
  
  body('category')
    .isIn(['residential', 'commercial', 'industrial', 'land', 'mixed'])
    .withMessage('Invalid category'),
  
  body('location.address')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Address must be between 5 and 200 characters'),
  
  body('location.city')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters'),
  
  body('location.country')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Country must be between 2 and 100 characters'),
  
  body('location.coordinates.lat')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  
  body('location.coordinates.lng')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  
  body('details.bedrooms')
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage('Bedrooms must be between 0 and 50'),
  
  body('details.bathrooms')
    .optional()
    .isFloat({ min: 0, max: 50 })
    .withMessage('Bathrooms must be between 0 and 50'),
  
  body('details.area')
    .isFloat({ min: 1 })
    .withMessage('Area must be greater than 0'),
  
  body('details.yearBuilt')
    .optional()
    .isInt({ min: 1800, max: new Date().getFullYear() + 5 })
    .withMessage('Year built must be between 1800 and current year + 5'),
  
  body('nft.totalShares')
    .isInt({ min: 1, max: 10000000 })
    .withMessage('Total shares must be between 1 and 10,000,000'),
  
  body('nft.pricePerShare')
    .isFloat({ min: 0.01 })
    .withMessage('Price per share must be greater than 0.01'),
  
  body('status')
    .optional()
    .isIn(['draft', 'active', 'sold', 'inactive'])
    .withMessage('Invalid status')
];

const updatePropertyValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('currency')
    .optional()
    .isIn(['USD', 'EUR', 'ETH', 'BTC'])
    .withMessage('Currency must be USD, EUR, ETH, or BTC'),
  
  body('category')
    .optional()
    .isIn(['residential', 'commercial', 'industrial', 'land', 'mixed'])
    .withMessage('Invalid category'),
  
  body('status')
    .optional()
    .isIn(['draft', 'active', 'sold', 'inactive'])
    .withMessage('Invalid status')
];

const queryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('priceMin')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be positive'),
  
  query('priceMax')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be positive'),
  
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'price', 'title', 'location'])
    .withMessage('Invalid sort field'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
];

const propertyIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid property ID format')
];

const searchValidation = [
  query('query')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  
  ...queryValidation
];

// Public routes
router.get(
  '/',
  queryValidation,
  cache('15m'),
  propertyController.getProperties
);

router.get(
  '/search',
  searchValidation,
  cache('10m'),
  propertyController.searchProperties
);

router.get(
  '/:id',
  propertyIdValidation,
  cache('5m'),
  propertyController.getProperty
);

// Protected routes
router.use(protect);

// Admin/Manager only routes
router.post(
  '/',
  authorize('admin', 'manager'),
  createPropertyValidation,
  propertyController.createProperty
);

router.put(
  '/:id',
  authorize('admin', 'manager', 'user'),
  propertyIdValidation,
  updatePropertyValidation,
  propertyController.updateProperty
);

router.delete(
  '/:id',
  authorize('admin', 'manager'),
  propertyIdValidation,
  propertyController.deleteProperty
);

// Analytics (property owners and admins)
router.get(
  '/:id/analytics',
  authorize('admin', 'manager', 'user'),
  propertyIdValidation,
  query('timeframe')
    .optional()
    .isIn(['7d', '30d', '90d', '1y'])
    .withMessage('Timeframe must be 7d, 30d, 90d, or 1y'),
  propertyController.getPropertyAnalytics
);

// Image upload (property owners and admins)
router.post(
  '/:id/images',
  authorize('admin', 'manager', 'user'),
  propertyIdValidation,
  upload.array('images', 10), // Maximum 10 images
  propertyController.uploadPropertyImages
);

module.exports = router;