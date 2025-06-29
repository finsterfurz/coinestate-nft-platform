/**
 * CoinEstate Backend - Property Controller
 * Handles real estate property management operations
 */

import { database } from '../database/connection.js';
import { redis } from '../services/redis.js';
import { queueService } from '../services/queue.js';
import { webSocketService } from '../services/websocket.js';
import logger from '../utils/logger.js';
import {
  NotFoundError,
  ValidationError,
  AuthorizationError,
  ConflictError
} from '../middleware/errorHandler.js';

/**
 * Get all properties with filtering and pagination
 */
export const getAllProperties = async (req, res) => {
  const {
    page = 1,
    limit = 20,
    sortBy = 'created_at',
    sortOrder = 'desc',
    status,
    propertyType,
    location,
    minValue,
    maxValue,
    minRoi,
    maxRoi
  } = req.query;
  
  try {
    // Build cache key
    const cacheKey = `properties:list:${JSON.stringify(req.query)}`;
    
    // Try cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        data: cached,
        timestamp: new Date().toISOString(),
        cached: true
      });
    }
    
    // Build query conditions
    const conditions = [];
    const params = [];
    let paramCount = 0;
    
    if (status) {
      conditions.push(`p.status = $${++paramCount}`);
      params.push(status);
    }
    
    if (propertyType) {
      conditions.push(`p.property_type = $${++paramCount}`);
      params.push(propertyType);
    }
    
    if (location) {
      conditions.push(`p.location ILIKE $${++paramCount}`);
      params.push(`%${location}%`);
    }
    
    if (minValue) {
      conditions.push(`p.total_value >= $${++paramCount}`);
      params.push(minValue);
    }
    
    if (maxValue) {
      conditions.push(`p.total_value <= $${++paramCount}`);
      params.push(maxValue);
    }
    
    if (minRoi) {
      conditions.push(`p.roi >= $${++paramCount}`);
      params.push(minRoi);
    }
    
    if (maxRoi) {
      conditions.push(`p.roi <= $${++paramCount}`);
      params.push(maxRoi);
    }
    
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM properties p
      ${whereClause}
    `;
    
    const countResult = await database.query(countQuery, params);
    const totalItems = parseInt(countResult.rows[0].total);
    
    // Calculate pagination
    const offset = (page - 1) * limit;
    const totalPages = Math.ceil(totalItems / limit);
    
    // Get properties
    const query = `
      SELECT 
        p.*,
        COUNT(DISTINCT n.id) as minted_nfts,
        COUNT(DISTINCT n.owner_address) as unique_owners,
        ROUND((COUNT(DISTINCT n.id)::decimal / p.nft_count * 100), 2) as mint_percentage,
        COALESCE(AVG(pm.roi), p.roi) as avg_roi,
        COALESCE(SUM(id.net_income), 0) as total_distributed_income
      FROM properties p
      LEFT JOIN nfts n ON p.id = n.property_id
      LEFT JOIN property_metrics pm ON p.id = pm.property_id AND pm.date >= CURRENT_DATE - INTERVAL '12 months'
      LEFT JOIN income_distributions id ON p.id = id.property_id
      ${whereClause}
      GROUP BY p.id
      ORDER BY p.${sortBy} ${sortOrder.toUpperCase()}
      LIMIT $${++paramCount} OFFSET $${++paramCount}
    `;
    
    params.push(limit, offset);
    
    const result = await database.query(query, params);
    
    const properties = result.rows.map(property => ({
      id: property.id,
      name: property.name,
      slug: property.slug,
      description: property.description,
      location: property.location,
      propertyType: property.property_type,
      status: property.status,
      totalValue: parseFloat(property.total_value),
      nftCount: property.nft_count,
      mintedNfts: parseInt(property.minted_nfts),
      mintPercentage: parseFloat(property.mint_percentage),
      uniqueOwners: parseInt(property.unique_owners),
      roi: parseFloat(property.avg_roi || property.roi),
      occupancyRate: parseFloat(property.occupancy_rate),
      monthlyRent: parseFloat(property.monthly_rent),
      totalDistributedIncome: parseFloat(property.total_distributed_income),
      images: property.images || [],
      createdAt: property.created_at,
      updatedAt: property.updated_at
    }));
    
    const responseData = {
      properties,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    };
    
    // Cache for 5 minutes
    await redis.setex(cacheKey, 300, responseData);
    
    res.json({
      success: true,
      data: responseData,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Get all properties failed:', error);
    throw error;
  }
};

/**
 * Get property by ID with detailed information
 */
export const getPropertyById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const cacheKey = `property:${id}:details`;
    
    // Try cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        data: cached,
        timestamp: new Date().toISOString(),
        cached: true
      });
    }
    
    // Get property with metrics
    const query = `
      SELECT 
        p.*,
        COUNT(DISTINCT n.id) as minted_nfts,
        COUNT(DISTINCT n.owner_address) as unique_owners,
        ROUND((COUNT(DISTINCT n.id)::decimal / p.nft_count * 100), 2) as mint_percentage,
        COALESCE(AVG(pm.roi), p.roi) as avg_roi,
        COALESCE(SUM(id.net_income), 0) as total_distributed_income,
        COALESCE(COUNT(DISTINCT id.id), 0) as distribution_count,
        (
          SELECT json_agg(
            json_build_object(
              'date', pm2.date,
              'occupancyRate', pm2.occupancy_rate,
              'rentalIncome', pm2.rental_income,
              'roi', pm2.roi,
              'propertyValue', pm2.property_value
            ) ORDER BY pm2.date DESC
          )
          FROM property_metrics pm2 
          WHERE pm2.property_id = p.id 
          AND pm2.date >= CURRENT_DATE - INTERVAL '12 months'
          LIMIT 12
        ) as recent_metrics
      FROM properties p
      LEFT JOIN nfts n ON p.id = n.property_id
      LEFT JOIN property_metrics pm ON p.id = pm.property_id AND pm.date >= CURRENT_DATE - INTERVAL '12 months'
      LEFT JOIN income_distributions id ON p.id = id.property_id
      WHERE p.id = $1
      GROUP BY p.id
    `;
    
    const result = await database.query(query, [id]);
    
    if (result.rows.length === 0) {
      throw new NotFoundError('Property not found');
    }
    
    const property = result.rows[0];
    
    const propertyDetails = {
      id: property.id,
      name: property.name,
      slug: property.slug,
      description: property.description,
      location: property.location,
      address: property.address,
      coordinates: property.coordinates,
      propertyType: property.property_type,
      status: property.status,
      totalValue: parseFloat(property.total_value),
      nftCount: property.nft_count,
      mintedNfts: parseInt(property.minted_nfts),
      mintPercentage: parseFloat(property.mint_percentage),
      uniqueOwners: parseInt(property.unique_owners),
      nftPrice: parseFloat(property.nft_price),
      roi: parseFloat(property.avg_roi || property.roi),
      occupancyRate: parseFloat(property.occupancy_rate),
      monthlyRent: parseFloat(property.monthly_rent),
      annualIncome: parseFloat(property.annual_income),
      expenses: parseFloat(property.expenses),
      totalDistributedIncome: parseFloat(property.total_distributed_income),
      distributionCount: parseInt(property.distribution_count),
      images: property.images || [],
      documents: property.documents || [],
      metadata: property.metadata || {},
      recentMetrics: property.recent_metrics || [],
      createdAt: property.created_at,
      updatedAt: property.updated_at
    };
    
    // Cache for 10 minutes
    await redis.setex(cacheKey, 600, propertyDetails);
    
    res.json({
      success: true,
      data: propertyDetails,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    logger.error('Get property by ID failed:', error);
    throw error;
  }
};

/**
 * Create new property
 */
export const createProperty = async (req, res) => {
  const propertyData = req.body;
  
  try {
    // Check if user has permission to create properties (admin only)
    // This would be implemented with role-based access control
    if (!req.user.isVerified) {
      throw new AuthorizationError('Only verified users can create properties');
    }
    
    // Generate slug if not provided
    if (!propertyData.slug) {
      propertyData.slug = generateSlug(propertyData.name);
    }
    
    // Check slug uniqueness
    const slugExists = await database.query(
      'SELECT id FROM properties WHERE slug = $1',
      [propertyData.slug]
    );
    
    if (slugExists.rows.length > 0) {
      throw new ConflictError('Property slug already exists');
    }
    
    // Calculate NFT price if not provided
    if (!propertyData.nftPrice) {
      propertyData.nftPrice = propertyData.totalValue / propertyData.nftCount;
    }
    
    const query = `
      INSERT INTO properties (
        name, slug, description, location, address, coordinates,
        property_type, total_value, nft_count, nft_price,
        roi, occupancy_rate, monthly_rent, annual_income, expenses,
        images, documents, metadata, created_by
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19
      ) RETURNING *
    `;
    
    const params = [
      propertyData.name,
      propertyData.slug,
      propertyData.description,
      propertyData.location,
      propertyData.address || null,
      propertyData.coordinates ? `(${propertyData.coordinates.lat},${propertyData.coordinates.lng})` : null,
      propertyData.propertyType,
      propertyData.totalValue,
      propertyData.nftCount,
      propertyData.nftPrice,
      propertyData.roi || null,
      propertyData.occupancyRate || null,
      propertyData.monthlyRent || null,
      propertyData.annualIncome || null,
      propertyData.expenses || null,
      propertyData.images || [],
      propertyData.documents || [],
      propertyData.metadata || {},
      req.user.id
    ];
    
    const result = await database.query(query, params);
    const property = result.rows[0];
    
    // Invalidate cache
    await redis.invalidatePattern('properties:*');
    
    // Broadcast property creation
    webSocketService.broadcast('property-created', {
      property: {
        id: property.id,
        name: property.name,
        location: property.location,
        totalValue: parseFloat(property.total_value),
        nftCount: property.nft_count
      }
    });
    
    logger.audit('create', 'property', req.user.walletAddress, {
      propertyId: property.id,
      propertyName: property.name,
      totalValue: property.total_value
    });
    
    res.status(201).json({
      success: true,
      data: {
        id: property.id,
        name: property.name,
        slug: property.slug,
        description: property.description,
        location: property.location,
        propertyType: property.property_type,
        status: property.status,
        totalValue: parseFloat(property.total_value),
        nftCount: property.nft_count,
        nftPrice: parseFloat(property.nft_price),
        createdAt: property.created_at
      },
      message: 'Property created successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    if (error instanceof AuthorizationError || error instanceof ConflictError) {
      throw error;
    }
    logger.error('Create property failed:', error);
    throw error;
  }
};

/**
 * Update property
 */
export const updateProperty = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  try {
    // Check if property exists
    const existingProperty = await database.query(
      'SELECT * FROM properties WHERE id = $1',
      [id]
    );
    
    if (existingProperty.rows.length === 0) {
      throw new NotFoundError('Property not found');
    }
    
    // Check permissions (admin or property creator)
    if (existingProperty.rows[0].created_by !== req.user.id && !req.user.isAdmin) {
      throw new AuthorizationError('Insufficient permissions to update this property');
    }
    
    // Build update query
    const updateFields = [];
    const params = [];
    let paramCount = 0;
    
    const allowedFields = [
      'name', 'description', 'location', 'address', 'status',
      'roi', 'occupancy_rate', 'monthly_rent', 'annual_income',
      'expenses', 'images', 'documents', 'metadata'
    ];
    
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        updateFields.push(`${field} = $${++paramCount}`);
        params.push(updates[field]);
      }
    });
    
    if (updateFields.length === 0) {
      throw new ValidationError('No valid fields to update');
    }
    
    const query = `
      UPDATE properties 
      SET ${updateFields.join(', ')}, updated_at = NOW()
      WHERE id = $${++paramCount}
      RETURNING *
    `;
    
    params.push(id);
    
    const result = await database.query(query, params);
    const updatedProperty = result.rows[0];
    
    // Invalidate cache
    await redis.invalidatePattern(`property:${id}:*`);
    await redis.invalidatePattern('properties:*');
    
    // Broadcast property update
    webSocketService.sendToProperty(id, 'property-updated', {
      propertyId: id,
      updates: Object.keys(updates)
    });
    
    logger.audit('update', 'property', req.user.walletAddress, {
      propertyId: id,
      updatedFields: Object.keys(updates)
    });
    
    res.json({
      success: true,
      data: {
        id: updatedProperty.id,
        name: updatedProperty.name,
        description: updatedProperty.description,
        location: updatedProperty.location,
        status: updatedProperty.status,
        totalValue: parseFloat(updatedProperty.total_value),
        roi: parseFloat(updatedProperty.roi),
        occupancyRate: parseFloat(updatedProperty.occupancy_rate),
        updatedAt: updatedProperty.updated_at
      },
      message: 'Property updated successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof AuthorizationError || error instanceof ValidationError) {
      throw error;
    }
    logger.error('Update property failed:', error);
    throw error;
  }
};

/**
 * Delete property
 */
export const deleteProperty = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Check if property exists
    const existingProperty = await database.query(
      'SELECT * FROM properties WHERE id = $1',
      [id]
    );
    
    if (existingProperty.rows.length === 0) {
      throw new NotFoundError('Property not found');
    }
    
    // Check if property has minted NFTs
    const nftCount = await database.query(
      'SELECT COUNT(*) as count FROM nfts WHERE property_id = $1',
      [id]
    );
    
    if (parseInt(nftCount.rows[0].count) > 0) {
      throw new ConflictError('Cannot delete property with minted NFTs');
    }
    
    // Check permissions (admin only)
    if (!req.user.isAdmin) {
      throw new AuthorizationError('Only administrators can delete properties');
    }
    
    // Delete property
    await database.query('DELETE FROM properties WHERE id = $1', [id]);
    
    // Invalidate cache
    await redis.invalidatePattern(`property:${id}:*`);
    await redis.invalidatePattern('properties:*');
    
    logger.audit('delete', 'property', req.user.walletAddress, {
      propertyId: id,
      propertyName: existingProperty.rows[0].name
    });
    
    res.json({
      success: true,
      message: 'Property deleted successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof AuthorizationError || error instanceof ConflictError) {
      throw error;
    }
    logger.error('Delete property failed:', error);
    throw error;
  }
};

/**
 * Get property metrics
 */
export const getPropertyMetrics = async (req, res) => {
  const { id } = req.params;
  const { startDate, endDate } = req.query;
  
  try {
    const cacheKey = `property:${id}:metrics:${startDate || 'all'}:${endDate || 'all'}`;
    
    // Try cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        data: cached,
        timestamp: new Date().toISOString(),
        cached: true
      });
    }
    
    // Build date filter
    let dateFilter = '';
    const params = [id];
    
    if (startDate && endDate) {
      dateFilter = 'AND date BETWEEN $2 AND $3';
      params.push(startDate, endDate);
    } else if (startDate) {
      dateFilter = 'AND date >= $2';
      params.push(startDate);
    } else if (endDate) {
      dateFilter = 'AND date <= $2';
      params.push(endDate);
    }
    
    const query = `
      SELECT 
        date,
        occupancy_rate,
        rental_income,
        expenses,
        net_income,
        property_value,
        roi
      FROM property_metrics
      WHERE property_id = $1 ${dateFilter}
      ORDER BY date DESC
    `;
    
    const result = await database.query(query, params);
    
    const metrics = result.rows.map(row => ({
      date: row.date,
      occupancyRate: parseFloat(row.occupancy_rate),
      rentalIncome: parseFloat(row.rental_income),
      expenses: parseFloat(row.expenses),
      netIncome: parseFloat(row.net_income),
      propertyValue: parseFloat(row.property_value),
      roi: parseFloat(row.roi)
    }));
    
    // Calculate summary statistics
    const summary = {
      totalPeriods: metrics.length,
      avgOccupancyRate: metrics.length > 0 ? metrics.reduce((sum, m) => sum + m.occupancyRate, 0) / metrics.length : 0,
      totalRentalIncome: metrics.reduce((sum, m) => sum + m.rentalIncome, 0),
      totalExpenses: metrics.reduce((sum, m) => sum + m.expenses, 0),
      totalNetIncome: metrics.reduce((sum, m) => sum + m.netIncome, 0),
      avgROI: metrics.length > 0 ? metrics.reduce((sum, m) => sum + m.roi, 0) / metrics.length : 0
    };
    
    const responseData = {
      metrics,
      summary
    };
    
    // Cache for 1 hour
    await redis.setex(cacheKey, 3600, responseData);
    
    res.json({
      success: true,
      data: responseData,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Get property metrics failed:', error);
    throw error;
  }
};

/**
 * Get property NFTs
 */
export const getPropertyNFTs = async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 20 } = req.query;
  
  try {
    const offset = (page - 1) * limit;
    
    // Get total count
    const countResult = await database.query(
      'SELECT COUNT(*) as total FROM nfts WHERE property_id = $1',
      [id]
    );
    const totalItems = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(totalItems / limit);
    
    // Get NFTs
    const query = `
      SELECT 
        n.*,
        u.email as owner_email
      FROM nfts n
      LEFT JOIN users u ON n.owner_address = u.wallet_address
      WHERE n.property_id = $1
      ORDER BY n.token_id ASC
      LIMIT $2 OFFSET $3
    `;
    
    const result = await database.query(query, [id, limit, offset]);
    
    const nfts = result.rows.map(nft => ({
      id: nft.id,
      tokenId: nft.token_id,
      ownerAddress: nft.owner_address,
      ownerEmail: nft.owner_email,
      metadataUri: nft.metadata_uri,
      metadata: nft.metadata,
      purchasePrice: parseFloat(nft.purchase_price),
      currentValue: parseFloat(nft.current_value),
      votingPower: nft.voting_power,
      isStaked: nft.is_staked,
      acquisitionDate: nft.acquisition_date,
      createdAt: nft.created_at
    }));
    
    res.json({
      success: true,
      data: {
        nfts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalItems,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        }
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Get property NFTs failed:', error);
    throw error;
  }
};

/**
 * Get property stakeholders
 */
export const getPropertyStakeholders = async (req, res) => {
  const { id } = req.params;
  
  try {
    const query = `
      SELECT 
        n.owner_address,
        u.email,
        u.kyc_status,
        COUNT(n.id) as nft_count,
        SUM(n.voting_power) as voting_power,
        SUM(n.purchase_price) as total_investment,
        SUM(n.current_value) as current_value,
        ROUND((SUM(n.voting_power)::decimal / (
          SELECT SUM(voting_power) FROM nfts WHERE property_id = $1
        ) * 100), 2) as voting_percentage
      FROM nfts n
      LEFT JOIN users u ON n.owner_address = u.wallet_address
      WHERE n.property_id = $1
      GROUP BY n.owner_address, u.email, u.kyc_status
      ORDER BY voting_power DESC
    `;
    
    const result = await database.query(query, [id]);
    
    const stakeholders = result.rows.map(stakeholder => ({
      ownerAddress: stakeholder.owner_address,
      email: stakeholder.email,
      kycStatus: stakeholder.kyc_status,
      nftCount: parseInt(stakeholder.nft_count),
      votingPower: parseInt(stakeholder.voting_power),
      votingPercentage: parseFloat(stakeholder.voting_percentage),
      totalInvestment: parseFloat(stakeholder.total_investment),
      currentValue: parseFloat(stakeholder.current_value)
    }));
    
    res.json({
      success: true,
      data: {
        stakeholders,
        totalStakeholders: stakeholders.length
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Get property stakeholders failed:', error);
    throw error;
  }
};

/**
 * Get property income history
 */
export const getPropertyIncomeHistory = async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 12 } = req.query;
  
  try {
    const offset = (page - 1) * limit;
    
    // Get total count
    const countResult = await database.query(
      'SELECT COUNT(*) as total FROM income_distributions WHERE property_id = $1',
      [id]
    );
    const totalItems = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(totalItems / limit);
    
    // Get income distributions
    const query = `
      SELECT *
      FROM income_distributions
      WHERE property_id = $1
      ORDER BY period_start DESC
      LIMIT $2 OFFSET $3
    `;
    
    const result = await database.query(query, [id, limit, offset]);
    
    const distributions = result.rows.map(dist => ({
      id: dist.id,
      periodStart: dist.period_start,
      periodEnd: dist.period_end,
      totalIncome: parseFloat(dist.total_income),
      totalExpenses: parseFloat(dist.total_expenses),
      netIncome: parseFloat(dist.net_income),
      perNftAmount: parseFloat(dist.per_nft_amount),
      distributedAt: dist.distributed_at,
      txHash: dist.tx_hash,
      createdAt: dist.created_at
    }));
    
    res.json({
      success: true,
      data: {
        distributions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalItems,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        }
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Get property income history failed:', error);
    throw error;
  }
};

/**
 * Helper functions
 */

/**
 * Generate URL-friendly slug from name
 */
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
};

export default {
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  getPropertyMetrics,
  getPropertyNFTs,
  getPropertyStakeholders,
  getPropertyIncomeHistory
};