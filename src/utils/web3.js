import { ethers } from 'ethers';

/**
 * Enhanced Web3 Integration for CoinEstate NFT Platform
 * Replaces mock implementations with real Web3 functionality
 */

// Network configurations
export const NETWORKS = {
  mainnet: {
    chainId: '0x1',
    chainName: 'Ethereum Mainnet',
    rpcUrls: ['https://mainnet.infura.io/v3/'],
    blockExplorerUrls: ['https://etherscan.io']
  },
  sepolia: {
    chainId: '0xaa36a7',
    chainName: 'Sepolia Test Network',
    rpcUrls: ['https://sepolia.infura.io/v3/'],
    blockExplorerUrls: ['https://sepolia.etherscan.io']
  }
};

// Contract addresses (from environment)
export const CONTRACT_ADDRESSES = {
  NFT_CONTRACT: import.meta.env.VITE_NFT_CONTRACT_ADDRESS,
  GOVERNANCE_CONTRACT: import.meta.env.VITE_GOVERNANCE_CONTRACT_ADDRESS,
};

/**
 * Web3 Provider Management
 */
class Web3Provider {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.account = null;
    this.chainId = null;
  }

  /**
   * Connect to MetaMask wallet
   * @returns {Promise<string>} Connected wallet address
   */
  async connectWallet() {
    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found. Please unlock MetaMask.');
      }

      // Initialize provider and signer
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      this.account = accounts[0];
      
      // Get network info
      const network = await this.provider.getNetwork();
      this.chainId = network.chainId.toString();

      // Set up event listeners
      this.setupEventListeners();

      console.log('Wallet connected:', this.account);
      return this.account;
    } catch (error) {
      console.error('Wallet connection failed:', error);
      throw error;
    }
  }

  /**
   * Disconnect wallet
   */
  async disconnectWallet() {
    this.provider = null;
    this.signer = null;
    this.account = null;
    this.chainId = null;
    
    // Remove event listeners
    if (window.ethereum) {
      window.ethereum.removeAllListeners();
    }
    
    console.log('Wallet disconnected');
  }

  /**
   * Switch to specific network
   * @param {string} networkName - Network to switch to
   */
  async switchNetwork(networkName) {
    if (!window.ethereum) {
      throw new Error('MetaMask not available');
    }

    const network = NETWORKS[networkName];
    if (!network) {
      throw new Error(`Unsupported network: ${networkName}`);
    }

    try {
      // Try to switch to the network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: network.chainId }],
      });
    } catch (switchError) {
      // If network doesn't exist, add it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [network],
        });
      } else {
        throw switchError;
      }
    }
  }

  /**
   * Get wallet balance
   * @returns {Promise<string>} Balance in ETH
   */
  async getBalance() {
    if (!this.provider || !this.account) {
      throw new Error('Wallet not connected');
    }

    const balance = await this.provider.getBalance(this.account);
    return ethers.formatEther(balance);
  }

  /**
   * Setup event listeners for wallet changes
   */
  setupEventListeners() {
    if (!window.ethereum) return;

    // Account change
    window.ethereum.on('accountsChanged', (accounts) => {
      if (accounts.length === 0) {
        this.disconnectWallet();
      } else {
        this.account = accounts[0];
        console.log('Account changed:', this.account);
      }
    });

    // Chain change
    window.ethereum.on('chainChanged', (chainId) => {
      this.chainId = chainId;
      console.log('Chain changed:', chainId);
      // Reload to avoid any issues
      window.location.reload();
    });

    // Disconnect
    window.ethereum.on('disconnect', () => {
      this.disconnectWallet();
    });
  }

  /**
   * Validate wallet address
   * @param {string} address - Address to validate
   * @returns {boolean} Is valid address
   */
  isValidAddress(address) {
    return ethers.isAddress(address);
  }

  /**
   * Get contract instance
   * @param {string} contractAddress - Contract address
   * @param {Array} abi - Contract ABI
   * @returns {ethers.Contract} Contract instance
   */
  getContract(contractAddress, abi) {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }

    if (!this.isValidAddress(contractAddress)) {
      throw new Error('Invalid contract address');
    }

    return new ethers.Contract(contractAddress, abi, this.signer);
  }
}

// Create singleton instance
export const web3Provider = new Web3Provider();

/**
 * NFT Contract interactions
 */
export class NFTContract {
  constructor() {
    this.contract = null;
  }

  /**
   * Initialize NFT contract
   * @param {Array} abi - Contract ABI
   */
  async initialize(abi) {
    if (!CONTRACT_ADDRESSES.NFT_CONTRACT) {
      throw new Error('NFT contract address not configured');
    }

    this.contract = web3Provider.getContract(
      CONTRACT_ADDRESSES.NFT_CONTRACT,
      abi
    );
  }

  /**
   * Get NFT balance for address
   * @param {string} address - Wallet address
   * @returns {Promise<number>} NFT balance
   */
  async getBalance(address) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    const balance = await this.contract.balanceOf(address);
    return parseInt(balance.toString());
  }

  /**
   * Get NFT metadata
   * @param {number} tokenId - Token ID
   * @returns {Promise<Object>} Token metadata
   */
  async getTokenMetadata(tokenId) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    const tokenURI = await this.contract.tokenURI(tokenId);
    
    // Fetch metadata from IPFS or HTTP
    const response = await fetch(tokenURI);
    if (!response.ok) {
      throw new Error('Failed to fetch token metadata');
    }
    
    return await response.json();
  }

  /**
   * Check if address owns specific NFT
   * @param {string} address - Wallet address
   * @param {number} tokenId - Token ID
   * @returns {Promise<boolean>} Owns NFT
   */
  async ownsToken(address, tokenId) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const owner = await this.contract.ownerOf(tokenId);
      return owner.toLowerCase() === address.toLowerCase();
    } catch (error) {
      // Token doesn't exist or other error
      return false;
    }
  }
}

/**
 * Governance Contract interactions
 */
export class GovernanceContract {
  constructor() {
    this.contract = null;
  }

  /**
   * Initialize governance contract
   * @param {Array} abi - Contract ABI
   */
  async initialize(abi) {
    if (!CONTRACT_ADDRESSES.GOVERNANCE_CONTRACT) {
      throw new Error('Governance contract address not configured');
    }

    this.contract = web3Provider.getContract(
      CONTRACT_ADDRESSES.GOVERNANCE_CONTRACT,
      abi
    );
  }

  /**
   * Get voting power for address
   * @param {string} address - Wallet address
   * @returns {Promise<number>} Voting power
   */
  async getVotingPower(address) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    const power = await this.contract.getVotingPower(address);
    return parseInt(power.toString());
  }

  /**
   * Submit vote on proposal
   * @param {number} proposalId - Proposal ID
   * @param {boolean} support - Vote support (true/false)
   * @returns {Promise<Object>} Transaction receipt
   */
  async vote(proposalId, support) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    const tx = await this.contract.vote(proposalId, support);
    return await tx.wait();
  }

  /**
   * Get proposal details
   * @param {number} proposalId - Proposal ID
   * @returns {Promise<Object>} Proposal details
   */
  async getProposal(proposalId) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    return await this.contract.getProposal(proposalId);
  }
}

// Create contract instances
export const nftContract = new NFTContract();
export const governanceContract = new GovernanceContract();

/**
 * Utility functions
 */
export const formatAddress = (address, chars = 4) => {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
};

export const formatETH = (value, decimals = 4) => {
  return parseFloat(value).toFixed(decimals);
};

export const isMetaMaskAvailable = () => {
  return typeof window.ethereum !== 'undefined';
};

// Error types for better error handling
export const WEB3_ERRORS = {
  METAMASK_NOT_INSTALLED: 'METAMASK_NOT_INSTALLED',
  USER_REJECTED: 'USER_REJECTED',
  CHAIN_NOT_SUPPORTED: 'CHAIN_NOT_SUPPORTED',
  CONTRACT_ERROR: 'CONTRACT_ERROR',
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS'
};

export default web3Provider;
