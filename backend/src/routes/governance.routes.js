const express = require('express');
const { body, query, param } = require('express-validator');
const governanceController = require('../controllers/governance.controller');
const { protect, authorize } = require('../middleware/auth');
const cache = require('../middleware/cache');

const router = express.Router();

// Validation rules
const createProposalValidation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 20, max: 2000 })
    .withMessage('Description must be between 20 and 2000 characters'),
  
  body('type')
    .isIn(['property_management', 'financial', 'governance', 'technical', 'other'])
    .withMessage('Invalid proposal type'),
  
  body('propertyId')
    .optional()
    .isMongoId()
    .withMessage('Invalid property ID format'),
  
  body('actions')
    .isArray({ min: 1 })
    .withMessage('Actions must be a non-empty array'),
  
  body('actions.*.target')
    .isEthereumAddress()
    .withMessage('Action target must be a valid Ethereum address'),
  
  body('actions.*.value')
    .isFloat({ min: 0 })
    .withMessage('Action value must be non-negative'),
  
  body('actions.*.signature')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Action signature must be between 1 and 200 characters'),
  
  body('votingDelay')
    .optional()
    .isInt({ min: 0, max: 604800 }) // Max 7 days in seconds
    .withMessage('Voting delay must be between 0 and 604800 seconds'),
  
  body('votingPeriod')
    .optional()
    .isInt({ min: 3600, max: 2592000 }) // Min 1 hour, Max 30 days
    .withMessage('Voting period must be between 1 hour and 30 days'),
  
  body('quorumThreshold')
    .optional()
    .isFloat({ min: 0.01, max: 1 })
    .withMessage('Quorum threshold must be between 0.01 and 1'),
  
  body('approvalThreshold')
    .optional()
    .isFloat({ min: 0.5, max: 1 })
    .withMessage('Approval threshold must be between 0.5 and 1')
];

const voteValidation = [
  body('support')
    .isIn(['for', 'against', 'abstain'])
    .withMessage('Support must be for, against, or abstain'),
  
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Reason must not exceed 500 characters')
];

const delegateValidation = [
  body('delegateAddress')
    .isEthereumAddress()
    .withMessage('Invalid delegate Ethereum address'),
  
  body('propertyId')
    .isMongoId()
    .withMessage('Invalid property ID format')
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
  
  query('status')
    .optional()
    .isIn(['pending', 'active', 'succeeded', 'defeated', 'queued', 'executed', 'cancelled'])
    .withMessage('Invalid status'),
  
  query('type')
    .optional()
    .isIn(['property_management', 'financial', 'governance', 'technical', 'other'])
    .withMessage('Invalid proposal type'),
  
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'endTime', 'title', 'votesFor', 'votesAgainst'])
    .withMessage('Invalid sort field'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
];

const proposalIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid proposal ID format')
];

const propertyIdValidation = [
  param('propertyId')
    .isMongoId()
    .withMessage('Invalid property ID format')
];

// Public routes
router.get(
  '/proposals',
  queryValidation,
  cache('5m'),
  governanceController.getProposals
);

router.get(
  '/proposals/:id',
  proposalIdValidation,
  cache('1m'),
  governanceController.getProposal
);

router.get(
  '/proposals/:id/votes',
  proposalIdValidation,
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('support')
    .optional()
    .isIn(['for', 'against', 'abstain'])
    .withMessage('Support filter must be for, against, or abstain'),
  
  cache('2m'),
  governanceController.getProposalVotes
);

router.get(
  '/analytics',
  query('propertyId')
    .optional()
    .isMongoId()
    .withMessage('Invalid property ID format'),
  
  query('timeframe')
    .optional()
    .isIn(['7d', '30d', '90d', '1y'])
    .withMessage('Timeframe must be 7d, 30d, 90d, or 1y'),
  
  cache('15m'),
  governanceController.getGovernanceAnalytics
);

// Protected routes
router.use(protect);

// NFT Holder routes (require token ownership)
router.post(
  '/proposals',
  authorize('user', 'manager', 'admin'),
  createProposalValidation,
  governanceController.createProposal
);

router.post(
  '/proposals/:id/vote',
  authorize('user', 'manager', 'admin'),
  proposalIdValidation,
  voteValidation,
  governanceController.voteOnProposal
);

router.get(
  '/voting-power/:propertyId',
  authorize('user', 'manager', 'admin'),
  propertyIdValidation,
  governanceController.getVotingPower
);

router.post(
  '/delegate',
  authorize('user', 'manager', 'admin'),
  delegateValidation,
  governanceController.delegateVotingPower
);

router.get(
  '/history',
  authorize('user', 'manager', 'admin'),
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
    .isIn(['proposal', 'vote', 'delegation'])
    .withMessage('Type must be proposal, vote, or delegation'),
  
  governanceController.getGovernanceHistory
);

// Admin/DAO execution routes
router.post(
  '/proposals/:id/execute',
  authorize('admin', 'dao'),
  proposalIdValidation,
  governanceController.executeProposal
);

module.exports = router;