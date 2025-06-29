const NFT = require('../models/NFT');
const Property = require('../models/Property');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const logger = require('../utils/logger');

class NFTService {
  /**
   * Get NFTs with pagination and filters
   */
  async getNFTs({ page = 1, limit = 12, filters = {}, sortBy = 'createdAt', sortOrder = 'desc' }) {
    try {
      const skip = (page - 1) * limit;
      const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

      // Build query
      const query = {};
      
      if (filters.propertyId) {
        query.propertyId = filters.propertyId;
      }
      
      if (filters.owner) {
        query['ownership.owner'] = filters.owner;
      }
      
      if (filters.status) {
        query.status = filters.status;
      }
      
      if (filters.priceMin || filters.priceMax) {
        query.pricePerShare = {};
        if (filters.priceMin) query.pricePerShare.$gte = filters.priceMin;
        if (filters.priceMax) query.pricePerShare.$lte = filters.priceMax;
      }

      const nfts = await NFT.find(query)
        .populate('propertyId', 'title location images')
        .populate('ownership.owner', 'username avatar')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await NFT.countDocuments(query);
      const pages = Math.ceil(total / limit);

      return {
        nfts,
        page,
        limit,
        total,
        pages
      };
    } catch (error) {
      logger.error('Error in getNFTs:', error);
      throw error;
    }
  }

  /**
   * Get NFT by ID
   */
  async getNFTById(id) {
    try {
      const nft = await NFT.findById(id)
        .populate('propertyId')
        .populate('ownership.owner', 'username avatar walletAddress')
        .populate('transactions.from', 'username')
        .populate('transactions.to', 'username');

      return nft;
    } catch (error) {
      if (error.name === 'CastError') {
        throw new Error('Invalid NFT ID format');
      }
      logger.error('Error in getNFTById:', error);
      throw error;
    }
  }

  /**
   * Mint NFTs for a property
   */
  async mintNFTs({ propertyId, totalShares, pricePerShare, metadata, mintedBy }) {
    try {
      // Check if NFTs already exist for this property
      const existingNFTs = await NFT.findOne({ propertyId });
      if (existingNFTs) {
        throw new Error('NFTs already minted for this property');
      }

      // Verify property exists
      const property = await Property.findById(propertyId);
      if (!property) {
        throw new Error('Property not found');
      }

      // Create NFT collection
      const nftData = {
        propertyId,
        tokenId: `${propertyId}_${Date.now()}`,
        metadata: {
          name: metadata.name || `${property.title} Shares`,
          description: metadata.description || `Fractional ownership of ${property.title}`,
          image: metadata.image || property.images[0],
          attributes: metadata.attributes || [
            { trait_type: 'Property Type', value: property.category },
            { trait_type: 'Location', value: `${property.location.city}, ${property.location.country}` },
            { trait_type: 'Total Shares', value: totalShares.toString() }
          ]
        },
        totalShares,
        availableShares: totalShares,
        pricePerShare,
        ownership: [{
          owner: mintedBy,
          shares: totalShares,
          purchaseDate: new Date(),
          purchasePrice: pricePerShare
        }],
        status: 'available',
        mintedBy,
        mintedAt: new Date()
      };

      const nft = await NFT.create(nftData);

      // Update property with NFT reference
      await Property.findByIdAndUpdate(propertyId, {
        $set: {
          'nft.isTokenized': true,
          'nft.contractAddress': process.env.NFT_CONTRACT_ADDRESS,
          'nft.tokenId': nft.tokenId,
          'nft.totalShares': totalShares,
          'nft.pricePerShare': pricePerShare
        }
      });

      // Create minting transaction
      await Transaction.create({
        type: 'mint',
        nftId: nft._id,
        propertyId,
        from: null,
        to: mintedBy,
        quantity: totalShares,
        price: pricePerShare,
        totalAmount: totalShares * pricePerShare,
        status: 'completed',
        transactionHash: `mint_${nft._id}_${Date.now()}`
      });

      return await this.getNFTById(nft._id);
    } catch (error) {
      logger.error('Error in mintNFTs:', error);
      throw error;
    }
  }

  /**
   * Purchase NFT shares
   */
  async purchaseNFT({ nftId, buyerId, quantity, paymentMethod }) {
    try {
      const nft = await NFT.findById(nftId);
      if (!nft) {
        throw new Error('NFT not found');
      }

      if (nft.availableShares < quantity) {
        throw new Error(`Insufficient shares available. Only ${nft.availableShares} shares remaining`);
      }

      const buyer = await User.findById(buyerId);
      if (!buyer) {
        throw new Error('Buyer not found');
      }

      const totalCost = quantity * nft.pricePerShare;

      // Check buyer's balance (simplified - in production, integrate with payment system)
      if (paymentMethod === 'wallet' && buyer.walletBalance < totalCost) {
        throw new Error('Insufficient funds in wallet');
      }

      // Update NFT ownership
      const existingOwnership = nft.ownership.find(
        ownership => ownership.owner.toString() === buyerId
      );

      if (existingOwnership) {
        existingOwnership.shares += quantity;
      } else {
        nft.ownership.push({
          owner: buyerId,
          shares: quantity,
          purchaseDate: new Date(),
          purchasePrice: nft.pricePerShare
        });
      }

      nft.availableShares -= quantity;
      
      if (nft.availableShares === 0) {
        nft.status = 'sold_out';
      }

      await nft.save();

      // Update buyer's wallet balance
      if (paymentMethod === 'wallet') {
        await User.findByIdAndUpdate(buyerId, {
          $inc: { walletBalance: -totalCost }
        });
      }

      // Create purchase transaction
      const transaction = await Transaction.create({
        type: 'purchase',
        nftId,
        propertyId: nft.propertyId,
        from: null,
        to: buyerId,
        quantity,
        price: nft.pricePerShare,
        totalAmount: totalCost,
        paymentMethod,
        status: 'completed',
        transactionHash: `purchase_${nftId}_${Date.now()}`
      });

      return transaction;
    } catch (error) {
      logger.error('Error in purchaseNFT:', error);
      throw error;
    }
  }

  /**
   * Transfer NFT shares
   */
  async transferNFT({ nftId, fromUserId, recipientAddress, quantity }) {
    try {
      const nft = await NFT.findById(nftId);
      if (!nft) {
        throw new Error('NFT not found');
      }

      // Find sender's ownership
      const senderOwnership = nft.ownership.find(
        ownership => ownership.owner.toString() === fromUserId
      );

      if (!senderOwnership || senderOwnership.shares < quantity) {
        throw new Error('Insufficient shares to transfer');
      }

      // Find or create recipient user
      let recipient = await User.findOne({ walletAddress: recipientAddress });
      if (!recipient) {
        throw new Error('Invalid recipient address');
      }

      // Update sender's shares
      senderOwnership.shares -= quantity;
      if (senderOwnership.shares === 0) {
        nft.ownership = nft.ownership.filter(
          ownership => ownership.owner.toString() !== fromUserId
        );
      }

      // Update recipient's shares
      const recipientOwnership = nft.ownership.find(
        ownership => ownership.owner.toString() === recipient._id.toString()
      );

      if (recipientOwnership) {
        recipientOwnership.shares += quantity;
      } else {
        nft.ownership.push({
          owner: recipient._id,
          shares: quantity,
          purchaseDate: new Date(),
          purchasePrice: nft.pricePerShare
        });
      }

      await nft.save();

      // Create transfer transaction
      const transaction = await Transaction.create({
        type: 'transfer',
        nftId,
        propertyId: nft.propertyId,
        from: fromUserId,
        to: recipient._id,
        quantity,
        price: 0,
        totalAmount: 0,
        status: 'completed',
        transactionHash: `transfer_${nftId}_${Date.now()}`
      });

      return transaction;
    } catch (error) {
      logger.error('Error in transferNFT:', error);
      throw error;
    }
  }

  /**
   * Get user's NFT portfolio
   */
  async getUserPortfolio({ userId, page = 1, limit = 12, status, sortBy = 'createdAt', sortOrder = 'desc' }) {
    try {
      const skip = (page - 1) * limit;
      const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

      // Build query to find NFTs where user owns shares
      const query = { 'ownership.owner': userId };
      if (status) {
        query.status = status;
      }

      const nfts = await NFT.find(query)
        .populate('propertyId', 'title location images price')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean();

      // Calculate portfolio statistics
      const userNFTs = nfts.map(nft => {
        const userOwnership = nft.ownership.find(
          ownership => ownership.owner.toString() === userId
        );
        
        return {
          ...nft,
          userShares: userOwnership ? userOwnership.shares : 0,
          userOwnershipPercentage: userOwnership ? 
            ((userOwnership.shares / nft.totalShares) * 100).toFixed(2) : 0,
          currentValue: userOwnership ? 
            userOwnership.shares * nft.pricePerShare : 0
        };
      });

      const totalValue = userNFTs.reduce((sum, nft) => sum + nft.currentValue, 0);
      const totalShares = userNFTs.reduce((sum, nft) => sum + nft.userShares, 0);
      const totalProperties = userNFTs.length;

      const total = await NFT.countDocuments(query);
      const pages = Math.ceil(total / limit);

      return {
        nfts: userNFTs,
        statistics: {
          totalValue,
          totalShares,
          totalProperties
        },
        pagination: {
          page,
          limit,
          total,
          pages
        }
      };
    } catch (error) {
      logger.error('Error in getUserPortfolio:', error);
      throw error;
    }
  }

  /**
   * Get NFT transaction history
   */
  async getNFTTransactions({ nftId, page = 1, limit = 20, type, sortBy = 'createdAt', sortOrder = 'desc' }) {
    try {
      const skip = (page - 1) * limit;
      const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

      // Verify NFT exists
      const nft = await NFT.findById(nftId);
      if (!nft) {
        throw new Error('NFT not found');
      }

      const query = { nftId };
      if (type) {
        query.type = type;
      }

      const transactions = await Transaction.find(query)
        .populate('from', 'username avatar')
        .populate('to', 'username avatar')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await Transaction.countDocuments(query);
      const pages = Math.ceil(total / limit);

      return {
        transactions,
        page,
        limit,
        total,
        pages
      };
    } catch (error) {
      logger.error('Error in getNFTTransactions:', error);
      throw error;
    }
  }

  /**
   * Update NFT metadata
   */
  async updateNFTMetadata({ nftId, metadata, updatedBy }) {
    try {
      const nft = await NFT.findById(nftId);
      if (!nft) {
        throw new Error('NFT not found');
      }

      // Check authorization (property owner, admin, or contract owner)
      const property = await Property.findById(nft.propertyId);
      const user = await User.findById(updatedBy);
      
      if (!user.role.includes('admin') && 
          property.createdBy.toString() !== updatedBy &&
          nft.mintedBy.toString() !== updatedBy) {
        throw new Error('Unauthorized to update this NFT');
      }

      // Update metadata
      nft.metadata = { ...nft.metadata, ...metadata };
      nft.updatedAt = new Date();

      await nft.save();

      return await this.getNFTById(nftId);
    } catch (error) {
      logger.error('Error in updateNFTMetadata:', error);
      throw error;
    }
  }

  /**
   * Get market statistics
   */
  async getMarketStats(timeframe = '24h') {
    try {
      const now = new Date();
      let startDate;

      switch (timeframe) {
        case '1h':
          startDate = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case '24h':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }

      // Get total NFTs and volume
      const totalNFTs = await NFT.countDocuments();
      const availableNFTs = await NFT.countDocuments({ status: 'available' });
      
      // Get transaction volume
      const transactions = await Transaction.find({
        createdAt: { $gte: startDate },
        type: { $in: ['purchase', 'sale'] }
      });

      const volume = transactions.reduce((sum, tx) => sum + tx.totalAmount, 0);
      const transactionCount = transactions.length;

      // Get average price
      const avgPriceResult = await NFT.aggregate([
        { $group: { _id: null, avgPrice: { $avg: '$pricePerShare' } } }
      ]);
      const averagePrice = avgPriceResult[0]?.avgPrice || 0;

      // Get top properties by volume
      const topProperties = await Transaction.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            type: { $in: ['purchase', 'sale'] }
          }
        },
        {
          $group: {
            _id: '$propertyId',
            volume: { $sum: '$totalAmount' },
            transactions: { $sum: 1 }
          }
        },
        { $sort: { volume: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'properties',
            localField: '_id',
            foreignField: '_id',
            as: 'property'
          }
        }
      ]);

      return {
        timeframe,
        totalNFTs,
        availableNFTs,
        volume,
        transactionCount,
        averagePrice,
        topProperties: topProperties.map(item => ({
          property: item.property[0],
          volume: item.volume,
          transactions: item.transactions
        }))
      };
    } catch (error) {
      logger.error('Error in getMarketStats:', error);
      throw error;
    }
  }
}

module.exports = new NFTService();