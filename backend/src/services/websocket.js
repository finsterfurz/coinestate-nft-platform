/**
 * CoinEstate Backend - WebSocket Service
 * Real-time communication for live updates
 */

import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import logger from '../utils/logger.js';
import { redis } from './redis.js';
import { database } from '../database/connection.js';

class WebSocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map();
    this.rooms = new Map();
  }

  /**
   * Initialize WebSocket server
   */
  initialize(httpServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: config.corsOrigin,
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    // Authentication middleware
    this.io.use(this.authenticateSocket.bind(this));

    // Connection handler
    this.io.on('connection', this.handleConnection.bind(this));

    // Redis subscription for broadcasting
    this.setupRedisSubscriptions();

    logger.info('✅ WebSocket server initialized');
  }

  /**
   * Authenticate socket connection
   */
  async authenticateSocket(socket, next) {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      // Verify JWT token
      const decoded = jwt.verify(token, config.jwt.secret);
      
      // Get user from database
      const userResult = await database.query(
        'SELECT id, wallet_address, email, is_active FROM users WHERE id = $1',
        [decoded.userId]
      );

      if (userResult.rows.length === 0 || !userResult.rows[0].is_active) {
        return next(new Error('Invalid user'));
      }

      const user = userResult.rows[0];
      socket.userId = user.id;
      socket.walletAddress = user.wallet_address;
      socket.email = user.email;

      logger.debug('Socket authenticated', {
        socketId: socket.id,
        userId: user.id,
        walletAddress: user.wallet_address
      });

      next();
    } catch (error) {
      logger.security('Socket authentication failed', {
        error: error.message,
        ip: socket.handshake.address
      });
      next(new Error('Authentication failed'));
    }
  }

  /**
   * Handle new socket connection
   */
  handleConnection(socket) {
    logger.info('Client connected', {
      socketId: socket.id,
      userId: socket.userId,
      walletAddress: socket.walletAddress
    });

    // Store user connection
    this.connectedUsers.set(socket.userId, {
      socketId: socket.id,
      socket,
      connectedAt: new Date(),
      walletAddress: socket.walletAddress
    });

    // Join user-specific room
    socket.join(`user:${socket.userId}`);
    
    // Send welcome message
    socket.emit('connected', {
      message: 'Successfully connected to CoinEstate platform',
      timestamp: new Date().toISOString()
    });

    // Handle room subscription
    socket.on('subscribe', this.handleSubscribe.bind(this, socket));
    socket.on('unsubscribe', this.handleUnsubscribe.bind(this, socket));
    
    // Handle property-specific events
    socket.on('join-property', this.handleJoinProperty.bind(this, socket));
    socket.on('leave-property', this.handleLeaveProperty.bind(this, socket));
    
    // Handle governance events
    socket.on('join-proposal', this.handleJoinProposal.bind(this, socket));
    socket.on('leave-proposal', this.handleLeaveProposal.bind(this, socket));
    
    // Handle portfolio updates
    socket.on('request-portfolio-update', this.handlePortfolioUpdate.bind(this, socket));
    
    // Handle typing indicators for chat
    socket.on('typing', this.handleTyping.bind(this, socket));
    socket.on('stop-typing', this.handleStopTyping.bind(this, socket));

    // Handle disconnection
    socket.on('disconnect', this.handleDisconnection.bind(this, socket));
  }

  /**
   * Handle room subscription
   */
  handleSubscribe(socket, data) {
    const { room, filters = {} } = data;
    
    if (!room) {
      socket.emit('error', { message: 'Room name required' });
      return;
    }

    socket.join(room);
    
    // Store room subscription with filters
    if (!this.rooms.has(room)) {
      this.rooms.set(room, new Map());
    }
    this.rooms.get(room).set(socket.userId, { socket, filters });

    logger.debug('User subscribed to room', {
      userId: socket.userId,
      room,
      filters
    });

    socket.emit('subscribed', { room, timestamp: new Date().toISOString() });
  }

  /**
   * Handle room unsubscription
   */
  handleUnsubscribe(socket, data) {
    const { room } = data;
    
    if (!room) {
      socket.emit('error', { message: 'Room name required' });
      return;
    }

    socket.leave(room);
    
    if (this.rooms.has(room)) {
      this.rooms.get(room).delete(socket.userId);
      if (this.rooms.get(room).size === 0) {
        this.rooms.delete(room);
      }
    }

    logger.debug('User unsubscribed from room', {
      userId: socket.userId,
      room
    });

    socket.emit('unsubscribed', { room, timestamp: new Date().toISOString() });
  }

  /**
   * Handle property room joining
   */
  async handleJoinProperty(socket, data) {
    const { propertyId } = data;
    
    if (!propertyId) {
      socket.emit('error', { message: 'Property ID required' });
      return;
    }

    // Verify user has access to property (owns NFTs or is stakeholder)
    const hasAccess = await this.verifyPropertyAccess(socket.userId, propertyId);
    
    if (!hasAccess) {
      socket.emit('error', { message: 'Access denied to property' });
      return;
    }

    const room = `property:${propertyId}`;
    socket.join(room);
    
    logger.debug('User joined property room', {
      userId: socket.userId,
      propertyId,
      room
    });

    socket.emit('property-joined', { propertyId, timestamp: new Date().toISOString() });
  }

  /**
   * Handle property room leaving
   */
  handleLeaveProperty(socket, data) {
    const { propertyId } = data;
    const room = `property:${propertyId}`;
    socket.leave(room);
    
    socket.emit('property-left', { propertyId, timestamp: new Date().toISOString() });
  }

  /**
   * Handle proposal room joining
   */
  async handleJoinProposal(socket, data) {
    const { proposalId } = data;
    
    if (!proposalId) {
      socket.emit('error', { message: 'Proposal ID required' });
      return;
    }

    // Verify proposal exists and user has voting rights
    const hasVotingRights = await this.verifyVotingRights(socket.userId, proposalId);
    
    if (!hasVotingRights) {
      socket.emit('error', { message: 'No voting rights for this proposal' });
      return;
    }

    const room = `proposal:${proposalId}`;
    socket.join(room);
    
    socket.emit('proposal-joined', { proposalId, timestamp: new Date().toISOString() });
  }

  /**
   * Handle proposal room leaving
   */
  handleLeaveProposal(socket, data) {
    const { proposalId } = data;
    const room = `proposal:${proposalId}`;
    socket.leave(room);
    
    socket.emit('proposal-left', { proposalId, timestamp: new Date().toISOString() });
  }

  /**
   * Handle portfolio update request
   */
  async handlePortfolioUpdate(socket) {
    try {
      // Get fresh portfolio data
      const portfolioResult = await database.query(`
        SELECT 
          p.id,
          p.name,
          up.nft_count,
          up.total_investment,
          up.current_value,
          up.monthly_income,
          up.roi
        FROM user_portfolios up
        JOIN properties p ON up.property_id = p.id
        WHERE up.user_id = $1
        ORDER BY up.total_investment DESC
      `, [socket.userId]);

      socket.emit('portfolio-updated', {
        portfolio: portfolioResult.rows,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Portfolio update failed:', error);
      socket.emit('error', { message: 'Failed to update portfolio' });
    }
  }

  /**
   * Handle typing indicators
   */
  handleTyping(socket, data) {
    const { room } = data;
    socket.to(room).emit('user-typing', {
      userId: socket.userId,
      walletAddress: socket.walletAddress,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Handle stop typing
   */
  handleStopTyping(socket, data) {
    const { room } = data;
    socket.to(room).emit('user-stop-typing', {
      userId: socket.userId,
      walletAddress: socket.walletAddress,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Handle disconnection
   */
  handleDisconnection(socket) {
    logger.info('Client disconnected', {
      socketId: socket.id,
      userId: socket.userId
    });

    // Remove from connected users
    this.connectedUsers.delete(socket.userId);
    
    // Clean up room subscriptions
    this.rooms.forEach((users, room) => {
      users.delete(socket.userId);
      if (users.size === 0) {
        this.rooms.delete(room);
      }
    });
  }

  /**
   * Setup Redis subscriptions for broadcasting
   */
  async setupRedisSubscriptions() {
    // NFT transfer events
    await redis.subscribe('nft:transfer', (data) => {
      this.broadcastNFTTransfer(data);
    });

    // Governance events
    await redis.subscribe('governance:proposal', (data) => {
      this.broadcastProposalCreated(data);
    });

    await redis.subscribe('governance:vote', (data) => {
      this.broadcastVoteCast(data);
    });

    // Property updates
    await redis.subscribe('property:update', (data) => {
      this.broadcastPropertyUpdate(data);
    });

    // Income distributions
    await redis.subscribe('income:distribution', (data) => {
      this.broadcastIncomeDistribution(data);
    });

    logger.debug('Redis subscriptions setup for WebSocket broadcasting');
  }

  /**
   * Broadcast NFT transfer
   */
  broadcastNFTTransfer(data) {
    const { from, to, tokenId, txHash, blockNumber } = data;
    
    // Notify sender and receiver
    this.io.to(`user:${from}`).emit('nft-transfer-out', {
      to,
      tokenId,
      txHash,
      blockNumber,
      timestamp: new Date().toISOString()
    });
    
    this.io.to(`user:${to}`).emit('nft-transfer-in', {
      from,
      tokenId,
      txHash,
      blockNumber,
      timestamp: new Date().toISOString()
    });
    
    // Broadcast to relevant property room
    this.io.to(`property:${data.propertyId}`).emit('nft-transferred', data);
  }

  /**
   * Broadcast proposal created
   */
  broadcastProposalCreated(data) {
    const { proposalId, proposer, propertyId } = data;
    
    this.io.to(`property:${propertyId}`).emit('proposal-created', {
      proposalId,
      proposer,
      propertyId,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Broadcast vote cast
   */
  broadcastVoteCast(data) {
    const { voter, proposalId, support, weight } = data;
    
    this.io.to(`proposal:${proposalId}`).emit('vote-cast', {
      voter,
      proposalId,
      support,
      weight,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Broadcast property update
   */
  broadcastPropertyUpdate(data) {
    const { propertyId, updates } = data;
    
    this.io.to(`property:${propertyId}`).emit('property-updated', {
      propertyId,
      updates,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Broadcast income distribution
   */
  broadcastIncomeDistribution(data) {
    const { propertyId, amount, recipients } = data;
    
    // Notify all recipients
    recipients.forEach(recipient => {
      this.io.to(`user:${recipient.userId}`).emit('income-received', {
        propertyId,
        amount: recipient.amount,
        totalDistribution: amount,
        timestamp: new Date().toISOString()
      });
    });
  }

  /**
   * Send notification to specific user
   */
  sendToUser(userId, event, data) {
    this.io.to(`user:${userId}`).emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Send notification to property stakeholders
   */
  sendToProperty(propertyId, event, data) {
    this.io.to(`property:${propertyId}`).emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Broadcast to all connected users
   */
  broadcast(event, data) {
    this.io.emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Verify property access
   */
  async verifyPropertyAccess(userId, propertyId) {
    try {
      const result = await database.query(
        'SELECT COUNT(*) as count FROM nfts n JOIN users u ON n.owner_address = u.wallet_address WHERE u.id = $1 AND n.property_id = $2',
        [userId, propertyId]
      );
      return parseInt(result.rows[0].count) > 0;
    } catch (error) {
      logger.error('Property access verification failed:', error);
      return false;
    }
  }

  /**
   * Verify voting rights
   */
  async verifyVotingRights(userId, proposalId) {
    try {
      const result = await database.query(`
        SELECT COUNT(*) as count 
        FROM nfts n 
        JOIN users u ON n.owner_address = u.wallet_address 
        JOIN proposals p ON n.property_id = p.property_id 
        WHERE u.id = $1 AND p.id = $2
      `, [userId, proposalId]);
      return parseInt(result.rows[0].count) > 0;
    } catch (error) {
      logger.error('Voting rights verification failed:', error);
      return false;
    }
  }

  /**
   * Get connection statistics
   */
  getStats() {
    return {
      connectedUsers: this.connectedUsers.size,
      activeRooms: this.rooms.size,
      totalConnections: this.io.sockets.sockets.size
    };
  }
}

// Create singleton instance
const webSocketService = new WebSocketService();

/**
 * Setup WebSocket server
 */
export const setupWebSocket = (httpServer) => {
  webSocketService.initialize(httpServer);
};

/**
 * Export WebSocket service
 */
export { webSocketService };
export default webSocketService;