const { validationResult } = require('express-validator');
const nftService = require('../services/nft.service');
const propertyService = require('../services/property.service');
const logger = require('../utils/logger');

/**
 * @desc    Get all NFTs with pagination and filters
 * @route   GET /api/v1/nfts
 * @access  Public
 */
const getNFTs = async (req, res) => {
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
      propertyId,
      owner,
      priceMin,
      priceMax,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filters = {
      propertyId,
      owner,
      priceMin: priceMin ? parseFloat(priceMin) : undefined,
      priceMax: priceMax ? parseFloat(priceMax) : undefined,
      status
    };

    const result = await nftService.getNFTs({
      page: parseInt(page),
      limit: parseInt(limit),
      filters,
      sortBy,
      sortOrder
    });

    res.json({
      success: true,
      data: result.nfts,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        pages: result.pages
      }
    });

  } catch (error) {
    logger.error('Error in getNFTs:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * @desc    Get single NFT by ID
 * @route   GET /api/v1/nfts/:id
 * @access  Public
 */
const getNFT = async (req, res) => {
  try {
    const { id } = req.params;
    
    const nft = await nftService.getNFTById(id);
    
    if (!nft) {
      return res.status(404).json({
        success: false,
        message: 'NFT not found'
      });
    }

    res.json({
      success: true,
      data: nft
    });

  } catch (error) {
    logger.error('Error in getNFT:', error);
    
    if (error.message === 'Invalid NFT ID format') {
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
 * @desc    Mint NFTs for a property
 * @route   POST /api/v1/nfts/mint
 * @access  Private (Admin/Manager)
 */
const mintNFTs = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { propertyId, totalShares, pricePerShare, metadata } = req.body;

    // Verify property exists and user has permission
    const property = await propertyService.getPropertyById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    const nfts = await nftService.mintNFTs({
      propertyId,
      totalShares,
      pricePerShare,
      metadata,
      mintedBy: req.user.id
    });

    res.status(201).json({
      success: true,
      data: nfts,
      message: `Successfully minted ${totalShares} NFT shares`
    });

  } catch (error) {
    logger.error('Error in mintNFTs:', error);
    
    if (error.message.includes('already minted')) {
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
 * @desc    Purchase NFT shares
 * @route   POST /api/v1/nfts/:id/purchase
 * @access  Private
 */
const purchaseNFT = async (req, res) => {
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
    const { quantity, paymentMethod } = req.body;

    const transaction = await nftService.purchaseNFT({
      nftId: id,
      buyerId: req.user.id,
      quantity,
      paymentMethod
    });

    res.json({
      success: true,
      data: transaction,
      message: 'Purchase completed successfully'
    });

  } catch (error) {
    logger.error('Error in purchaseNFT:', error);
    
    if (error.message === 'NFT not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    if (error.message.includes('Insufficient shares')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    if (error.message.includes('Insufficient funds')) {
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
 * @desc    Transfer NFT shares
 * @route   POST /api/v1/nfts/:id/transfer
 * @access  Private
 */
const transferNFT = async (req, res) => {
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
    const { recipientAddress, quantity } = req.body;

    const transaction = await nftService.transferNFT({
      nftId: id,
      fromUserId: req.user.id,
      recipientAddress,
      quantity
    });

    res.json({
      success: true,
      data: transaction,
      message: 'Transfer completed successfully'
    });

  } catch (error) {
    logger.error('Error in transferNFT:', error);
    
    if (error.message === 'NFT not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    if (error.message.includes('Insufficient shares')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    if (error.message === 'Invalid recipient address') {
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
 * @desc    Get user's NFT portfolio
 * @route   GET /api/v1/nfts/portfolio
 * @access  Private
 */
const getUserPortfolio = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const portfolio = await nftService.getUserPortfolio({
      userId: req.user.id,
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      sortBy,
      sortOrder
    });

    res.json({
      success: true,
      data: portfolio
    });

  } catch (error) {
    logger.error('Error in getUserPortfolio:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * @desc    Get NFT transaction history
 * @route   GET /api/v1/nfts/:id/transactions
 * @access  Public
 */
const getNFTTransactions = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      page = 1,
      limit = 20,
      type,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const result = await nftService.getNFTTransactions({
      nftId: id,
      page: parseInt(page),
      limit: parseInt(limit),
      type,
      sortBy,
      sortOrder
    });

    res.json({
      success: true,
      data: result.transactions,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        pages: result.pages
      }
    });

  } catch (error) {
    logger.error('Error in getNFTTransactions:', error);
    
    if (error.message === 'NFT not found') {
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
 * @desc    Update NFT metadata
 * @route   PUT /api/v1/nfts/:id/metadata
 * @access  Private (Admin/Property Owner)
 */
const updateNFTMetadata = async (req, res) => {
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
    const { metadata } = req.body;

    const nft = await nftService.updateNFTMetadata({
      nftId: id,
      metadata,
      updatedBy: req.user.id
    });

    res.json({
      success: true,
      data: nft,
      message: 'NFT metadata updated successfully'
    });

  } catch (error) {
    logger.error('Error in updateNFTMetadata:', error);
    
    if (error.message === 'NFT not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    if (error.message === 'Unauthorized to update this NFT') {
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
 * @desc    Get NFT market statistics
 * @route   GET /api/v1/nfts/market/stats
 * @access  Public
 */
const getMarketStats = async (req, res) => {
  try {
    const { timeframe = '24h' } = req.query;
    
    const stats = await nftService.getMarketStats(timeframe);

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    logger.error('Error in getMarketStats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getNFTs,
  getNFT,
  mintNFTs,
  purchaseNFT,
  transferNFT,
  getUserPortfolio,
  getNFTTransactions,
  updateNFTMetadata,
  getMarketStats
};