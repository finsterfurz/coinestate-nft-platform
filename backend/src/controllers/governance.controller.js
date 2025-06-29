const { validationResult } = require('express-validator');
const governanceService = require('../services/governance.service');
const logger = require('../utils/logger');

/**
 * @desc    Get all proposals with pagination and filters
 * @route   GET /api/v1/governance/proposals
 * @access  Public
 */
const getProposals = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      page = 1,
      limit = 12,
      status,
      type,
      propertyId,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filters = {
      status,
      type,
      propertyId
    };

    const result = await governanceService.getProposals({
      page: parseInt(page),
      limit: parseInt(limit),
      filters,
      sortBy,
      sortOrder
    });

    res.json({
      success: true,
      data: result.proposals,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        pages: result.pages
      }
    });

  } catch (error) {
    logger.error('Error in getProposals:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * @desc    Get single proposal by ID
 * @route   GET /api/v1/governance/proposals/:id
 * @access  Public
 */
const getProposal = async (req, res) => {
  try {
    const { id } = req.params;
    
    const proposal = await governanceService.getProposalById(id);
    
    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: 'Proposal not found'
      });
    }

    res.json({
      success: true,
      data: proposal
    });

  } catch (error) {
    logger.error('Error in getProposal:', error);
    
    if (error.message === 'Invalid proposal ID format') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * @desc    Create new proposal
 * @route   POST /api/v1/governance/proposals
 * @access  Private (NFT Holders)
 */
const createProposal = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const proposalData = {
      ...req.body,
      proposedBy: req.user.id
    };

    const proposal = await governanceService.createProposal(proposalData, req.user);

    res.status(201).json({
      success: true,
      data: proposal,
      message: 'Proposal created successfully'
    });

  } catch (error) {
    logger.error('Error in createProposal:', error);
    
    if (error.message.includes('Insufficient voting power')) {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }

    if (error.message.includes('Duplicate proposal')) {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * @desc    Vote on a proposal
 * @route   POST /api/v1/governance/proposals/:id/vote
 * @access  Private (NFT Holders)
 */
const voteOnProposal = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { support, reason } = req.body;

    const vote = await governanceService.voteOnProposal({
      proposalId: id,
      voterId: req.user.id,
      support,
      reason
    });

    res.json({
      success: true,
      data: vote,
      message: 'Vote cast successfully'
    });

  } catch (error) {
    logger.error('Error in voteOnProposal:', error);
    
    if (error.message === 'Proposal not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    if (error.message.includes('Voting period has ended')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    if (error.message.includes('Already voted')) {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }

    if (error.message.includes('No voting power')) {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * @desc    Execute a proposal
 * @route   POST /api/v1/governance/proposals/:id/execute
 * @access  Private (Admin/DAO)
 */
const executeProposal = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await governanceService.executeProposal(id, req.user);

    res.json({
      success: true,
      data: result,
      message: 'Proposal executed successfully'
    });

  } catch (error) {
    logger.error('Error in executeProposal:', error);
    
    if (error.message === 'Proposal not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    if (error.message.includes('Cannot execute')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    if (error.message.includes('Unauthorized')) {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * @desc    Get user's voting power for a property
 * @route   GET /api/v1/governance/voting-power/:propertyId
 * @access  Private
 */
const getVotingPower = async (req, res) => {
  try {
    const { propertyId } = req.params;
    
    const votingPower = await governanceService.getVotingPower(req.user.id, propertyId);

    res.json({
      success: true,
      data: votingPower
    });

  } catch (error) {
    logger.error('Error in getVotingPower:', error);
    
    if (error.message === 'Property not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * @desc    Get proposal votes
 * @route   GET /api/v1/governance/proposals/:id/votes
 * @access  Public
 */
const getProposalVotes = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      page = 1,
      limit = 20,
      support,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const result = await governanceService.getProposalVotes({
      proposalId: id,
      page: parseInt(page),
      limit: parseInt(limit),
      support,
      sortBy,
      sortOrder
    });

    res.json({
      success: true,
      data: result.votes,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        pages: result.pages
      }
    });

  } catch (error) {
    logger.error('Error in getProposalVotes:', error);
    
    if (error.message === 'Proposal not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * @desc    Get governance analytics
 * @route   GET /api/v1/governance/analytics
 * @access  Public
 */
const getGovernanceAnalytics = async (req, res) => {
  try {
    const { propertyId, timeframe = '30d' } = req.query;
    
    const analytics = await governanceService.getGovernanceAnalytics({
      propertyId,
      timeframe
    });

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    logger.error('Error in getGovernanceAnalytics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * @desc    Delegate voting power
 * @route   POST /api/v1/governance/delegate
 * @access  Private
 */
const delegateVotingPower = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { delegateAddress, propertyId } = req.body;

    const delegation = await governanceService.delegateVotingPower({
      delegatorId: req.user.id,
      delegateAddress,
      propertyId
    });

    res.json({
      success: true,
      data: delegation,
      message: 'Voting power delegated successfully'
    });

  } catch (error) {
    logger.error('Error in delegateVotingPower:', error);
    
    if (error.message.includes('Invalid delegate')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    if (error.message.includes('No voting power')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * @desc    Get user's governance history
 * @route   GET /api/v1/governance/history
 * @access  Private
 */
const getGovernanceHistory = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const history = await governanceService.getUserGovernanceHistory({
      userId: req.user.id,
      page: parseInt(page),
      limit: parseInt(limit),
      type,
      sortBy,
      sortOrder
    });

    res.json({
      success: true,
      data: history
    });

  } catch (error) {
    logger.error('Error in getGovernanceHistory:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getProposals,
  getProposal,
  createProposal,
  voteOnProposal,
  executeProposal,
  getVotingPower,
  getProposalVotes,
  getGovernanceAnalytics,
  delegateVotingPower,
  getGovernanceHistory
};