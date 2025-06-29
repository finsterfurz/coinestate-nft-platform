/**
 * CoinEstate Backend - Queue Service
 * Background job processing with Bull/Redis
 */

import Queue from 'bull';
import { config } from '../config/index.js';
import logger from '../utils/logger.js';
import { redis } from './redis.js';
import { blockchain } from './blockchain.js';
import { database } from '../database/connection.js';
import { emailService } from './email.js';

class QueueService {
  constructor() {
    this.queues = new Map();
    this.isInitialized = false;
  }

  /**
   * Initialize queue service
   */
  async initialize() {
    try {
      // Create queues
      this.createQueues();
      
      // Setup processors
      this.setupProcessors();
      
      // Setup event handlers
      this.setupEventHandlers();
      
      this.isInitialized = true;
      
      logger.info('✅ Queue service initialized', {
        queues: Array.from(this.queues.keys())
      });
      
    } catch (error) {
      logger.error('❌ Queue service initialization failed:', error);
      throw error;
    }
  }

  /**
   * Create Bull queues
   */
  createQueues() {
    const queueOptions = {
      redis: {
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password || undefined,
        db: config.redis.db
      },
      defaultJobOptions: {
        removeOnComplete: 50,
        removeOnFail: 100,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000
        }
      }
    };

    // Email queue
    this.queues.set('email', new Queue('email processing', queueOptions));
    
    // Blockchain queue
    this.queues.set('blockchain', new Queue('blockchain operations', queueOptions));
    
    // Notifications queue
    this.queues.set('notifications', new Queue('notifications', queueOptions));
    
    // Data processing queue
    this.queues.set('data-processing', new Queue('data processing', queueOptions));
    
    // Analytics queue
    this.queues.set('analytics', new Queue('analytics processing', queueOptions));
    
    // File processing queue
    this.queues.set('file-processing', new Queue('file processing', queueOptions));
  }

  /**
   * Setup queue processors
   */
  setupProcessors() {
    // Email processors
    this.queues.get('email').process('send-welcome', 5, this.processWelcomeEmail.bind(this));
    this.queues.get('email').process('send-notification', 10, this.processNotificationEmail.bind(this));
    this.queues.get('email').process('send-kyc-update', 3, this.processKYCUpdateEmail.bind(this));
    this.queues.get('email').process('send-income-notification', 5, this.processIncomeNotificationEmail.bind(this));
    
    // Blockchain processors
    this.queues.get('blockchain').process('mint-nft', 2, this.processMintNFT.bind(this));
    this.queues.get('blockchain').process('transfer-nft', 2, this.processTransferNFT.bind(this));
    this.queues.get('blockchain').process('create-proposal', 1, this.processCreateProposal.bind(this));
    this.queues.get('blockchain').process('cast-vote', 3, this.processCastVote.bind(this));
    this.queues.get('blockchain').process('execute-proposal', 1, this.processExecuteProposal.bind(this));
    
    // Notification processors
    this.queues.get('notifications').process('push-notification', 10, this.processPushNotification.bind(this));
    this.queues.get('notifications').process('sms-notification', 5, this.processSMSNotification.bind(this));
    
    // Data processing processors
    this.queues.get('data-processing').process('update-portfolio', 5, this.processPortfolioUpdate.bind(this));
    this.queues.get('data-processing').process('calculate-roi', 3, this.processROICalculation.bind(this));
    this.queues.get('data-processing').process('sync-blockchain-data', 1, this.processSyncBlockchainData.bind(this));
    
    // Analytics processors
    this.queues.get('analytics').process('generate-report', 2, this.processGenerateReport.bind(this));
    this.queues.get('analytics').process('update-metrics', 5, this.processUpdateMetrics.bind(this));
    
    // File processing processors
    this.queues.get('file-processing').process('process-image', 3, this.processImage.bind(this));
    this.queues.get('file-processing').process('process-document', 2, this.processDocument.bind(this));
  }

  /**
   * Setup event handlers for monitoring
   */
  setupEventHandlers() {
    this.queues.forEach((queue, name) => {
      queue.on('completed', (job, result) => {
        logger.debug('Job completed', {
          queue: name,
          jobId: job.id,
          type: job.name,
          duration: Date.now() - job.timestamp
        });
      });

      queue.on('failed', (job, error) => {
        logger.error('Job failed', {
          queue: name,
          jobId: job.id,
          type: job.name,
          error: error.message,
          attempts: job.attemptsMade
        });
      });

      queue.on('stalled', (job) => {
        logger.warn('Job stalled', {
          queue: name,
          jobId: job.id,
          type: job.name
        });
      });
    });
  }

  /**
   * Email processors
   */
  async processWelcomeEmail(job) {
    const { userId, email, walletAddress } = job.data;
    
    try {
      await emailService.sendWelcomeEmail(email, {
        walletAddress
      });
      
      logger.info('Welcome email sent', { userId, email });
      return { success: true, sentAt: new Date().toISOString() };
    } catch (error) {
      logger.error('Welcome email failed:', error);
      throw error;
    }
  }

  async processNotificationEmail(job) {
    const { userId, email, subject, template, data } = job.data;
    
    try {
      await emailService.sendNotificationEmail(email, subject, template, data);
      
      logger.info('Notification email sent', { userId, email, subject });
      return { success: true, sentAt: new Date().toISOString() };
    } catch (error) {
      logger.error('Notification email failed:', error);
      throw error;
    }
  }

  async processKYCUpdateEmail(job) {
    const { userId, email, status, details } = job.data;
    
    try {
      await emailService.sendKYCUpdateEmail(email, status, details);
      
      logger.info('KYC update email sent', { userId, email, status });
      return { success: true, sentAt: new Date().toISOString() };
    } catch (error) {
      logger.error('KYC update email failed:', error);
      throw error;
    }
  }

  async processIncomeNotificationEmail(job) {
    const { userId, email, amount, propertyName, period } = job.data;
    
    try {
      await emailService.sendIncomeNotificationEmail(email, {
        amount,
        propertyName,
        period
      });
      
      logger.info('Income notification email sent', { userId, email, amount });
      return { success: true, sentAt: new Date().toISOString() };
    } catch (error) {
      logger.error('Income notification email failed:', error);
      throw error;
    }
  }

  /**
   * Blockchain processors
   */
  async processMintNFT(job) {
    const { to, tokenId, tokenURI, propertyId } = job.data;
    
    try {
      const result = await blockchain.mintNFT(to, tokenId, tokenURI);
      
      // Update database
      await database.query(
        'INSERT INTO nfts (token_id, property_id, owner_address, metadata_uri, tx_hash) VALUES ($1, $2, $3, $4, $5)',
        [tokenId, propertyId, to, tokenURI, result.txHash]
      );
      
      logger.info('NFT minted', { tokenId, to, txHash: result.txHash });
      return result;
    } catch (error) {
      logger.error('NFT minting failed:', error);
      throw error;
    }
  }

  async processTransferNFT(job) {
    const { from, to, tokenId } = job.data;
    
    try {
      const result = await blockchain.transferNFT(from, to, tokenId);
      
      // Update database
      await database.query(
        'UPDATE nfts SET owner_address = $1, previous_owner_address = $2, updated_at = NOW() WHERE token_id = $3',
        [to, from, tokenId]
      );
      
      logger.info('NFT transferred', { tokenId, from, to, txHash: result.txHash });
      return result;
    } catch (error) {
      logger.error('NFT transfer failed:', error);
      throw error;
    }
  }

  async processCreateProposal(job) {
    const { proposalId, propertyId, description, callData } = job.data;
    
    try {
      const result = await blockchain.createProposal(propertyId, description, callData);
      
      // Update database with transaction hash
      await database.query(
        'UPDATE proposals SET execution_tx_hash = $1 WHERE id = $2',
        [result.txHash, proposalId]
      );
      
      logger.info('Proposal created on blockchain', { proposalId, txHash: result.txHash });
      return result;
    } catch (error) {
      logger.error('Proposal creation failed:', error);
      throw error;
    }
  }

  async processCastVote(job) {
    const { proposalId, voter, support, reason } = job.data;
    
    try {
      const result = await blockchain.castVote(proposalId, support, reason);
      
      // Update database
      await database.query(
        'UPDATE votes SET tx_hash = $1 WHERE proposal_id = $2 AND voter = $3',
        [result.txHash, proposalId, voter]
      );
      
      logger.info('Vote cast on blockchain', { proposalId, voter, support, txHash: result.txHash });
      return result;
    } catch (error) {
      logger.error('Vote casting failed:', error);
      throw error;
    }
  }

  async processExecuteProposal(job) {
    const { proposalId } = job.data;
    
    try {
      const result = await blockchain.executeProposal(proposalId);
      
      // Update database
      await database.query(
        'UPDATE proposals SET status = $1, executed_at = NOW(), execution_tx_hash = $2 WHERE id = $3',
        ['executed', result.txHash, proposalId]
      );
      
      logger.info('Proposal executed on blockchain', { proposalId, txHash: result.txHash });
      return result;
    } catch (error) {
      logger.error('Proposal execution failed:', error);
      throw error;
    }
  }

  /**
   * Data processing processors
   */
  async processPortfolioUpdate(job) {
    const { userId } = job.data;
    
    try {
      // Recalculate user portfolio
      const portfolioData = await database.query(`
        SELECT 
          p.id as property_id,
          COUNT(n.id) as nft_count,
          SUM(n.purchase_price) as total_investment,
          SUM(n.current_value) as current_value,
          SUM(n.voting_power) as voting_power
        FROM nfts n
        JOIN properties p ON n.property_id = p.id
        JOIN users u ON n.owner_address = u.wallet_address
        WHERE u.id = $1
        GROUP BY p.id
      `, [userId]);
      
      // Update portfolio table
      for (const row of portfolioData.rows) {
        await database.query(`
          INSERT INTO user_portfolios (user_id, property_id, nft_count, total_investment, current_value, voting_power)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (user_id, property_id)
          DO UPDATE SET
            nft_count = EXCLUDED.nft_count,
            total_investment = EXCLUDED.total_investment,
            current_value = EXCLUDED.current_value,
            voting_power = EXCLUDED.voting_power,
            last_updated = NOW()
        `, [userId, row.property_id, row.nft_count, row.total_investment, row.current_value, row.voting_power]);
      }
      
      logger.info('Portfolio updated', { userId, properties: portfolioData.rows.length });
      return { success: true, updatedProperties: portfolioData.rows.length };
    } catch (error) {
      logger.error('Portfolio update failed:', error);
      throw error;
    }
  }

  /**
   * Add job to queue
   */
  async addJob(queueName, jobType, data, options = {}) {
    if (!this.queues.has(queueName)) {
      throw new Error(`Queue '${queueName}' not found`);
    }
    
    const queue = this.queues.get(queueName);
    const job = await queue.add(jobType, data, {
      delay: options.delay || 0,
      priority: options.priority || 0,
      attempts: options.attempts || 3,
      removeOnComplete: options.removeOnComplete || 50,
      removeOnFail: options.removeOnFail || 100,
      ...options
    });
    
    logger.debug('Job added to queue', {
      queue: queueName,
      jobType,
      jobId: job.id,
      data: Object.keys(data)
    });
    
    return job;
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(queueName) {
    if (!this.queues.has(queueName)) {
      throw new Error(`Queue '${queueName}' not found`);
    }
    
    const queue = this.queues.get(queueName);
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaiting(),
      queue.getActive(),
      queue.getCompleted(),
      queue.getFailed(),
      queue.getDelayed()
    ]);
    
    return {
      name: queueName,
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      delayed: delayed.length
    };
  }

  /**
   * Get all queue statistics
   */
  async getAllQueueStats() {
    const stats = {};
    
    for (const queueName of this.queues.keys()) {
      stats[queueName] = await this.getQueueStats(queueName);
    }
    
    return stats;
  }

  /**
   * Pause queue
   */
  async pauseQueue(queueName) {
    if (!this.queues.has(queueName)) {
      throw new Error(`Queue '${queueName}' not found`);
    }
    
    const queue = this.queues.get(queueName);
    await queue.pause();
    
    logger.info('Queue paused', { queue: queueName });
  }

  /**
   * Resume queue
   */
  async resumeQueue(queueName) {
    if (!this.queues.has(queueName)) {
      throw new Error(`Queue '${queueName}' not found`);
    }
    
    const queue = this.queues.get(queueName);
    await queue.resume();
    
    logger.info('Queue resumed', { queue: queueName });
  }

  /**
   * Clean queue
   */
  async cleanQueue(queueName, grace = 0, status = 'completed') {
    if (!this.queues.has(queueName)) {
      throw new Error(`Queue '${queueName}' not found`);
    }
    
    const queue = this.queues.get(queueName);
    const cleaned = await queue.clean(grace, status);
    
    logger.info('Queue cleaned', { queue: queueName, cleaned, status });
    return cleaned;
  }
}

// Create singleton instance
const queueService = new QueueService();

/**
 * Initialize queue service
 */
export const initializeQueue = async () => {
  await queueService.initialize();
};

/**
 * Export queue service
 */
export { queueService };
export default queueService;