const Proposal = require('../models/Proposal');
const Vote = require('../models/Vote');
const NFT = require('../models/NFT');
const Property = require('../models/Property');
const User = require('../models/User');
const logger = require('../utils/logger');

class GovernanceService {
  /**
   * Get proposals with pagination and filters
   */
  async getProposals({ page = 1, limit = 12, filters = {}, sortBy = 'createdAt', sortOrder = 'desc' }) {
    try {
      const skip = (page - 1) * limit;
      const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

      // Build query
      const query = {};
      
      if (filters.status) {
        query.status = filters.status;
      }
      
      if (filters.type) {
        query.type = filters.type;
      }
      
      if (filters.propertyId) {
        query.propertyId = filters.propertyId;
      }

      const proposals = await Proposal.find(query)
        .populate('proposedBy', 'username avatar')
        .populate('propertyId', 'title location')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean();

      // Add voting statistics to each proposal
      const proposalsWithStats = await Promise.all(
        proposals.map(async (proposal) => {
          const votingStats = await this.calculateVotingStats(proposal._id);
          return {
            ...proposal,
            votingStats
          };
        })
      );

      const total = await Proposal.countDocuments(query);
      const pages = Math.ceil(total / limit);

      return {
        proposals: proposalsWithStats,
        page,
        limit,
        total,
        pages
      };
    } catch (error) {
      logger.error('Error in getProposals:', error);
      throw error;
    }
  }

  /**
   * Get proposal by ID
   */
  async getProposalById(id) {
    try {
      const proposal = await Proposal.findById(id)
        .populate('proposedBy', 'username avatar walletAddress')
        .populate('propertyId')
        .lean();

      if (!proposal) {
        return null;
      }

      // Add voting statistics
      const votingStats = await this.calculateVotingStats(id);
      
      return {
        ...proposal,
        votingStats
      };
    } catch (error) {
      if (error.name === 'CastError') {
        throw new Error('Invalid proposal ID format');
      }
      logger.error('Error in getProposalById:', error);
      throw error;
    }
  }

  /**
   * Create new proposal
   */
  async createProposal(proposalData, user) {
    try {
      // Check if user has enough voting power
      const minVotingPower = process.env.MIN_VOTING_POWER_TO_PROPOSE || 1000;
      let userVotingPower = 0;

      if (proposalData.propertyId) {
        const votingPower = await this.getVotingPower(user.id, proposalData.propertyId);
        userVotingPower = votingPower.totalVotingPower;
      } else {
        // For global proposals, check total voting power across all properties
        const userNFTs = await NFT.find({ 'ownership.owner': user.id });
        userVotingPower = userNFTs.reduce((total, nft) => {
          const ownership = nft.ownership.find(o => o.owner.toString() === user.id);
          return total + (ownership ? ownership.shares : 0);
        }, 0);
      }

      if (userVotingPower < minVotingPower) {
        throw new Error(`Insufficient voting power. Minimum ${minVotingPower} shares required`);
      }

      // Check for duplicate proposals (similar title and description)
      const existingProposal = await Proposal.findOne({
        title: { $regex: new RegExp(proposalData.title, 'i') },
        status: { $in: ['pending', 'active'] },
        propertyId: proposalData.propertyId
      });

      if (existingProposal) {
        throw new Error('Duplicate proposal: A similar active proposal already exists');
      }

      // Set voting period and thresholds
      const votingDelay = proposalData.votingDelay || 24 * 60 * 60; // 24 hours in seconds
      const votingPeriod = proposalData.votingPeriod || 7 * 24 * 60 * 60; // 7 days in seconds
      
      const startTime = new Date(Date.now() + votingDelay * 1000);
      const endTime = new Date(startTime.getTime() + votingPeriod * 1000);

      const proposal = await Proposal.create({
        ...proposalData,
        startTime,
        endTime,
        quorumThreshold: proposalData.quorumThreshold || 0.1, // 10% default
        approvalThreshold: proposalData.approvalThreshold || 0.6, // 60% default
        status: votingDelay > 0 ? 'pending' : 'active'
      });

      return await this.getProposalById(proposal._id);
    } catch (error) {
      logger.error('Error in createProposal:', error);
      throw error;
    }
  }

  /**
   * Vote on a proposal
   */
  async voteOnProposal({ proposalId, voterId, support, reason }) {
    try {
      const proposal = await Proposal.findById(proposalId);
      if (!proposal) {
        throw new Error('Proposal not found');
      }

      // Check if voting is active
      const now = new Date();
      if (now < proposal.startTime) {
        throw new Error('Voting has not started yet');
      }
      if (now > proposal.endTime) {
        throw new Error('Voting period has ended');
      }
      if (proposal.status !== 'active') {
        throw new Error('Proposal is not active for voting');
      }

      // Check if user already voted
      const existingVote = await Vote.findOne({ proposalId, voter: voterId });
      if (existingVote) {
        throw new Error('Already voted on this proposal');
      }

      // Calculate user's voting power
      let votingPower = 0;
      if (proposal.propertyId) {
        const userVotingPower = await this.getVotingPower(voterId, proposal.propertyId);
        votingPower = userVotingPower.totalVotingPower;
      } else {
        // For global proposals, use total shares across all properties
        const userNFTs = await NFT.find({ 'ownership.owner': voterId });
        votingPower = userNFTs.reduce((total, nft) => {
          const ownership = nft.ownership.find(o => o.owner.toString() === voterId);
          return total + (ownership ? ownership.shares : 0);
        }, 0);
      }

      if (votingPower === 0) {
        throw new Error('No voting power for this proposal');
      }

      // Create vote
      const vote = await Vote.create({
        proposalId,
        voter: voterId,
        support,
        votingPower,
        reason: reason || '',
        timestamp: new Date()
      });

      // Update proposal vote counts
      await this.updateProposalVoteCounts(proposalId);

      // Check if proposal should be executed automatically
      await this.checkProposalExecution(proposalId);

      return vote;
    } catch (error) {
      logger.error('Error in voteOnProposal:', error);
      throw error;
    }
  }

  /**
   * Execute a proposal
   */
  async executeProposal(proposalId, user) {
    try {
      const proposal = await Proposal.findById(proposalId);
      if (!proposal) {
        throw new Error('Proposal not found');
      }

      // Check if proposal can be executed
      if (proposal.status !== 'succeeded') {
        throw new Error('Cannot execute proposal: Proposal has not succeeded');
      }

      // Check authorization (admin or DAO contract)
      if (!user.role.includes('admin') && !user.role.includes('dao')) {
        throw new Error('Unauthorized to execute proposals');
      }

      // Execute proposal actions (simplified - in production, integrate with smart contracts)
      const executionResults = [];
      
      for (const action of proposal.actions) {
        try {
          // This would integrate with blockchain/smart contract execution
          const result = await this.executeAction(action, proposal);
          executionResults.push({
            action: action.signature,
            status: 'success',
            result
          });
        } catch (actionError) {
          executionResults.push({
            action: action.signature,
            status: 'failed',
            error: actionError.message
          });
        }
      }

      // Update proposal status
      proposal.status = 'executed';
      proposal.executedAt = new Date();
      proposal.executedBy = user.id;
      proposal.executionResults = executionResults;

      await proposal.save();

      return {
        proposalId,
        status: 'executed',
        executionResults
      };
    } catch (error) {
      logger.error('Error in executeProposal:', error);
      throw error;
    }
  }

  /**
   * Get user's voting power for a property
   */
  async getVotingPower(userId, propertyId) {
    try {
      const property = await Property.findById(propertyId);
      if (!property) {
        throw new Error('Property not found');
      }

      // Find user's NFT ownership for this property
      const nft = await NFT.findOne({ propertyId });
      if (!nft) {
        return {
          propertyId,
          directVotingPower: 0,
          delegatedVotingPower: 0,
          totalVotingPower: 0,
          ownershipPercentage: 0
        };
      }

      const userOwnership = nft.ownership.find(
        ownership => ownership.owner.toString() === userId
      );

      const directVotingPower = userOwnership ? userOwnership.shares : 0;
      
      // Calculate delegated voting power (simplified)
      const delegatedVotingPower = 0; // Would implement delegation logic here

      const totalVotingPower = directVotingPower + delegatedVotingPower;
      const ownershipPercentage = nft.totalShares > 0 ? 
        (totalVotingPower / nft.totalShares) * 100 : 0;

      return {
        propertyId,
        directVotingPower,
        delegatedVotingPower,
        totalVotingPower,
        ownershipPercentage: Math.round(ownershipPercentage * 100) / 100
      };
    } catch (error) {
      logger.error('Error in getVotingPower:', error);
      throw error;
    }
  }

  /**
   * Get proposal votes
   */
  async getProposalVotes({ proposalId, page = 1, limit = 20, support, sortBy = 'createdAt', sortOrder = 'desc' }) {
    try {
      const skip = (page - 1) * limit;
      const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

      // Verify proposal exists
      const proposal = await Proposal.findById(proposalId);
      if (!proposal) {
        throw new Error('Proposal not found');
      }

      const query = { proposalId };
      if (support) {
        query.support = support;
      }

      const votes = await Vote.find(query)
        .populate('voter', 'username avatar')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await Vote.countDocuments(query);
      const pages = Math.ceil(total / limit);

      return {
        votes,
        page,
        limit,
        total,
        pages
      };
    } catch (error) {
      logger.error('Error in getProposalVotes:', error);
      throw error;
    }
  }

  /**
   * Get governance analytics
   */
  async getGovernanceAnalytics({ propertyId, timeframe = '30d' }) {
    try {
      const now = new Date();
      let startDate;

      switch (timeframe) {
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case '1y':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      const query = { createdAt: { $gte: startDate } };
      if (propertyId) {
        query.propertyId = propertyId;
      }

      // Get proposal statistics
      const totalProposals = await Proposal.countDocuments(query);
      const activeProposals = await Proposal.countDocuments({ ...query, status: 'active' });
      const succeededProposals = await Proposal.countDocuments({ ...query, status: 'succeeded' });
      const executedProposals = await Proposal.countDocuments({ ...query, status: 'executed' });

      // Get voting participation
      const votes = await Vote.find({ 
        timestamp: { $gte: startDate },
        ...(propertyId && { proposalId: { $in: await Proposal.distinct('_id', { propertyId }) } })
      });

      const totalVotes = votes.length;
      const uniqueVoters = [...new Set(votes.map(vote => vote.voter.toString()))].length;

      // Get proposal types distribution
      const proposalsByType = await Proposal.aggregate([
        { $match: query },
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]);

      // Get average voting participation
      const proposalsWithVotes = await Proposal.find(query);
      const avgParticipation = proposalsWithVotes.length > 0 ?
        totalVotes / proposalsWithVotes.length : 0;

      return {
        timeframe,
        propertyId,
        statistics: {
          totalProposals,
          activeProposals,
          succeededProposals,
          executedProposals,
          totalVotes,
          uniqueVoters,
          avgParticipation: Math.round(avgParticipation * 100) / 100
        },
        proposalsByType: proposalsByType.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        participationRate: uniqueVoters > 0 ? 
          Math.round((totalVotes / uniqueVoters) * 100) / 100 : 0
      };
    } catch (error) {
      logger.error('Error in getGovernanceAnalytics:', error);
      throw error;
    }
  }

  /**
   * Delegate voting power
   */
  async delegateVotingPower({ delegatorId, delegateAddress, propertyId }) {
    try {
      // Find delegate user
      const delegate = await User.findOne({ walletAddress: delegateAddress });
      if (!delegate) {
        throw new Error('Invalid delegate address: User not found');
      }

      // Check if delegator has voting power for the property
      const votingPower = await this.getVotingPower(delegatorId, propertyId);
      if (votingPower.directVotingPower === 0) {
        throw new Error('No voting power to delegate for this property');
      }

      // In a full implementation, this would create a delegation record
      // For now, we'll just return the delegation info
      return {
        delegator: delegatorId,
        delegate: delegate._id,
        propertyId,
        votingPower: votingPower.directVotingPower,
        delegatedAt: new Date()
      };
    } catch (error) {
      logger.error('Error in delegateVotingPower:', error);
      throw error;
    }
  }

  /**
   * Get user's governance history
   */
  async getUserGovernanceHistory({ userId, page = 1, limit = 20, type, sortBy = 'createdAt', sortOrder = 'desc' }) {
    try {
      const skip = (page - 1) * limit;
      const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

      const history = [];

      // Get user's proposals
      if (!type || type === 'proposal') {
        const proposals = await Proposal.find({ proposedBy: userId })
          .populate('propertyId', 'title')
          .sort(sortOptions)
          .lean();
        
        proposals.forEach(proposal => {
          history.push({
            type: 'proposal',
            action: 'created',
            proposal,
            timestamp: proposal.createdAt
          });
        });
      }

      // Get user's votes
      if (!type || type === 'vote') {
        const votes = await Vote.find({ voter: userId })
          .populate('proposalId', 'title type')
          .sort(sortOptions)
          .lean();
        
        votes.forEach(vote => {
          history.push({
            type: 'vote',
            action: 'voted',
            vote,
            timestamp: vote.timestamp
          });
        });
      }

      // Sort all history items by timestamp
      history.sort((a, b) => {
        const aTime = new Date(a.timestamp);
        const bTime = new Date(b.timestamp);
        return sortOrder === 'desc' ? bTime - aTime : aTime - bTime;
      });

      // Apply pagination
      const paginatedHistory = history.slice(skip, skip + limit);

      return {
        history: paginatedHistory,
        pagination: {
          page,
          limit,
          total: history.length,
          pages: Math.ceil(history.length / limit)
        }
      };
    } catch (error) {
      logger.error('Error in getUserGovernanceHistory:', error);
      throw error;
    }
  }

  /**
   * Helper: Calculate voting statistics for a proposal
   */
  async calculateVotingStats(proposalId) {
    try {
      const votes = await Vote.find({ proposalId });
      
      const votesFor = votes.filter(vote => vote.support === 'for')
        .reduce((sum, vote) => sum + vote.votingPower, 0);
      
      const votesAgainst = votes.filter(vote => vote.support === 'against')
        .reduce((sum, vote) => sum + vote.votingPower, 0);
      
      const abstainVotes = votes.filter(vote => vote.support === 'abstain')
        .reduce((sum, vote) => sum + vote.votingPower, 0);

      const totalVotes = votesFor + votesAgainst + abstainVotes;
      const participationRate = totalVotes > 0 ? 
        Math.round((votes.length / totalVotes) * 100) / 100 : 0;

      return {
        votesFor,
        votesAgainst,
        abstainVotes,
        totalVotes,
        participationRate,
        voterCount: votes.length
      };
    } catch (error) {
      logger.error('Error calculating voting stats:', error);
      return {
        votesFor: 0,
        votesAgainst: 0,
        abstainVotes: 0,
        totalVotes: 0,
        participationRate: 0,
        voterCount: 0
      };
    }
  }

  /**
   * Helper: Update proposal vote counts
   */
  async updateProposalVoteCounts(proposalId) {
    try {
      const stats = await this.calculateVotingStats(proposalId);
      
      await Proposal.findByIdAndUpdate(proposalId, {
        votesFor: stats.votesFor,
        votesAgainst: stats.votesAgainst,
        abstainVotes: stats.abstainVotes,
        totalVotes: stats.totalVotes
      });
    } catch (error) {
      logger.error('Error updating proposal vote counts:', error);
    }
  }

  /**
   * Helper: Check if proposal should be executed
   */
  async checkProposalExecution(proposalId) {
    try {
      const proposal = await Proposal.findById(proposalId);
      if (!proposal || proposal.status !== 'active') {
        return;
      }

      const now = new Date();
      if (now <= proposal.endTime) {
        return; // Voting still active
      }

      const stats = await this.calculateVotingStats(proposalId);
      
      // Check quorum
      const quorumMet = stats.totalVotes >= (proposal.quorumThreshold * 100); // Simplified
      
      // Check approval
      const approvalRate = stats.totalVotes > 0 ? 
        stats.votesFor / (stats.votesFor + stats.votesAgainst) : 0;
      const approvalMet = approvalRate >= proposal.approvalThreshold;

      // Update proposal status
      let newStatus = 'defeated';
      if (quorumMet && approvalMet) {
        newStatus = 'succeeded';
      }

      await Proposal.findByIdAndUpdate(proposalId, {
        status: newStatus,
        endedAt: now
      });
    } catch (error) {
      logger.error('Error checking proposal execution:', error);
    }
  }

  /**
   * Helper: Execute a single action (simplified)
   */
  async executeAction(action, proposal) {
    try {
      // This would integrate with smart contracts in production
      // For now, just return a mock result
      return {
        target: action.target,
        signature: action.signature,
        value: action.value,
        executed: true,
        blockNumber: Math.floor(Math.random() * 1000000),
        transactionHash: `0x${Math.random().toString(16).substr(2, 8)}`
      };
    } catch (error) {
      logger.error('Error executing action:', error);
      throw error;
    }
  }
}

module.exports = new GovernanceService();