const { ethers } = require("hardhat");
const { writeFileSync, mkdirSync, existsSync } = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting CoinEstate Smart Contract Deployment...\n");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  
  console.log("📋 Deployment Details:");
  console.log("🔑 Deployer:", deployer.address);
  console.log("💰 Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");
  console.log("🌐 Network:", network.name, `(Chain ID: ${network.chainId})`);
  console.log("⛽ Gas Price:", ethers.formatUnits(await ethers.provider.getFeeData().gasPrice || 0, "gwei"), "gwei\n");

  // Deploy CoinEstateNFT
  console.log("🏗️  Deploying CoinEstateNFT...");
  const CoinEstateNFT = await ethers.getContractFactory("CoinEstateNFT");
  const nftContract = await CoinEstateNFT.deploy();
  await nftContract.waitForDeployment();
  
  const nftAddress = await nftContract.getAddress();
  console.log("✅ CoinEstateNFT deployed to:", nftAddress);

  // Deploy CoinEstateGovernance
  console.log("\n🏗️  Deploying CoinEstateGovernance...");
  const CoinEstateGovernance = await ethers.getContractFactory("CoinEstateGovernance");
  const governanceContract = await CoinEstateGovernance.deploy(nftAddress);
  await governanceContract.waitForDeployment();
  
  const governanceAddress = await governanceContract.getAddress();
  console.log("✅ CoinEstateGovernance deployed to:", governanceAddress);

  // Grant roles
  console.log("\n🔐 Setting up contract permissions...");
  const GOVERNANCE_ROLE = await nftContract.GOVERNANCE_ROLE();
  await nftContract.grantRole(GOVERNANCE_ROLE, governanceAddress);
  console.log("✅ Granted GOVERNANCE_ROLE to governance contract");

  // Create deployment info object
  const deploymentInfo = {
    network: {
      name: network.name,
      chainId: network.chainId.toString(),
    },
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      CoinEstateNFT: {
        address: nftAddress,
        transactionHash: nftContract.deploymentTransaction()?.hash,
        blockNumber: (await nftContract.deploymentTransaction()?.wait())?.blockNumber,
      },
      CoinEstateGovernance: {
        address: governanceAddress,
        transactionHash: governanceContract.deploymentTransaction()?.hash,
        blockNumber: (await governanceContract.deploymentTransaction()?.wait())?.blockNumber,
      },
    },
    gasUsed: {
      nft: (await nftContract.deploymentTransaction()?.wait())?.gasUsed?.toString(),
      governance: (await governanceContract.deploymentTransaction()?.wait())?.gasUsed?.toString(),
    }
  };

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, '../deployments');
  const networkDir = path.join(deploymentsDir, network.name);
  
  if (!existsSync(deploymentsDir)) {
    mkdirSync(deploymentsDir, { recursive: true });
  }
  if (!existsSync(networkDir)) {
    mkdirSync(networkDir, { recursive: true });
  }

  // Save deployment info
  const deploymentFile = path.join(networkDir, 'deployment.json');
  writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log("💾 Deployment info saved to:", deploymentFile);

  // Save individual contract files
  const nftFile = path.join(networkDir, 'CoinEstateNFT.json');
  const governanceFile = path.join(networkDir, 'CoinEstateGovernance.json');
  
  writeFileSync(nftFile, JSON.stringify({
    address: nftAddress,
    abi: CoinEstateNFT.interface.format('json'),
    bytecode: CoinEstateNFT.bytecode,
    ...deploymentInfo.contracts.CoinEstateNFT
  }, null, 2));
  
  writeFileSync(governanceFile, JSON.stringify({
    address: governanceAddress,
    abi: CoinEstateGovernance.interface.format('json'),
    bytecode: CoinEstateGovernance.bytecode,
    ...deploymentInfo.contracts.CoinEstateGovernance
  }, null, 2));

  console.log("💾 Contract ABIs saved to deployment files");

  // Update addresses.js for frontend
  const addressesFile = path.join(__dirname, '../abis/addresses.js');
  const addressesContent = `// Contract addresses for different networks
// Auto-generated on deployment: ${new Date().toISOString()}

export const CONTRACT_ADDRESSES = {
  // Local development (Hardhat)
  localhost: {
    CoinEstateNFT: '${network.name === 'localhost' ? nftAddress : ''}',
    CoinEstateGovernance: '${network.name === 'localhost' ? governanceAddress : ''}',
    chainId: 31337,
  },
  
  // Sepolia testnet
  sepolia: {
    CoinEstateNFT: '${network.name === 'sepolia' ? nftAddress : ''}',
    CoinEstateGovernance: '${network.name === 'sepolia' ? governanceAddress : ''}',
    chainId: 11155111,
  },
  
  // Ethereum mainnet
  mainnet: {
    CoinEstateNFT: '${network.name === 'mainnet' ? nftAddress : ''}',
    CoinEstateGovernance: '${network.name === 'mainnet' ? governanceAddress : ''}',
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

  // Create abis directory if it doesn't exist
  const abisDir = path.join(__dirname, '../abis');
  if (!existsSync(abisDir)) {
    mkdirSync(abisDir, { recursive: true });
  }
  
  writeFileSync(addressesFile, addressesContent);
  console.log("💾 Frontend addresses updated");

  // Print summary
  console.log("\n🎉 Deployment completed successfully!");
  console.log("\n📊 Summary:");
  console.log("┌─────────────────────────────────────────────────────────────┐");
  console.log("│                    Contract Addresses                      │");
  console.log("├─────────────────────────────────────────────────────────────┤");
  console.log(`│ CoinEstateNFT:        ${nftAddress}         │`);
  console.log(`│ CoinEstateGovernance: ${governanceAddress}         │`);
  console.log("└─────────────────────────────────────────────────────────────┘");

  console.log("\n📝 Next Steps:");
  console.log("1. Verify contracts on Etherscan (run verify script)");
  console.log("2. Update frontend environment variables");
  console.log("3. Run tests to ensure everything works");
  console.log("4. Configure initial property and KYC settings");

  console.log("\n🔗 Useful Commands:");
  console.log(`npx hardhat verify ${nftAddress} --network ${network.name}`);
  console.log(`npx hardhat verify ${governanceAddress} ${nftAddress} --network ${network.name}`);

  return {
    nftContract,
    governanceContract,
    addresses: {
      nft: nftAddress,
      governance: governanceAddress
    }
  };
}

// Execute deployment
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Deployment failed:");
      console.error(error);
      process.exit(1);
    });
}

module.exports = main;