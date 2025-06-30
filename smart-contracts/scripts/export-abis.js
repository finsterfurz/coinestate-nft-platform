const fs = require('fs');
const path = require('path');

/**
 * Export ABIs for Frontend Integration
 * This script copies contract ABIs to the frontend src directory
 */

async function exportABIs() {
  console.log("🔄 Exporting ABIs for frontend integration...\n");

  // Define paths
  const artifactsDir = path.join(__dirname, '../artifacts/contracts');
  const abisDir = path.join(__dirname, '../abis');
  const frontendAbisDir = path.join(__dirname, '../../src/contracts/abis');

  // Create directories if they don't exist
  [abisDir, frontendAbisDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  });

  // Contract configurations
  const contracts = [
    {
      name: 'CoinEstateNFT',
      artifactPath: path.join(artifactsDir, 'CoinEstateNFT.sol/CoinEstateNFT.json'),
      outputName: 'CoinEstateNFT'
    },
    {
      name: 'CoinEstateGovernance',
      artifactPath: path.join(artifactsDir, 'CoinEstateGovernance.sol/CoinEstateGovernance.json'),
      outputName: 'CoinEstateGovernance'
    }
  ];

  let exportCount = 0;

  for (const contract of contracts) {
    try {
      // Check if artifact exists
      if (!fs.existsSync(contract.artifactPath)) {
        console.log(`⚠️  Artifact not found: ${contract.artifactPath}`);
        console.log("   Run 'npm run compile' first to generate artifacts");
        continue;
      }

      // Read the artifact
      const artifact = JSON.parse(fs.readFileSync(contract.artifactPath, 'utf8'));
      
      // Extract ABI and contract info
      const contractData = {
        abi: artifact.abi,
        bytecode: artifact.bytecode,
        contractName: artifact.contractName,
        sourceName: artifact.sourceName,
        compiler: {
          version: artifact.metadata ? JSON.parse(artifact.metadata).compiler.version : 'unknown'
        },
        networks: {}, // Will be populated during deployment
        updatedAt: new Date().toISOString()
      };

      // Write to both directories
      const abiOutputPath = path.join(abisDir, `${contract.outputName}.json`);
      const frontendOutputPath = path.join(frontendAbisDir, `${contract.outputName}.json`);

      fs.writeFileSync(abiOutputPath, JSON.stringify(contractData, null, 2));
      fs.writeFileSync(frontendOutputPath, JSON.stringify(contractData, null, 2));

      console.log(`✅ Exported ${contract.name}:`);
      console.log(`   📄 ${abiOutputPath}`);
      console.log(`   📄 ${frontendOutputPath}`);
      console.log(`   📊 ABI entries: ${artifact.abi.length}`);
      
      exportCount++;
    } catch (error) {
      console.error(`❌ Error exporting ${contract.name}:`, error.message);
    }
  }

  // Create TypeScript type definitions
  await generateTypeDefinitions(contracts, frontendAbisDir);

  // Create index file for easy imports
  await createIndexFile(contracts, frontendAbisDir);

  // Create contract addresses file template
  await createAddressesTemplate(frontendAbisDir);

  console.log(`\n🎉 Export completed! ${exportCount} contracts exported.`);
  
  if (exportCount === 0) {
    console.log("\n⚠️  No contracts were exported. Make sure to:");
    console.log("   1. Run 'npm run compile' to generate artifacts");
    console.log("   2. Check that contract names match the configuration");
  } else {
    console.log("\n📝 Next steps:");
    console.log("   1. Deploy contracts to update network addresses");
    console.log("   2. Update src/contracts/addresses.js with deployed addresses");
    console.log("   3. Import ABIs in your React components");
    console.log("\n💡 Example usage in React:");
    console.log("   import { CoinEstateNFT_ABI } from '../contracts';");
  }
}

/**
 * Generate TypeScript type definitions
 */
async function generateTypeDefinitions(contracts, outputDir) {
  console.log("\n🔧 Generating TypeScript definitions...");

  const typesContent = `// Auto-generated TypeScript definitions for CoinEstate Smart Contracts
// Generated on ${new Date().toISOString()}

export interface ContractABI {
  abi: any[];
  bytecode: string;
  contractName: string;
  sourceName: string;
  compiler: {
    version: string;
  };
  networks: Record<string, {
    address: string;
    blockNumber: number;
    transactionHash: string;
  }>;
  updatedAt: string;
}

${contracts.map(contract => `
export interface ${contract.outputName}ABI extends ContractABI {
  contractName: '${contract.outputName}';
}
`).join('')}

// Contract names enum
export enum ContractNames {
${contracts.map(contract => `  ${contract.outputName} = '${contract.outputName}',`).join('\n')}
}
`;

  const typesPath = path.join(outputDir, 'types.ts');
  fs.writeFileSync(typesPath, typesContent);
  console.log(`📄 Generated types: ${typesPath}`);
}

/**
 * Create index file for easy imports
 */
async function createIndexFile(contracts, outputDir) {
  console.log("📄 Creating index file...");

  const indexContent = `// Auto-generated index file for CoinEstate Smart Contracts
// Generated on ${new Date().toISOString()}

${contracts.map(contract => `import ${contract.outputName}Data from './${contract.outputName}.json';`).join('\n')}

// Export ABIs
${contracts.map(contract => `export const ${contract.outputName}_ABI = ${contract.outputName}Data.abi;`).join('\n')}

// Export full contract data
${contracts.map(contract => `export const ${contract.outputName}_CONTRACT = ${contract.outputName}Data;`).join('\n')}

// Export all contracts
export const CONTRACTS = {
${contracts.map(contract => `  ${contract.outputName}: ${contract.outputName}Data,`).join('\n')}
};

// Export contract names
export const CONTRACT_NAMES = {
${contracts.map(contract => `  ${contract.outputName}: '${contract.outputName}',`).join('\n')}
};

// Export types
export * from './types';
export * from './addresses';
`;

  const indexPath = path.join(outputDir, 'index.js');
  fs.writeFileSync(indexPath, indexContent);
  console.log(`📄 Generated index: ${indexPath}`);
}

/**
 * Create contract addresses template
 */
async function createAddressesTemplate(outputDir) {
  console.log("🏠 Creating addresses template...");

  const addressesContent = `// Contract addresses for different networks
// Update these addresses after deployment

export const CONTRACT_ADDRESSES = {
  // Local development (Hardhat)
  localhost: {
    CoinEstateNFT: '',
    CoinEstateGovernance: '',
    chainId: 31337,
  },
  
  // Sepolia testnet
  sepolia: {
    CoinEstateNFT: '',
    CoinEstateGovernance: '',
    chainId: 11155111,
  },
  
  // Ethereum mainnet
  mainnet: {
    CoinEstateNFT: '',
    CoinEstateGovernance: '',
    chainId: 1,
  },
};

// Helper function to get addresses for current network
export function getContractAddresses(networkName) {
  const addresses = CONTRACT_ADDRESSES[networkName];
  if (!addresses) {
    throw new Error(\`Unsupported network: \${networkName}\`);
  }
  return addresses;
}

// Helper function to get contract address by name and network
export function getContractAddress(contractName, networkName) {
  const addresses = getContractAddresses(networkName);
  const address = addresses[contractName];
  if (!address) {
    throw new Error(\`Contract \${contractName} not found on network \${networkName}\`);
  }
  return address;
}

// Network information
export const SUPPORTED_NETWORKS = {
  localhost: {
    name: 'Localhost',
    chainId: 31337,
    rpcUrl: 'http://127.0.0.1:8545',
    blockExplorer: null,
  },
  sepolia: {
    name: 'Sepolia Testnet',
    chainId: 11155111,
    rpcUrl: 'https://sepolia.infura.io/v3/',
    blockExplorer: 'https://sepolia.etherscan.io',
  },
  mainnet: {
    name: 'Ethereum Mainnet',
    chainId: 1,
    rpcUrl: 'https://mainnet.infura.io/v3/',
    blockExplorer: 'https://etherscan.io',
  },
};
`;

  const addressesPath = path.join(outputDir, 'addresses.js');
  fs.writeFileSync(addressesPath, addressesContent);
  console.log(`🏠 Generated addresses template: ${addressesPath}`);
}

// Execute if called directly
if (require.main === module) {
  exportABIs()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ ABI export failed:", error);
      process.exit(1);
    });
}

module.exports = exportABIs;