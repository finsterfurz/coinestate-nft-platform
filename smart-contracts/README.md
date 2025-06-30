# 🏗️ CoinEstate Smart Contracts

[![Solidity](https://img.shields.io/badge/Solidity-^0.8.19-blue)](https://docs.soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-^2.17.2-yellow)](https://hardhat.org/)
[![OpenZeppelin](https://img.shields.io/badge/OpenZeppelin-^4.9.3-green)](https://openzeppelin.com/)
[![License](https://img.shields.io/badge/License-MIT-blue)](#license)

> **Ethereum smart contracts for the CoinEstate NFT governance platform**

This directory contains the complete smart contract implementation for CoinEstate's real estate governance platform, including NFT minting, property management, and DAO voting mechanisms.

## 📋 Table of Contents

- [📁 Contract Overview](#-contract-overview)
- [🚀 Quick Start](#-quick-start)
- [🔧 Development Setup](#-development-setup)
- [📊 Testing](#-testing)
- [🚀 Deployment](#-deployment)
- [🔍 Verification](#-verification)
- [🏗️ Architecture](#️-architecture)
- [⚡ Gas Optimization](#-gas-optimization)
- [🔒 Security](#-security)
- [📚 API Reference](#-api-reference)

## 📁 Contract Overview

### **CoinEstateNFT.sol**
- **Type**: ERC-721 with governance extensions
- **Purpose**: NFT minting with property-based voting rights
- **Features**:
  - Property creation and management
  - KYC verification system
  - 10% ownership limit per wallet per property
  - Vote calculation based on shares
  - Role-based access control

### **CoinEstateGovernance.sol**
- **Type**: DAO governance contract
- **Purpose**: Property management decision voting
- **Features**:
  - Proposal creation with automatic categorization
  - Time-locked voting periods
  - Quorum and approval thresholds
  - Multi-tier decision making (operational/strategic)

## 🚀 Quick Start

### **Prerequisites**
```bash
# Required tools
node --version  # >= 18.0.0
npm --version   # >= 8.0.0
```

### **Installation**
```bash
# Navigate to smart-contracts directory
cd smart-contracts

# Install dependencies
npm install

# Setup environment
cp ../.env.example .env
# Edit .env with your configuration
```

### **Basic Commands**
```bash
# Compile contracts
npm run compile

# Run tests
npm run test

# Deploy to localhost
npm run deploy:localhost

# Deploy to Sepolia testnet
npm run deploy:sepolia
```

## 🔧 Development Setup

### **Environment Variables**
Create `.env` file with required variables:

```bash
# Blockchain Configuration
PRIVATE_KEY=your_private_key_here_without_0x_prefix
INFURA_PROJECT_ID=your_infura_project_id
ETHERSCAN_API_KEY=your_etherscan_api_key

# Optional - Gas Configuration
DEFAULT_GAS_LIMIT=6000000
DEFAULT_GAS_PRICE=20000000000

# Optional - Deployment Settings
CONTRACT_DEPLOYMENT_CONFIRMATIONS=2
CONTRACT_DEPLOYMENT_TIMEOUT=300000
```

### **Local Development**
```bash
# Start local Hardhat node
npm run node

# In another terminal, deploy contracts
npm run deploy:localhost

# Run tests against local node
npm run test

# Check contract sizes
npm run size
```

## 📊 Testing

### **Test Suite Coverage**
- **Property Management**: Creation, validation, state management
- **NFT Minting**: KYC verification, ownership limits, share tracking
- **Governance**: Proposal creation, voting, execution
- **Access Control**: Role management, permissions
- **Edge Cases**: Boundary conditions, error handling

### **Running Tests**
```bash
# Run all tests
npm run test

# Run with gas reporting
npm run test:gas

# Run with coverage
npm run test:coverage

# Watch mode (during development)
npx hardhat test --watch
```

### **Test Coverage Targets**
- **Lines**: >90%
- **Functions**: >95%
- **Branches**: >85%
- **Statements**: >90%

## 🚀 Deployment

### **Network Configuration**
Supports deployment to multiple networks:
- **Localhost**: Local development (Chain ID: 31337)
- **Sepolia**: Ethereum testnet (Chain ID: 11155111)
- **Mainnet**: Ethereum mainnet (Chain ID: 1)
- **Polygon**: Layer 2 scaling (Chain ID: 137)

### **Deployment Commands**
```bash
# Deploy to Sepolia testnet
npm run deploy:sepolia

# Deploy to mainnet (requires mainnet private key)
npm run deploy:mainnet

# Deploy with custom gas settings
DEFAULT_GAS_PRICE=30000000000 npm run deploy:sepolia
```

### **Post-Deployment Steps**
1. **Verify contracts** on Etherscan
2. **Update frontend** environment variables
3. **Configure initial** property and KYC settings
4. **Test contract** interactions

## 🔍 Verification

### **Etherscan Verification**
```bash
# Verify on Sepolia
npm run verify:sepolia

# Verify on mainnet
npm run verify:mainnet

# Manual verification (get commands)
npx hardhat run scripts/verify.js --manual
```

### **Verification Requirements**
- ✅ ETHERSCAN_API_KEY configured
- ✅ Contracts successfully deployed
- ✅ Constructor arguments match deployment
- ✅ Source code matches deployed bytecode

## 🏗️ Architecture

### **Contract Inheritance**
```
CoinEstateNFT
├── ERC721 (OpenZeppelin)
├── ERC721URIStorage (OpenZeppelin)
├── AccessControl (OpenZeppelin)
└── Pausable (OpenZeppelin)

CoinEstateGovernance
├── AccessControl (OpenZeppelin)
└── Pausable (OpenZeppelin)
```

### **Key Design Patterns**
- **Role-Based Access Control**: Granular permissions
- **Circuit Breaker**: Emergency pause functionality
- **Factory Pattern**: Property creation and management
- **State Machine**: Proposal lifecycle management

### **Data Structures**
```solidity
struct Property {
    string name;
    string location;
    uint256 totalValue;
    uint256 totalShares;
    bool isActive;
    string documentHash; // IPFS
}

struct Proposal {
    uint256 id;
    uint256 propertyId;
    ProposalType proposalType;
    string title;
    string description;
    uint256 amount;
    address proposer;
    uint256 startTime;
    uint256 endTime;
    uint256 forVotes;
    uint256 againstVotes;
    uint256 quorumRequired;
    uint256 approvalThreshold;
    ProposalStatus status;
    bool executed;
    string documentsHash;
}
```

## ⚡ Gas Optimization

### **Optimization Strategies**
- **Packed Structs**: Minimize storage slots
- **Events Over Storage**: Use events for historical data
- **Batch Operations**: Reduce transaction costs
- **Efficient Mappings**: Optimize key-value storage

### **Gas Usage Estimates**
| Function | Gas Estimate | Description |
|----------|-------------|-------------|
| `createProperty` | ~150,000 | Create new property |
| `mintNFT` | ~180,000 | Mint NFT with shares |
| `createProposal` | ~120,000 | Create governance proposal |
| `vote` | ~80,000 | Cast vote on proposal |
| `executeProposal` | ~90,000 | Execute approved proposal |

### **Gas Reporting**
```bash
# Enable gas reporting
REPORT_GAS=true npm run test

# Generate gas report file
GAS_REPORT_FILE=gas-report.txt npm run test:gas
```

## 🔒 Security

### **Security Features**
- **KYC Requirements**: All transfers require verification
- **Ownership Limits**: Maximum 10% per wallet per property
- **Time Locks**: Voting delays and periods
- **Role Separation**: Admin vs operational roles
- **Reentrancy Protection**: OpenZeppelin's safeguards

### **Security Auditing**
```bash
# Run Solhint linting
npm run lint

# Check for security issues (requires Slither)
npm run security:slither

# Generate security report
npm run security:mythril
```

### **Access Control Matrix**
| Role | NFT Contract | Governance Contract |
|------|-------------|-------------------|
| **DEFAULT_ADMIN** | All functions | Emergency controls |
| **MINTER_ROLE** | Property creation, NFT minting | - |
| **KYC_ADMIN** | KYC verification | - |
| **GOVERNANCE_ROLE** | Governance calls | - |
| **PROPOSER_ROLE** | - | Proposal creation |

## 📚 API Reference

### **CoinEstateNFT Core Functions**

#### **Property Management**
```solidity
function createProperty(
    string memory name,
    string memory location,
    uint256 totalValue,
    uint256 totalShares,
    string memory documentHash
) public onlyRole(MINTER_ROLE) returns (uint256)
```

#### **NFT Operations**
```solidity
function mintNFT(
    address to,
    uint256 propertyId,
    uint256 shares,
    string memory tokenURI
) public onlyRole(MINTER_ROLE) returns (uint256)
```

#### **Voting Power**
```solidity
function getVotingPower(address owner) public view returns (uint256)
function getPropertyVotingPower(address owner, uint256 propertyId) public view returns (uint256)
```

### **CoinEstateGovernance Core Functions**

#### **Proposal Management**
```solidity
function createProposal(
    uint256 propertyId,
    string memory title,
    string memory description,
    uint256 amount,
    string memory documentsHash
) public returns (uint256)
```

#### **Voting Operations**
```solidity
function vote(uint256 proposalId, bool support) public
function executeProposal(uint256 proposalId) public
```

#### **Query Functions**
```solidity
function getProposal(uint256 proposalId) public view returns (Proposal memory)
function getVotingResults(uint256 proposalId) public view returns (...)
```

## 🛠️ Troubleshooting

### **Common Issues**

#### **Compilation Errors**
```bash
# Clear cache and recompile
npm run clean
npm run compile
```

#### **Test Failures**
```bash
# Run specific test file
npx hardhat test test/CoinEstateContracts.test.js

# Debug with console logs
npx hardhat test --logs
```

#### **Deployment Issues**
```bash
# Check account balance
npx hardhat run scripts/check-balance.js --network sepolia

# Verify environment variables
node -e "console.log(process.env.PRIVATE_KEY ? 'PRIVATE_KEY set' : 'PRIVATE_KEY missing')"
```

#### **Gas Issues**
```bash
# Increase gas limit
DEFAULT_GAS_LIMIT=8000000 npm run deploy:sepolia

# Check current gas prices
npx hardhat run scripts/gas-check.js --network sepolia
```

## 📈 Performance Metrics

### **Contract Sizes**
- **CoinEstateNFT**: ~24KB (max: 24KB)
- **CoinEstateGovernance**: ~18KB (max: 24KB)
- **Total Deployment Cost**: ~2.5M gas

### **Key Performance Indicators**
- **Test Coverage**: >85%
- **Gas Efficiency**: Optimized for minimal costs
- **Security Score**: All OpenZeppelin standards
- **Code Quality**: Solhint compliant

## 🔗 Integration

### **Frontend Integration**
After deployment, update frontend environment variables:

```bash
# In frontend .env file
REACT_APP_NFT_CONTRACT_ADDRESS=0x...
REACT_APP_GOVERNANCE_CONTRACT_ADDRESS=0x...
REACT_APP_BLOCKCHAIN_NETWORK=sepolia
```

### **ABI Export**
ABIs are automatically exported to `abis/` directory and frontend `src/contracts/abis/`:
```javascript
import { CoinEstateNFT_ABI } from '../contracts/abis';
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Run tests (`npm run test`)
4. Commit changes (`git commit -m 'Add amazing feature'`)
5. Push to branch (`git push origin feature/amazing-feature`)
6. Open Pull Request

---

**Built with ❤️ for the CoinEstate NFT Platform**