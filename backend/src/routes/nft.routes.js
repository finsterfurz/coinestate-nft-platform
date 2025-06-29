const express = require('express');
const { body, query, param } = require('express-validator');
const nftController = require('../controllers/nft.controller');
const { protect, authorize } = require('../middleware/auth');
const cache = require('../middleware/cache');

const router = express.Router();

// Validation rules
const mintNFTValidation = [
  body('propertyId')
    .isMongoId()
    .withMessage('Invalid property ID format'),
  
  body('totalShares')
    .isInt({ min: 1, max: 10000000 })
    .withMessage('Total shares must be between 1 and 10,000,000'),
  
  body('pricePerShare')
    .isFloat({ min: 0.01 })
    .withMessage('Price per share must be greater than 0.01'),
  
  body('metadata.name')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('NFT name must be between 3 and 100 characters'),
  
  body('metadata.description')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('NFT description must be between 10 and 500 characters'),
  
  body('metadata.image')
    .isURL()
    .withMessage('Image must be a valid URL'),
  
  body('metadata.attributes')
    .optional()
    .isArray()
    .withMessage('Attributes must be an array')
];

const purchaseNFTValidation = [
  body('quantity')
    .isInt({ min: 1, max: 1000000 })
    .withMessage('Quantity must be between 1 and 1,000,000'),
  
  body('paymentMethod')
    .isIn(['crypto', 'fiat', 'wallet'])
    .withMessage('Payment method must be crypto, fiat, or wallet')
];

const transferNFTValidation = [
  body('recipientAddress')
    .isEthereumAddress()
    .withMessage('Invalid Ethereum address'),
  
  body('quantity')
    .isInt({ min: 1, max: 1000000 })
    .withMessage('Quantity must be between 1 and 1,000,000')
];

const updateMetadataValidation = [
  body('metadata.name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('NFT name must be between 3 and 100 characters'),
  
  body('metadata.description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('NFT description must be between 10 and 500 characters'),
  
  body('metadata.image')
    .optional()
    .isURL()
    .withMessage('Image must be a valid URL'),
  
  body('metadata.attributes')
    .optional()
    .isArray()
    .withMessage('Attributes must be an array')
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
    .isIn(['createdAt', 'updatedAt', 'price', 'quantity', 'shares'])
    .withMessage('Invalid sort field'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  
  query('status')
    .optional()
    .isIn(['available', 'sold_out', 'inactive'])
    .withMessage('Invalid status')
];

const nftIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid NFT ID format')
];

// Public routes
router.get(
  '/',
  queryValidation,
  cache('5m'),
  nftController.getNFTs
);

router.get(
  '/market/stats',
  query('timeframe')
    .optional()
    .isIn(['1h', '24h', '7d', '30d'])
    .withMessage('Timeframe must be 1h, 24h, 7d, or 30d'),
  cache('10m'),
  nftController.getMarketStats
);

router.get(
  '/:id',
  nftIdValidation,
  cache('2m'),
  nftController.getNFT
);

router.get(
  '/:id/transactions',
  nftIdValidation,
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('type')
    .optional()
    .isIn(['mint', 'purchase', 'transfer', 'sale'])
    .withMessage('Invalid transaction type'),
  
  cache('1m'),
  nftController.getNFTTransactions
);

// Protected routes
router.use(protect);

// User routes
router.get(
  '/portfolio',
  queryValidation,
  nftController.getUserPortfolio
);

router.post(
  '/:id/purchase',
  nftIdValidation,
  purchaseNFTValidation,
  nftController.purchaseNFT
);

router.post(
  '/:id/transfer',
  nftIdValidation,
  transferNFTValidation,
  nftController.transferNFT
);

// Admin/Manager only routes
router.post(
  '/mint',
  authorize('admin', 'manager'),
  mintNFTValidation,
  nftController.mintNFTs
);

router.put(
  '/:id/metadata',
  authorize('admin', 'manager', 'user'),
  nftIdValidation,
  updateMetadataValidation,
  nftController.updateNFTMetadata
);

module.exports = router;