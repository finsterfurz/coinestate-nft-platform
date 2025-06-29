const { validationResult } = require('express-validator');
const propertyService = require('../services/property.service');
const logger = require('../utils/logger');

/**
 * @desc    Get all properties with pagination and filters
 * @route   GET /api/v1/properties
 * @access  Public
 */
const getProperties = async (req, res) => {
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
      search,
      category,
      priceMin,
      priceMax,
      location,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filters = {
      search,
      category,
      priceMin: priceMin ? parseFloat(priceMin) : undefined,
      priceMax: priceMax ? parseFloat(priceMax) : undefined,
      location,
      status
    };

    const result = await propertyService.getProperties({
      page: parseInt(page),
      limit: parseInt(limit),
      filters,
      sortBy,
      sortOrder
    });

    res.json({
      success: true,
      data: result.properties,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        pages: result.pages
      }
    });

  } catch (error) {
    logger.error('Error in getProperties:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * @desc    Get single property by ID
 * @route   GET /api/v1/properties/:id
 * @access  Public
 */
const getProperty = async (req, res) => {
  try {
    const { id } = req.params;
    
    const property = await propertyService.getPropertyById(id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    res.json({
      success: true,
      data: property
    });

  } catch (error) {
    logger.error('Error in getProperty:', error);
    
    if (error.message === 'Invalid property ID format') {
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
 * @desc    Create new property
 * @route   POST /api/v1/properties
 * @access  Private (Admin/Manager)
 */
const createProperty = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const propertyData = {
      ...req.body,
      createdBy: req.user.id
    };

    const property = await propertyService.createProperty(propertyData);

    res.status(201).json({
      success: true,
      data: property,
      message: 'Property created successfully'
    });

  } catch (error) {
    logger.error('Error in createProperty:', error);
    
    if (error.message.includes('already exists')) {
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
 * @desc    Update property
 * @route   PUT /api/v1/properties/:id
 * @access  Private (Admin/Manager/Owner)
 */
const updateProperty = async (req, res) => {
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
    const updateData = {
      ...req.body,
      updatedBy: req.user.id
    };

    const property = await propertyService.updateProperty(id, updateData, req.user);

    res.json({
      success: true,
      data: property,
      message: 'Property updated successfully'
    });

  } catch (error) {
    logger.error('Error in updateProperty:', error);
    
    if (error.message === 'Property not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    if (error.message === 'Unauthorized to update this property') {
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
 * @desc    Delete property
 * @route   DELETE /api/v1/properties/:id
 * @access  Private (Admin/Manager/Owner)
 */
const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;
    
    await propertyService.deleteProperty(id, req.user);

    res.json({
      success: true,
      message: 'Property deleted successfully'
    });

  } catch (error) {
    logger.error('Error in deleteProperty:', error);
    
    if (error.message === 'Property not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    if (error.message === 'Unauthorized to delete this property') {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }

    if (error.message.includes('Cannot delete property with active')) {
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
 * @desc    Get property analytics
 * @route   GET /api/v1/properties/:id/analytics
 * @access  Private (Admin/Manager/Owner)
 */
const getPropertyAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const { timeframe = '30d' } = req.query;
    
    const analytics = await propertyService.getPropertyAnalytics(id, timeframe, req.user);

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    logger.error('Error in getPropertyAnalytics:', error);
    
    if (error.message === 'Property not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    if (error.message === 'Unauthorized to view analytics') {
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
 * @desc    Upload property images
 * @route   POST /api/v1/properties/:id/images
 * @access  Private (Admin/Manager/Owner)
 */
const uploadPropertyImages = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images uploaded'
      });
    }

    const images = await propertyService.uploadPropertyImages(id, req.files, req.user);

    res.json({
      success: true,
      data: images,
      message: 'Images uploaded successfully'
    });

  } catch (error) {
    logger.error('Error in uploadPropertyImages:', error);
    
    if (error.message === 'Property not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    if (error.message === 'Unauthorized to upload images') {
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
 * @desc    Search properties
 * @route   GET /api/v1/properties/search
 * @access  Public
 */
const searchProperties = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { query, filters, page = 1, limit = 12 } = req.query;
    
    const result = await propertyService.searchProperties({
      query,
      filters: filters ? JSON.parse(filters) : {},
      page: parseInt(page),
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      data: result.properties,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        pages: result.pages
      }
    });

  } catch (error) {
    logger.error('Error in searchProperties:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  getPropertyAnalytics,
  uploadPropertyImages,
  searchProperties
};