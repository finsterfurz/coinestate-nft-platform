/**
 * CoinEstate Backend - Scheduler Service
 * Cron jobs for automated tasks
 */

import cron from 'node-cron';
import { config } from '../config/index.js';
import logger from '../utils/logger.js';
import { database } from '../database/connection.js';
import { redis } from './redis.js';
import { queueService } from './queue.js';
import { blockchain } from './blockchain.js';

class SchedulerService {
  constructor() {
    this.jobs = new Map();
    this.isRunning = false;
  }

  /**
   * Start all cron jobs
   */
  start() {
    if (this.isRunning) {
      return;
    }

    try {
      // Sync blockchain data every 5 minutes
      this.scheduleJob('sync-blockchain', '*/5 * * * *', this.syncBlockchainData.bind(this));
      
      // Update property metrics daily at 2 AM
      this.scheduleJob('update-property-metrics', '0 2 * * *', this.updatePropertyMetrics.bind(this));
      
      // Calculate portfolio performance daily at 3 AM
      this.scheduleJob('calculate-portfolio-performance', '0 3 * * *', this.calculatePortfolioPerformance.bind(this));
      
      // Process income distributions monthly on 1st at 4 AM
      this.scheduleJob('process-income-distributions', '0 4 1 * *', this.processIncomeDistributions.bind(this));
      
      // Clean expired sessions every hour
      this.scheduleJob('clean-expired-sessions', '0 * * * *', this.cleanExpiredSessions.bind(this));
      
      // Generate daily analytics report at 5 AM
      this.scheduleJob('generate-daily-analytics', '0 5 * * *', this.generateDailyAnalytics.bind(this));
      
      // Check proposal statuses every 10 minutes
      this.scheduleJob('check-proposal-statuses', '*/10 * * * *', this.checkProposalStatuses.bind(this));
      
      // Backup database daily at 1 AM
      this.scheduleJob('backup-database', '0 1 * * *', this.backupDatabase.bind(this));
      
      // Clean old log files weekly on Sunday at 6 AM
      this.scheduleJob('clean-logs', '0 6 * * 0', this.cleanLogFiles.bind(this));
      
      // Update exchange rates every hour
      this.scheduleJob('update-exchange-rates', '0 * * * *', this.updateExchangeRates.bind(this));
      
      this.isRunning = true;
      
      logger.info('✅ Scheduler service started', {
        jobs: Array.from(this.jobs.keys())
      });
      
    } catch (error) {
      logger.error('❌ Failed to start scheduler service:', error);
      throw error;
    }
  }

  /**
   * Stop all cron jobs
   */
  stop() {
    this.jobs.forEach((job, name) => {
      job.stop();
      logger.info('Cron job stopped', { name });
    });
    
    this.jobs.clear();
    this.isRunning = false;
    
    logger.info('🛑 Scheduler service stopped');
  }

  /**
   * Schedule a cron job
   */
  scheduleJob(name, schedule, task) {
    try {
      const job = cron.schedule(schedule, async () => {
        const startTime = Date.now();
        
        try {
          logger.info('Cron job started', { name, schedule });
          await task();
          
          const duration = Date.now() - startTime;
          logger.info('Cron job completed', { name, duration: `${duration}ms` });
          
        } catch (error) {
          const duration = Date.now() - startTime;
          logger.error('Cron job failed', {
            name,
            error: error.message,
            duration: `${duration}ms`
          });
        }
      }, {
        scheduled: false,
        timezone: 'UTC'
      });
      
      this.jobs.set(name, job);
      job.start();
      
      logger.debug('Cron job scheduled', { name, schedule });
      
    } catch (error) {
      logger.error('Failed to schedule cron job', { name, error: error.message });
      throw error;
    }
  }

  /**
   * Sync blockchain data
   */
  async syncBlockchainData() {
    await queueService.addJob('data-processing', 'sync-blockchain-data', {
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Update property metrics
   */
  async updatePropertyMetrics() {
    try {
      const properties = await database.query(
        'SELECT id, total_value, monthly_rent, occupancy_rate FROM properties WHERE status = $1',
        ['active']
      );
      
      for (const property of properties.rows) {
        const today = new Date().toISOString().split('T')[0];
        
        // Calculate metrics
        const monthlyIncome = property.monthly_rent * (property.occupancy_rate / 100);
        const annualIncome = monthlyIncome * 12;
        const roi = (annualIncome / property.total_value) * 100;
        
        // Insert or update metrics
        await database.query(`
          INSERT INTO property_metrics (property_id, date, occupancy_rate, rental_income, roi, property_value)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (property_id, date)
          DO UPDATE SET
            occupancy_rate = EXCLUDED.occupancy_rate,
            rental_income = EXCLUDED.rental_income,
            roi = EXCLUDED.roi,
            property_value = EXCLUDED.property_value
        `, [property.id, today, property.occupancy_rate, monthlyIncome, roi, property.total_value]);
      }
      
      logger.info('Property metrics updated', { count: properties.rows.length });
    } catch (error) {
      logger.error('Property metrics update failed:', error);
    }
  }

  /**
   * Calculate portfolio performance
   */
  async calculatePortfolioPerformance() {
    try {
      const users = await database.query(
        'SELECT DISTINCT u.id FROM users u JOIN user_portfolios up ON u.id = up.user_id'
      );
      
      for (const user of users.rows) {
        await queueService.addJob('data-processing', 'update-portfolio', {
          userId: user.id
        });
      }
      
      logger.info('Portfolio performance calculation queued', { users: users.rows.length });
    } catch (error) {
      logger.error('Portfolio performance calculation failed:', error);
    }
  }

  /**
   * Process income distributions
   */
  async processIncomeDistributions() {
    try {
      const properties = await database.query(`
        SELECT 
          p.id,
          p.name,
          p.monthly_rent,
          p.occupancy_rate,
          p.nft_count,
          COUNT(n.id) as minted_nfts
        FROM properties p
        LEFT JOIN nfts n ON p.id = n.property_id
        WHERE p.status = 'active' AND p.monthly_rent > 0
        GROUP BY p.id
        HAVING COUNT(n.id) > 0
      `);
      
      const currentDate = new Date();
      const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      const thisMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      
      for (const property of properties.rows) {
        const totalIncome = property.monthly_rent * (property.occupancy_rate / 100);
        const perNftAmount = totalIncome / property.minted_nfts;
        
        // Create income distribution record
        const distributionResult = await database.query(`
          INSERT INTO income_distributions (
            property_id, period_start, period_end, total_income, 
            net_income, per_nft_amount
          )
          VALUES ($1, $2, $3, $4, $4, $5)
          RETURNING id
        `, [property.id, lastMonth, thisMonth, totalIncome, perNftAmount]);
        
        const distributionId = distributionResult.rows[0].id;
        
        // Get NFT holders for this property
        const nftHolders = await database.query(`
          SELECT n.owner_address, u.id as user_id, u.email, COUNT(n.id) as nft_count
          FROM nfts n
          JOIN users u ON n.owner_address = u.wallet_address
          WHERE n.property_id = $1
          GROUP BY n.owner_address, u.id, u.email
        `, [property.id]);
        
        // Send income notifications
        for (const holder of nftHolders.rows) {
          const holderAmount = perNftAmount * holder.nft_count;
          
          if (holder.email) {
            await queueService.addJob('email', 'send-income-notification', {
              userId: holder.user_id,
              email: holder.email,
              amount: holderAmount,
              propertyName: property.name,
              period: `${lastMonth.toISOString().split('T')[0]} to ${thisMonth.toISOString().split('T')[0]}`
            });
          }
        }
        
        logger.info('Income distribution processed', {
          propertyId: property.id,
          propertyName: property.name,
          totalIncome,
          recipients: nftHolders.rows.length
        });
      }
      
    } catch (error) {
      logger.error('Income distribution processing failed:', error);
    }
  }

  /**
   * Clean expired sessions
   */
  async cleanExpiredSessions() {
    try {
      const pattern = 'auth:*';
      const keys = await redis.getClient().keys(pattern);
      let cleaned = 0;
      
      for (const key of keys) {
        const ttl = await redis.ttl(key);
        if (ttl === -1 || ttl === -2) {
          await redis.del(key);
          cleaned++;
        }
      }
      
      logger.info('Expired sessions cleaned', { cleaned, total: keys.length });
    } catch (error) {
      logger.error('Session cleanup failed:', error);
    }
  }

  /**
   * Generate daily analytics
   */
  async generateDailyAnalytics() {
    await queueService.addJob('analytics', 'generate-report', {
      type: 'daily',
      date: new Date().toISOString().split('T')[0]
    });
  }

  /**
   * Check proposal statuses
   */
  async checkProposalStatuses() {
    try {
      // Check for proposals that should be active
      await database.query(`
        UPDATE proposals 
        SET status = 'active' 
        WHERE status = 'draft' 
          AND voting_starts_at <= NOW()
      `);
      
      // Check for proposals that should be expired
      const expiredProposals = await database.query(`
        UPDATE proposals 
        SET status = 'expired' 
        WHERE status = 'active' 
          AND voting_ends_at < NOW()
        RETURNING id, title
      `);
      
      // Check for proposals that passed and can be executed
      const passedProposals = await database.query(`
        SELECT id, title, votes_for, votes_against, total_voting_power, quorum_required, threshold_required
        FROM proposals 
        WHERE status = 'active' 
          AND voting_ends_at < NOW()
      `);
      
      for (const proposal of passedProposals.rows) {
        const totalVotes = proposal.votes_for + proposal.votes_against;
        const quorumMet = (totalVotes / proposal.total_voting_power) * 100 >= proposal.quorum_required;
        const thresholdMet = (proposal.votes_for / totalVotes) * 100 >= proposal.threshold_required;
        
        if (quorumMet && thresholdMet) {
          await database.query(
            'UPDATE proposals SET status = $1 WHERE id = $2',
            ['passed', proposal.id]
          );
          
          logger.info('Proposal passed', {
            proposalId: proposal.id,
            title: proposal.title
          });
        } else {
          await database.query(
            'UPDATE proposals SET status = $1 WHERE id = $2',
            ['rejected', proposal.id]
          );
          
          logger.info('Proposal rejected', {
            proposalId: proposal.id,
            title: proposal.title,
            reason: !quorumMet ? 'Quorum not met' : 'Threshold not met'
          });
        }
      }
      
      if (expiredProposals.rows.length > 0) {
        logger.info('Proposals expired', { count: expiredProposals.rows.length });
      }
      
    } catch (error) {
      logger.error('Proposal status check failed:', error);
    }
  }

  /**
   * Backup database
   */
  async backupDatabase() {
    // This would typically use pg_dump or similar
    logger.info('Database backup scheduled (implementation needed)');
  }

  /**
   * Clean log files
   */
  async cleanLogFiles() {
    logger.info('Log file cleanup scheduled (implementation needed)');
  }

  /**
   * Update exchange rates
   */
  async updateExchangeRates() {
    try {
      // This would fetch current ETH/USD rates from an API
      // and store them in Redis for use in the application
      const cacheKey = 'exchange:rates';
      const mockRates = {
        ETH_USD: 2000,
        EUR_USD: 1.1,
        updated_at: new Date().toISOString()
      };
      
      await redis.setex(cacheKey, 3600, mockRates);
      
      logger.debug('Exchange rates updated', mockRates);
    } catch (error) {
      logger.error('Exchange rate update failed:', error);
    }
  }

  /**
   * Get job status
   */
  getJobStatus(name) {
    const job = this.jobs.get(name);
    return job ? {
      name,
      running: job.running,
      scheduled: job.scheduled
    } : null;
  }

  /**
   * Get all job statuses
   */
  getAllJobStatuses() {
    const statuses = {};
    
    this.jobs.forEach((job, name) => {
      statuses[name] = {
        running: job.running,
        scheduled: job.scheduled
      };
    });
    
    return statuses;
  }
}

// Create singleton instance
const schedulerService = new SchedulerService();

/**
 * Start cron jobs
 */
export const startCronJobs = () => {
  if (config.isDevelopment && config.development.debugMode) {
    logger.info('🧪 Skipping cron jobs in development debug mode');
    return;
  }
  
  schedulerService.start();
};

/**
 * Stop cron jobs
 */
export const stopCronJobs = () => {
  schedulerService.stop();
};

/**
 * Export scheduler service
 */
export { schedulerService };
export default schedulerService;