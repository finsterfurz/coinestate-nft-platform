const { ethers, run } = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Verify deployed contracts on Etherscan
 */
async function verifyContracts() {
  console.log("🔍 Starting contract verification on Etherscan...\n");

  const network = await ethers.provider.getNetwork();
  console.log(`🌐 Network: ${network.name} (Chain ID: ${network.chainId})`);

  // Load deployment information
  const deploymentFile = path.join(__dirname, `../deployments/${network.name}/deployment.json`);
  
  if (!fs.existsSync(deploymentFile)) {
    console.error("❌ Deployment file not found:", deploymentFile);
    console.error("   Run deployment script first!");
    process.exit(1);
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
  console.log("📄 Loaded deployment info from:", deploymentFile);

  const contracts = [
    {
      name: "CoinEstateNFT",
      address: deploymentInfo.contracts.CoinEstateNFT.address,
      constructorArguments: [], // No constructor arguments for NFT contract
    },
    {
      name: "CoinEstateGovernance",
      address: deploymentInfo.contracts.CoinEstateGovernance.address,
      constructorArguments: [deploymentInfo.contracts.CoinEstateNFT.address], // NFT contract address
    },
  ];

  let verifiedCount = 0;
  let failedCount = 0;

  for (const contract of contracts) {
    try {
      console.log(`\n🔍 Verifying ${contract.name} at ${contract.address}...`);

      await run("verify:verify", {
        address: contract.address,
        constructorArguments: contract.constructorArguments,
      });

      console.log(`✅ ${contract.name} verified successfully!`);
      verifiedCount++;

    } catch (error) {
      console.error(`❌ Failed to verify ${contract.name}:`);
      
      if (error.message.includes("Already Verified")) {
        console.log(`ℹ️  ${contract.name} is already verified`);
        verifiedCount++;
      } else if (error.message.includes("does not have bytecode")) {
        console.error(`   Contract not deployed at ${contract.address}`);
        failedCount++;
      } else {
        console.error(`   ${error.message}`);
        failedCount++;
      }
    }

    // Add delay between verifications to avoid rate limiting
    if (contracts.indexOf(contract) < contracts.length - 1) {
      console.log("⏳ Waiting 5 seconds to avoid rate limiting...");
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  // Summary
  console.log("\n📊 Verification Summary:");
  console.log("┌─────────────────────────────────────────────────────────────┐");
  console.log("│                    Verification Results                    │");
  console.log("├─────────────────────────────────────────────────────────────┤");
  console.log(`│ ✅ Verified:     ${verifiedCount}/${contracts.length}                                     │`);
  console.log(`│ ❌ Failed:       ${failedCount}/${contracts.length}                                     │`);
  console.log("└─────────────────────────────────────────────────────────────┘");

  if (verifiedCount === contracts.length) {
    console.log("\n🎉 All contracts verified successfully!");
    
    console.log("\n🔗 View on Etherscan:");
    contracts.forEach(contract => {
      const explorerUrl = getExplorerUrl(network.name, contract.address);
      console.log(`   ${contract.name}: ${explorerUrl}`);
    });
    
  } else {
    console.log("\n⚠️  Some contracts failed verification. Check the errors above.");
    console.log("   You can retry verification later or verify manually on Etherscan.");
  }

  // Update deployment file with verification status
  try {
    const updatedDeploymentInfo = {
      ...deploymentInfo,
      verification: {
        timestamp: new Date().toISOString(),
        network: network.name,
        verified: verifiedCount === contracts.length,
        contracts: contracts.reduce((acc, contract) => {
          acc[contract.name] = {
            address: contract.address,
            verified: true, // Assume true if we got here without errors
            explorerUrl: getExplorerUrl(network.name, contract.address),
          };
          return acc;
        }, {}),
      },
    };

    fs.writeFileSync(deploymentFile, JSON.stringify(updatedDeploymentInfo, null, 2));
    console.log("💾 Updated deployment file with verification status");
  } catch (error) {
    console.warn("⚠️  Failed to update deployment file:", error.message);
  }

  return {
    verified: verifiedCount,
    failed: failedCount,
    total: contracts.length,
    success: verifiedCount === contracts.length,
  };
}

/**
 * Get blockchain explorer URL for a given network and address
 */
function getExplorerUrl(networkName, address) {
  const explorers = {
    mainnet: `https://etherscan.io/address/${address}`,
    sepolia: `https://sepolia.etherscan.io/address/${address}`,
    goerli: `https://goerli.etherscan.io/address/${address}`,
    polygon: `https://polygonscan.com/address/${address}`,
    mumbai: `https://mumbai.polygonscan.com/address/${address}`,
    localhost: `http://localhost:8545 (local)`,
  };

  return explorers[networkName] || `Unknown network: ${networkName}`;
}

/**
 * Manual verification helper
 */
async function manualVerification() {
  const network = await ethers.provider.getNetwork();
  const deploymentFile = path.join(__dirname, `../deployments/${network.name}/deployment.json`);
  
  if (!fs.existsSync(deploymentFile)) {
    console.error("❌ Deployment file not found. Deploy contracts first.");
    return;
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
  
  console.log("\n📋 Manual Verification Commands:");
  console.log("Copy and paste these commands to verify manually:\n");

  console.log("# CoinEstateNFT");
  console.log(`npx hardhat verify ${deploymentInfo.contracts.CoinEstateNFT.address} --network ${network.name}`);
  
  console.log("\n# CoinEstateGovernance");
  console.log(`npx hardhat verify ${deploymentInfo.contracts.CoinEstateGovernance.address} ${deploymentInfo.contracts.CoinEstateNFT.address} --network ${network.name}`);
  
  console.log("\n📝 Constructor Arguments:");
  console.log("CoinEstateNFT: (no arguments)");
  console.log(`CoinEstateGovernance: ${deploymentInfo.contracts.CoinEstateNFT.address}`);
}

// Check command line arguments
const args = process.argv.slice(2);
const isManual = args.includes("--manual") || args.includes("-m");

// Execute verification
if (require.main === module) {
  if (isManual) {
    manualVerification()
      .then(() => process.exit(0))
      .catch((error) => {
        console.error("❌ Manual verification helper failed:", error);
        process.exit(1);
      });
  } else {
    verifyContracts()
      .then((result) => {
        process.exit(result.success ? 0 : 1);
      })
      .catch((error) => {
        console.error("❌ Verification failed:", error);
        process.exit(1);
      });
  }
}

module.exports = { verifyContracts, manualVerification };