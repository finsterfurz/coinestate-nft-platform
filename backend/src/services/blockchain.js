/**
 * CoinEstate Backend - Blockchain Service
 * Ethereum/Web3 integration for NFT and governance operations
 */

import { ethers } from 'ethers';
import { config } from '../config/index.js';
import logger from '../utils/logger.js';
import { redis } from './redis.js';
import { BlockchainError } from '../middleware/errorHandler.js';

// Smart contract ABIs (simplified for this implementation)
const NFT_ABI = [
  'function mint(address to, uint256 tokenId, string memory tokenURI) external',
  'function transfer(address to, uint256 tokenId) external',
  'function ownerOf(uint256 tokenId) external view returns (address)',
  'function balanceOf(address owner) external view returns (uint256)',
  'function tokenURI(uint256 tokenId) external view returns (string)',
  'function approve(address to, uint256 tokenId) external',
  'function getApproved(uint256 tokenId) external view returns (address)',
  'function setApprovalForAll(address operator, bool approved) external',
  'function isApprovedForAll(address owner, address operator) external view returns (bool)',
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
  'event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)'
];

const GOVERNANCE_ABI = [
  'function propose(uint256 propertyId, string memory description, bytes memory data) external returns (uint256)',
  'function vote(uint256 proposalId, bool support, string memory reason) external',
  'function execute(uint256 proposalId) external',
  'function getProposal(uint256 proposalId) external view returns (tuple)',
  'function getVotes(address account) external view returns (uint256)',
  'function hasVoted(uint256 proposalId, address account) external view returns (bool)',
  'event ProposalCreated(uint256 indexed proposalId, address indexed proposer)',
  'event VoteCast(address indexed voter, uint256 indexed proposalId, bool support, uint256 weight)',
  'event ProposalExecuted(uint256 indexed proposalId)'
];

class BlockchainService {
  constructor() {
    this.provider = null;
    this.wallet = null;
    this.nftContract = null;
    this.governanceContract = null;
    this.isConnected = false;
    this.networkInfo = null;
  }

  /**
   * Initialize blockchain connection
   */
  async initialize() {
    try {
      // Setup provider
      await this.setupProvider();
      
      // Setup wallet
      await this.setupWallet();
      
      // Setup contracts
      await this.setupContracts();
      
      // Verify network
      await this.verifyNetwork();
      
      // Setup event listeners
      this.setupEventListeners();
      
      this.isConnected = true;
      
      logger.info('✅ Blockchain service initialized', {
        network: config.blockchain.network,
        nftContract: config.blockchain.contracts.nft,
        governanceContract: config.blockchain.contracts.governance
      });
      
    } catch (error) {
      logger.error('❌ Blockchain initialization failed:', error);
      throw new BlockchainError('Failed to initialize blockchain service');
    }
  }

  /**
   * Setup blockchain provider
   */
  async setupProvider() {
    const providerUrl = config.blockchain.network === 'mainnet' 
      ? `https://mainnet.infura.io/v3/${config.blockchain.infuraProjectId}`
      : `https://${config.blockchain.network}.infura.io/v3/${config.blockchain.infuraProjectId}`;
    
    this.provider = new ethers.JsonRpcProvider(providerUrl);
    
    // Test connection
    const blockNumber = await this.provider.getBlockNumber();
    logger.debug('Provider connected', { blockNumber, network: config.blockchain.network });
  }

  /**
   * Setup wallet for signing transactions
   */
  async setupWallet() {
    this.wallet = new ethers.Wallet(config.blockchain.operatorPrivateKey, this.provider);
    
    const address = await this.wallet.getAddress();
    const balance = await this.provider.getBalance(address);
    
    logger.debug('Wallet setup complete', {
      address,
      balance: ethers.formatEther(balance)
    });
  }

  /**
   * Setup smart contracts
   */
  async setupContracts() {
    this.nftContract = new ethers.Contract(
      config.blockchain.contracts.nft,
      NFT_ABI,
      this.wallet
    );
    
    this.governanceContract = new ethers.Contract(
      config.blockchain.contracts.governance,
      GOVERNANCE_ABI,
      this.wallet
    );
    
    logger.debug('Contracts setup complete');
  }

  /**
   * Verify network configuration
   */
  async verifyNetwork() {
    const network = await this.provider.getNetwork();
    this.networkInfo = {
      name: network.name,
      chainId: Number(network.chainId),
      ensAddress: network.ensAddress
    };
    
    logger.info('Network verified', this.networkInfo);
  }

  /**
   * Setup blockchain event listeners
   */
  setupEventListeners() {
    // NFT Transfer events
    this.nftContract.on('Transfer', (from, to, tokenId, event) => {
      logger.blockchain('NFT Transfer', event.transactionHash, {
        from,
        to,
        tokenId: tokenId.toString(),
        blockNumber: event.blockNumber
      });
      
      this.handleNFTTransfer(from, to, tokenId, event);
    });
    
    // Governance Proposal events
    this.governanceContract.on('ProposalCreated', (proposalId, proposer, event) => {
      logger.blockchain('Proposal Created', event.transactionHash, {
        proposalId: proposalId.toString(),
        proposer,
        blockNumber: event.blockNumber
      });
      
      this.handleProposalCreated(proposalId, proposer, event);
    });
    
    // Governance Vote events
    this.governanceContract.on('VoteCast', (voter, proposalId, support, weight, event) => {
      logger.blockchain('Vote Cast', event.transactionHash, {
        voter,
        proposalId: proposalId.toString(),
        support,
        weight: weight.toString(),
        blockNumber: event.blockNumber
      });
      
      this.handleVoteCast(voter, proposalId, support, weight, event);
    });
  }

  /**
   * Mint NFT
   */
  async mintNFT(to, tokenId, tokenURI) {
    try {
      logger.info('Minting NFT', { to, tokenId, tokenURI });
      
      const gasEstimate = await this.nftContract.mint.estimateGas(to, tokenId, tokenURI);
      const gasLimit = Math.floor(Number(gasEstimate) * config.blockchain.gasPriceMultiplier);
      
      const tx = await this.nftContract.mint(to, tokenId, tokenURI, {
        gasLimit
      });
      
      logger.info('NFT mint transaction sent', {
        txHash: tx.hash,
        to,
        tokenId,
        gasLimit
      });
      
      return {
        txHash: tx.hash,
        tokenId,
        to,
        status: 'pending'
      };
      
    } catch (error) {
      logger.error('NFT minting failed:', error);
      throw new BlockchainError(`NFT minting failed: ${error.message}`);
    }
  }

  /**
   * Transfer NFT
   */
  async transferNFT(from, to, tokenId) {
    try {
      logger.info('Transferring NFT', { from, to, tokenId });
      
      const gasEstimate = await this.nftContract['safeTransferFrom(address,address,uint256)'].estimateGas(from, to, tokenId);
      const gasLimit = Math.floor(Number(gasEstimate) * config.blockchain.gasPriceMultiplier);
      
      const tx = await this.nftContract['safeTransferFrom(address,address,uint256)'](from, to, tokenId, {
        gasLimit
      });
      
      logger.info('NFT transfer transaction sent', {
        txHash: tx.hash,
        from,
        to,
        tokenId
      });
      
      return {
        txHash: tx.hash,
        from,
        to,
        tokenId,
        status: 'pending'
      };
      
    } catch (error) {
      logger.error('NFT transfer failed:', error);
      throw new BlockchainError(`NFT transfer failed: ${error.message}`);
    }
  }

  /**
   * Get NFT owner
   */
  async getNFTOwner(tokenId) {
    try {
      const owner = await this.nftContract.ownerOf(tokenId);
      return owner;
    } catch (error) {
      logger.error('Failed to get NFT owner:', error);
      return null;
    }
  }

  /**
   * Get NFT balance for address
   */
  async getNFTBalance(address) {
    try {
      const balance = await this.nftContract.balanceOf(address);
      return Number(balance);
    } catch (error) {
      logger.error('Failed to get NFT balance:', error);
      return 0;
    }
  }

  /**
   * Create governance proposal
   */
  async createProposal(propertyId, description, callData = '0x') {
    try {
      logger.info('Creating governance proposal', { propertyId, description });
      
      const gasEstimate = await this.governanceContract.propose.estimateGas(propertyId, description, callData);
      const gasLimit = Math.floor(Number(gasEstimate) * config.blockchain.gasPriceMultiplier);
      
      const tx = await this.governanceContract.propose(propertyId, description, callData, {
        gasLimit
      });
      
      logger.info('Proposal creation transaction sent', {
        txHash: tx.hash,
        propertyId,
        description: description.substring(0, 100)
      });
      
      return {
        txHash: tx.hash,
        propertyId,
        status: 'pending'
      };
      
    } catch (error) {
      logger.error('Proposal creation failed:', error);
      throw new BlockchainError(`Proposal creation failed: ${error.message}`);
    }
  }

  /**
   * Cast vote on proposal
   */
  async castVote(proposalId, support, reason = '') {
    try {
      logger.info('Casting vote', { proposalId, support, reason });
      
      const gasEstimate = await this.governanceContract.vote.estimateGas(proposalId, support, reason);
      const gasLimit = Math.floor(Number(gasEstimate) * config.blockchain.gasPriceMultiplier);
      
      const tx = await this.governanceContract.vote(proposalId, support, reason, {
        gasLimit
      });
      
      logger.info('Vote transaction sent', {
        txHash: tx.hash,
        proposalId,
        support
      });
      
      return {
        txHash: tx.hash,
        proposalId,
        support,
        status: 'pending'
      };
      
    } catch (error) {
      logger.error('Vote casting failed:', error);
      throw new BlockchainError(`Vote casting failed: ${error.message}`);
    }
  }

  /**
   * Execute governance proposal
   */
  async executeProposal(proposalId) {
    try {
      logger.info('Executing proposal', { proposalId });
      
      const gasEstimate = await this.governanceContract.execute.estimateGas(proposalId);
      const gasLimit = Math.floor(Number(gasEstimate) * config.blockchain.gasPriceMultiplier);
      
      const tx = await this.governanceContract.execute(proposalId, {
        gasLimit
      });
      
      logger.info('Proposal execution transaction sent', {
        txHash: tx.hash,
        proposalId
      });
      
      return {
        txHash: tx.hash,
        proposalId,
        status: 'pending'
      };
      
    } catch (error) {
      logger.error('Proposal execution failed:', error);
      throw new BlockchainError(`Proposal execution failed: ${error.message}`);
    }
  }

  /**
   * Get voting power for address
   */
  async getVotingPower(address) {
    try {
      const votes = await this.governanceContract.getVotes(address);
      return Number(votes);
    } catch (error) {
      logger.error('Failed to get voting power:', error);
      return 0;
    }
  }

  /**
   * Check if address has voted on proposal
   */
  async hasVoted(proposalId, address) {
    try {
      return await this.governanceContract.hasVoted(proposalId, address);
    } catch (error) {
      logger.error('Failed to check vote status:', error);
      return false;
    }
  }

  /**
   * Get transaction receipt
   */
  async getTransactionReceipt(txHash) {
    try {
      const receipt = await this.provider.getTransactionReceipt(txHash);
      return receipt;
    } catch (error) {
      logger.error('Failed to get transaction receipt:', error);
      return null;
    }
  }

  /**
   * Wait for transaction confirmation
   */
  async waitForTransaction(txHash, confirmations = 1) {
    try {
      const receipt = await this.provider.waitForTransaction(txHash, confirmations);
      return receipt;
    } catch (error) {
      logger.error('Transaction wait failed:', error);
      throw new BlockchainError(`Transaction failed: ${error.message}`);
    }
  }

  /**
   * Event handlers
   */
  async handleNFTTransfer(from, to, tokenId, event) {
    // Update database and cache
    await redis.publish('nft:transfer', {
      from,
      to,
      tokenId: tokenId.toString(),
      txHash: event.transactionHash,
      blockNumber: event.blockNumber
    });
  }

  async handleProposalCreated(proposalId, proposer, event) {
    // Update database and cache
    await redis.publish('governance:proposal', {
      proposalId: proposalId.toString(),
      proposer,
      txHash: event.transactionHash,
      blockNumber: event.blockNumber
    });
  }

  async handleVoteCast(voter, proposalId, support, weight, event) {
    // Update database and cache
    await redis.publish('governance:vote', {
      voter,
      proposalId: proposalId.toString(),
      support,
      weight: weight.toString(),
      txHash: event.transactionHash,
      blockNumber: event.blockNumber
    });
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const blockNumber = await this.provider.getBlockNumber();
      const balance = await this.provider.getBalance(this.wallet.address);
      
      return {
        status: 'healthy',
        connected: this.isConnected,
        network: this.networkInfo,
        blockNumber,
        walletBalance: ethers.formatEther(balance),
        contracts: {
          nft: config.blockchain.contracts.nft,
          governance: config.blockchain.contracts.governance
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        connected: false,
        error: error.message
      };
    }
  }
}

// Create singleton instance
const blockchain = new BlockchainService();

/**
 * Initialize blockchain service
 */
export const initializeBlockchain = async () => {
  if (!config.development.mockBlockchain) {
    await blockchain.initialize();
  } else {
    logger.info('🧪 Using mock blockchain service');
  }
};

/**
 * Export blockchain instance
 */
export { blockchain };
export default blockchain;