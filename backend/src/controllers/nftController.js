/**
 * CoinEstate Backend - NFT Controller
 * Handles NFT management, minting, and trading operations
 */

import { database } from '../database/connection.js';
import { redis } from '../services/redis.js';
import { queueService } from '../services/queue.js';
import { blockchain } from '../services/blockchain.js';
import { webSocketService } from '../services/websocket.js';
import logger from '../utils/logger.js';
import {
  NotFoundError,
  ValidationError,
  AuthorizationError,
  ConflictError,
  BlockchainError
} from '../middleware/errorHandler.js';

/**
 * Get all NFTs with filtering and pagination
 */
export const getAllNFTs = async (req, res) => {
  const {
    page = 1,
    limit = 20,
    sortBy = 'created_at',
    sortOrder = 'desc',
    owner,
    propertyId,
    isStaked,
    minValue,
    maxValue
  } = req.query;
  
  try {
    // Build cache key
    const cacheKey = `nfts:list:${JSON.stringify(req.query)}`;
    
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
    
    if (owner) {
      conditions.push(`n.owner_address = $${++paramCount}`);
      params.push(owner.toLowerCase());
    }
    
    if (propertyId) {
      conditions.push(`n.property_id = $${++paramCount}`);
      params.push(propertyId);
    }
    
    if (isStaked !== undefined) {
      conditions.push(`n.is_staked = $${++paramCount}`);
      params.push(isStaked);
    }
    
    if (minValue) {
      conditions.push(`n.current_value >= $${++paramCount}`);
      params.push(minValue);
    }
    
    if (maxValue) {
      conditions.push(`n.current_value <= $${++paramCount}`);
      params.push(maxValue);
    }
    
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM nfts n
      ${whereClause}
    `;
    
    const countResult = await database.query(countQuery, params);
    const totalItems = parseInt(countResult.rows[0].total);
    
    // Calculate pagination
    const offset = (page - 1) * limit;
    const totalPages = Math.ceil(totalItems / limit);
    
    // Get NFTs
    const query = `
      SELECT 
        n.*,
        p.name as property_name,
        p.location as property_location,
        p.status as property_status,
        u.email as owner_email,
        u.kyc_status as owner_kyc_status
      FROM nfts n
      LEFT JOIN properties p ON n.property_id = p.id
      LEFT JOIN users u ON n.owner_address = u.wallet_address
      ${whereClause}
      ORDER BY n.${sortBy} ${sortOrder.toUpperCase()}
      LIMIT $${++paramCount} OFFSET $${++paramCount}
    `;
    
    params.push(limit, offset);
    
    const result = await database.query(query, params);
    
    const nfts = result.rows.map(nft => ({
      id: nft.id,
      tokenId: nft.token_id,
      propertyId: nft.property_id,
      propertyName: nft.property_name,
      propertyLocation: nft.property_location,
      propertyStatus: nft.property_status,
      ownerAddress: nft.owner_address,
      ownerEmail: nft.owner_email,
      ownerKycStatus: nft.owner_kyc_status,
      metadataUri: nft.metadata_uri,
      metadata: nft.metadata,
      purchasePrice: parseFloat(nft.purchase_price),
      currentValue: parseFloat(nft.current_value),
      votingPower: nft.voting_power,
      isStaked: nft.is_staked,
      stakedAt: nft.staked_at,
      stakingRewards: parseFloat(nft.staking_rewards),
      acquisitionDate: nft.acquisition_date,
      txHash: nft.tx_hash,
      blockNumber: nft.block_number,
      createdAt: nft.created_at
    }));
    
    const responseData = {
      nfts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    };
    
    // Cache for 2 minutes
    await redis.setex(cacheKey, 120, responseData);
    
    res.json({
      success: true,
      data: responseData,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Get all NFTs failed:', error);
    throw error;
  }
};

/**
 * Get NFT by token ID
 */
export const getNFTByTokenId = async (req, res) => {
  const { tokenId } = req.params;
  
  try {
    const cacheKey = `nft:${tokenId}:details`;
    
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
    
    const query = `
      SELECT 
        n.*,
        p.name as property_name,
        p.location as property_location,
        p.total_value as property_total_value,
        p.nft_count as property_nft_count,
        p.status as property_status,
        u.email as owner_email,
        u.kyc_status as owner_kyc_status
      FROM nfts n
      LEFT JOIN properties p ON n.property_id = p.id
      LEFT JOIN users u ON n.owner_address = u.wallet_address
      WHERE n.token_id = $1
    `;
    
    const result = await database.query(query, [tokenId]);
    
    if (result.rows.length === 0) {
      throw new NotFoundError('NFT not found');
    }
    
    const nft = result.rows[0];
    
    const nftDetails = {
      id: nft.id,
      tokenId: nft.token_id,
      propertyId: nft.property_id,
      property: {
        name: nft.property_name,
        location: nft.property_location,
        totalValue: parseFloat(nft.property_total_value),
        nftCount: nft.property_nft_count,
        status: nft.property_status
      },
      owner: {
        address: nft.owner_address,
        email: nft.owner_email,
        kycStatus: nft.owner_kyc_status
      },
      previousOwnerAddress: nft.previous_owner_address,
      metadataUri: nft.metadata_uri,
      metadata: nft.metadata,
      purchasePrice: parseFloat(nft.purchase_price),
      currentValue: parseFloat(nft.current_value),
      votingPower: nft.voting_power,
      isStaked: nft.is_staked,
      stakedAt: nft.staked_at,
      stakingRewards: parseFloat(nft.staking_rewards),
      acquisitionDate: nft.acquisition_date,
      txHash: nft.tx_hash,
      blockNumber: nft.block_number,
      createdAt: nft.created_at,
      updatedAt: nft.updated_at
    };
    
    // Cache for 5 minutes
    await redis.setex(cacheKey, 300, nftDetails);
    
    res.json({
      success: true,
      data: nftDetails,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    logger.error('Get NFT by token ID failed:', error);
    throw error;
  }
};

/**
 * Mint new NFT
 */
export const mintNFT = async (req, res) => {
  const { propertyId, to, tokenId, metadata } = req.body;
  
  try {
    // Check if property exists and is mintable
    const property = await database.query(
      'SELECT * FROM properties WHERE id = $1',
      [propertyId]
    );
    
    if (property.rows.length === 0) {
      throw new NotFoundError('Property not found');
    }
    
    if (property.rows[0].status !== 'minting' && property.rows[0].status !== 'active') {
      throw new ValidationError('Property is not available for minting');
    }
    
    // Check if all NFTs are already minted
    const mintedCount = await database.query(
      'SELECT COUNT(*) as count FROM nfts WHERE property_id = $1',
      [propertyId]
    );
    
    if (parseInt(mintedCount.rows[0].count) >= property.rows[0].nft_count) {
      throw new ConflictError('All NFTs for this property have been minted');
    }
    
    // Generate token ID if not provided
    let finalTokenId = tokenId;
    if (!finalTokenId) {
      const maxTokenId = await database.query(
        'SELECT COALESCE(MAX(token_id), 0) as max_id FROM nfts'
      );
      finalTokenId = parseInt(maxTokenId.rows[0].max_id) + 1;
    }
    
    // Check if token ID is already used
    const existingNFT = await database.query(
      'SELECT id FROM nfts WHERE token_id = $1',
      [finalTokenId]
    );
    
    if (existingNFT.rows.length > 0) {
      throw new ConflictError('Token ID already exists');
    }
    
    // Validate target wallet has completed KYC
    const targetUser = await database.query(
      'SELECT kyc_status FROM users WHERE wallet_address = $1',
      [to.toLowerCase()]
    );
    
    if (targetUser.rows.length === 0 || targetUser.rows[0].kyc_status !== 'approved') {
      throw new ValidationError('Target wallet must complete KYC verification');
    }
    
    // Create metadata URI (this would typically be stored on IPFS)
    const metadataUri = `https://api.coinestate.io/nfts/${finalTokenId}/metadata`;
    
    // Calculate NFT price
    const nftPrice = property.rows[0].total_value / property.rows[0].nft_count;
    
    // Add to blockchain minting queue
    const mintJob = await queueService.addJob('blockchain', 'mint-nft', {
      to,
      tokenId: finalTokenId,
      tokenURI: metadataUri,
      propertyId
    });
    
    // Store NFT in database (pending blockchain confirmation)
    const nftResult = await database.query(`
      INSERT INTO nfts (
        token_id, property_id, owner_address, metadata_uri, metadata,
        purchase_price, current_value, voting_power
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      finalTokenId,
      propertyId,
      to.toLowerCase(),
      metadataUri,
      metadata,
      nftPrice,
      nftPrice,
      1
    ]);
    
    const nft = nftResult.rows[0];
    
    // Invalidate cache
    await redis.invalidatePattern('nfts:*');
    await redis.invalidatePattern(`property:${propertyId}:*`);
    
    logger.audit('mint_nft', 'nft', req.user.walletAddress, {
      tokenId: finalTokenId,
      propertyId,
      to,
      mintJobId: mintJob.id
    });
    
    res.status(201).json({
      success: true,
      data: {
        nft: {
          id: nft.id,
          tokenId: nft.token_id,
          propertyId: nft.property_id,
          ownerAddress: nft.owner_address,
          metadataUri: nft.metadata_uri,
          purchasePrice: parseFloat(nft.purchase_price),
          votingPower: nft.voting_power,
          createdAt: nft.created_at
        },
        blockchainJob: {
          id: mintJob.id,
          status: 'pending'
        }
      },
      message: 'NFT minting initiated successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ValidationError || error instanceof ConflictError) {
      throw error;
    }
    logger.error('Mint NFT failed:', error);
    throw error;
  }
};

/**
 * Transfer NFT
 */
export const transferNFT = async (req, res) => {
  const { from, to, tokenId, signature, nonce } = req.body;
  
  try {
    // Verify the caller owns the NFT or is authorized
    if (req.user.walletAddress.toLowerCase() !== from.toLowerCase()) {
      throw new AuthorizationError('You can only transfer NFTs you own');
    }
    
    // Check if NFT exists and belongs to sender
    const nft = await database.query(
      'SELECT * FROM nfts WHERE token_id = $1 AND owner_address = $2',
      [tokenId, from.toLowerCase()]
    );
    
    if (nft.rows.length === 0) {
      throw new NotFoundError('NFT not found or not owned by sender');
    }
    
    // Check if NFT is staked
    if (nft.rows[0].is_staked) {
      throw new ValidationError('Cannot transfer staked NFT');
    }
    
    // Validate target wallet has completed KYC
    const targetUser = await database.query(
      'SELECT kyc_status FROM users WHERE wallet_address = $1',
      [to.toLowerCase()]
    );
    
    if (targetUser.rows.length === 0 || targetUser.rows[0].kyc_status !== 'approved') {
      throw new ValidationError('Target wallet must complete KYC verification');
    }
    
    // Add to blockchain transfer queue
    const transferJob = await queueService.addJob('blockchain', 'transfer-nft', {
      from,
      to,
      tokenId
    });
    
    // Update NFT ownership in database (pending blockchain confirmation)
    await database.query(
      'UPDATE nfts SET owner_address = $1, previous_owner_address = $2, updated_at = NOW() WHERE token_id = $3',
      [to.toLowerCase(), from.toLowerCase(), tokenId]
    );
    
    // Invalidate cache
    await redis.invalidatePattern('nfts:*');
    await redis.invalidatePattern(`nft:${tokenId}:*`);
    
    // Broadcast transfer event
    webSocketService.sendToUser(req.user.id, 'nft-transfer-initiated', {
      tokenId,
      from,
      to,
      jobId: transferJob.id
    });
    
    logger.audit('transfer_nft', 'nft', req.user.walletAddress, {
      tokenId,
      from,
      to,
      transferJobId: transferJob.id
    });
    
    res.json({
      success: true,
      data: {
        transfer: {
          tokenId,
          from,
          to,
          status: 'pending'
        },
        blockchainJob: {
          id: transferJob.id,
          status: 'pending'
        }
      },
      message: 'NFT transfer initiated successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    if (error instanceof AuthorizationError || error instanceof NotFoundError || error instanceof ValidationError) {
      throw error;
    }
    logger.error('Transfer NFT failed:', error);
    throw error;
  }
};

/**
 * Stake NFTs
 */
export const stakeNFTs = async (req, res) => {
  const { tokenIds, signature } = req.body;
  
  try {
    // Verify user owns all NFTs
    const nfts = await database.query(
      'SELECT * FROM nfts WHERE token_id = ANY($1) AND owner_address = $2',
      [tokenIds, req.user.walletAddress.toLowerCase()]
    );
    
    if (nfts.rows.length !== tokenIds.length) {
      throw new ValidationError('You do not own all specified NFTs');
    }
    
    // Check if any NFTs are already staked
    const alreadyStaked = nfts.rows.filter(nft => nft.is_staked);
    if (alreadyStaked.length > 0) {
      throw new ValidationError('Some NFTs are already staked');
    }
    
    // Update NFTs to staked status
    await database.query(
      'UPDATE nfts SET is_staked = true, staked_at = NOW() WHERE token_id = ANY($1)',
      [tokenIds]
    );
    
    // Invalidate cache
    await redis.invalidatePattern('nfts:*');
    tokenIds.forEach(tokenId => {
      redis.invalidatePattern(`nft:${tokenId}:*`);
    });
    
    logger.audit('stake_nfts', 'nft', req.user.walletAddress, {
      tokenIds,
      count: tokenIds.length
    });
    
    res.json({
      success: true,
      data: {
        stakedTokenIds: tokenIds,
        stakedAt: new Date().toISOString()
      },
      message: `${tokenIds.length} NFT(s) staked successfully`,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    logger.error('Stake NFTs failed:', error);
    throw error;
  }
};

/**
 * Unstake NFTs
 */
export const unstakeNFTs = async (req, res) => {
  const { tokenIds } = req.body;
  
  try {
    // Verify user owns all NFTs and they are staked
    const nfts = await database.query(
      'SELECT * FROM nfts WHERE token_id = ANY($1) AND owner_address = $2 AND is_staked = true',
      [tokenIds, req.user.walletAddress.toLowerCase()]
    );
    
    if (nfts.rows.length !== tokenIds.length) {
      throw new ValidationError('You do not own all specified NFTs or they are not staked');
    }
    
    // Calculate staking rewards (simplified calculation)
    const rewards = nfts.rows.map(nft => {
      const stakingDays = Math.floor((Date.now() - new Date(nft.staked_at).getTime()) / (1000 * 60 * 60 * 24));
      const dailyReward = parseFloat(nft.current_value) * 0.0001; // 0.01% daily
      return stakingDays * dailyReward;
    });
    
    const totalRewards = rewards.reduce((sum, reward) => sum + reward, 0);
    
    // Update NFTs to unstaked status and add rewards
    await database.query(`
      UPDATE nfts 
      SET is_staked = false, 
          staked_at = NULL, 
          staking_rewards = staking_rewards + $2
      WHERE token_id = ANY($1)
    `, [tokenIds, totalRewards / tokenIds.length]);
    
    // Invalidate cache
    await redis.invalidatePattern('nfts:*');
    tokenIds.forEach(tokenId => {
      redis.invalidatePattern(`nft:${tokenId}:*`);
    });
    
    logger.audit('unstake_nfts', 'nft', req.user.walletAddress, {
      tokenIds,
      count: tokenIds.length,
      totalRewards
    });
    
    res.json({
      success: true,
      data: {
        unstakedTokenIds: tokenIds,
        totalRewards,
        unstakedAt: new Date().toISOString()
      },
      message: `${tokenIds.length} NFT(s) unstaked successfully`,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    logger.error('Unstake NFTs failed:', error);
    throw error;
  }
};

/**
 * Get NFT metadata
 */
export const getNFTMetadata = async (req, res) => {
  const { tokenId } = req.params;
  
  try {
    const nft = await database.query(
      'SELECT n.*, p.name as property_name, p.location FROM nfts n JOIN properties p ON n.property_id = p.id WHERE n.token_id = $1',
      [tokenId]
    );
    
    if (nft.rows.length === 0) {
      throw new NotFoundError('NFT not found');
    }
    
    const metadata = {
      name: `${nft.rows[0].property_name} #${tokenId}`,
      description: `Real estate NFT representing ownership in ${nft.rows[0].property_name} located in ${nft.rows[0].location}`,
      image: nft.rows[0].metadata?.image || 'https://api.coinestate.io/images/default-nft.png',
      external_url: `https://coinestate.io/properties/${nft.rows[0].property_id}`,
      attributes: [
        {
          trait_type: 'Property',
          value: nft.rows[0].property_name
        },
        {
          trait_type: 'Location',
          value: nft.rows[0].location
        },
        {
          trait_type: 'Token ID',
          value: tokenId,
          display_type: 'number'
        },
        {
          trait_type: 'Voting Power',
          value: nft.rows[0].voting_power,
          display_type: 'number'
        },
        {
          trait_type: 'Purchase Price',
          value: parseFloat(nft.rows[0].purchase_price),
          display_type: 'number'
        },
        {
          trait_type: 'Is Staked',
          value: nft.rows[0].is_staked ? 'Yes' : 'No'
        }
      ]
    };
    
    res.json(metadata);
    
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    logger.error('Get NFT metadata failed:', error);
    throw error;
  }
};

/**
 * Get NFT transaction history
 */
export const getNFTHistory = async (req, res) => {
  const { tokenId } = req.params;
  
  try {
    const query = `
      SELECT 
        t.*,
        'transfer' as event_type
      FROM transactions t
      WHERE t.nft_id = (
        SELECT id FROM nfts WHERE token_id = $1
      )
      ORDER BY t.created_at DESC
    `;
    
    const result = await database.query(query, [tokenId]);
    
    const history = result.rows.map(tx => ({
      id: tx.id,
      type: tx.type,
      eventType: tx.event_type,
      hash: tx.hash,
      status: tx.status,
      amount: parseFloat(tx.amount),
      currency: tx.currency,
      fromAddress: tx.from_address,
      toAddress: tx.to_address,
      gasUsed: tx.gas_used,
      blockNumber: tx.block_number,
      blockTimestamp: tx.block_timestamp,
      createdAt: tx.created_at
    }));
    
    res.json({
      success: true,
      data: {
        tokenId: parseInt(tokenId),
        history
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Get NFT history failed:', error);
    throw error;
  }
};

/**
 * Get user NFT portfolio
 */
export const getUserPortfolio = async (req, res) => {
  const { walletAddress } = req.params;
  
  try {
    // Check if user is requesting their own portfolio or is admin
    if (req.user.walletAddress.toLowerCase() !== walletAddress.toLowerCase() && !req.user.isAdmin) {
      throw new AuthorizationError('You can only view your own portfolio');
    }
    
    const cacheKey = `portfolio:${walletAddress.toLowerCase()}`;
    
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
    
    const query = `
      SELECT 
        n.*,
        p.name as property_name,
        p.location as property_location,
        p.status as property_status,
        p.total_value as property_total_value,
        p.roi as property_roi
      FROM nfts n
      JOIN properties p ON n.property_id = p.id
      WHERE n.owner_address = $1
      ORDER BY n.created_at DESC
    `;
    
    const result = await database.query(query, [walletAddress.toLowerCase()]);
    
    const nfts = result.rows.map(nft => ({
      id: nft.id,
      tokenId: nft.token_id,
      propertyId: nft.property_id,
      property: {
        name: nft.property_name,
        location: nft.property_location,
        status: nft.property_status,
        totalValue: parseFloat(nft.property_total_value),
        roi: parseFloat(nft.property_roi)
      },
      purchasePrice: parseFloat(nft.purchase_price),
      currentValue: parseFloat(nft.current_value),
      votingPower: nft.voting_power,
      isStaked: nft.is_staked,
      stakingRewards: parseFloat(nft.staking_rewards),
      acquisitionDate: nft.acquisition_date
    }));
    
    // Calculate portfolio summary
    const summary = {
      totalNFTs: nfts.length,
      totalInvestment: nfts.reduce((sum, nft) => sum + nft.purchasePrice, 0),
      currentValue: nfts.reduce((sum, nft) => sum + nft.currentValue, 0),
      totalVotingPower: nfts.reduce((sum, nft) => sum + nft.votingPower, 0),
      stakedNFTs: nfts.filter(nft => nft.isStaked).length,
      totalStakingRewards: nfts.reduce((sum, nft) => sum + nft.stakingRewards, 0),
      propertiesCount: new Set(nfts.map(nft => nft.propertyId)).size
    };
    
    summary.totalReturn = summary.currentValue - summary.totalInvestment;
    summary.totalReturnPercentage = summary.totalInvestment > 0 
      ? (summary.totalReturn / summary.totalInvestment) * 100 
      : 0;
    
    const portfolioData = {
      walletAddress,
      summary,
      nfts
    };
    
    // Cache for 5 minutes
    await redis.setex(cacheKey, 300, portfolioData);
    
    res.json({
      success: true,
      data: portfolioData,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    if (error instanceof AuthorizationError) {
      throw error;
    }
    logger.error('Get user portfolio failed:', error);
    throw error;
  }
};

export default {
  getAllNFTs,
  getNFTByTokenId,
  mintNFT,
  transferNFT,
  stakeNFTs,
  unstakeNFTs,
  getNFTMetadata,
  getNFTHistory,
  getUserPortfolio
};