require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("hardhat-contract-sizer");
require("dotenv").config();

// Environment variables with fallbacks
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x" + "0".repeat(64);
const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID || "";
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY || "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "";

// Gas configuration
const DEFAULT_GAS_LIMIT = parseInt(process.env.DEFAULT_GAS_LIMIT || "6000000");
const DEFAULT_GAS_PRICE = parseInt(process.env.DEFAULT_GAS_PRICE || "20000000000");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true, // Enable IR optimization for better gas efficiency
    },
  },

  networks: {
    // Local development network
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
      gas: DEFAULT_GAS_LIMIT,
      gasPrice: DEFAULT_GAS_PRICE,
      allowUnlimitedContractSize: true,
    },

    // Hardhat network (for testing)
    hardhat: {
      chainId: 31337,
      gas: DEFAULT_GAS_LIMIT,
      gasPrice: DEFAULT_GAS_PRICE,
      allowUnlimitedContractSize: true,
      // Fork mainnet for testing
      forking: process.env.FORK_MAINNET === "true" ? {
        url: `https://mainnet.infura.io/v3/${INFURA_PROJECT_ID}`,
        blockNumber: parseInt(process.env.FORK_BLOCK_NUMBER || "0") || undefined,
      } : undefined,
    },

    // Sepolia testnet
    sepolia: {
      url: INFURA_PROJECT_ID 
        ? `https://sepolia.infura.io/v3/${INFURA_PROJECT_ID}`
        : `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: PRIVATE_KEY !== "0x" + "0".repeat(64) ? [PRIVATE_KEY] : [],
      chainId: 11155111,
      gas: DEFAULT_GAS_LIMIT,
      gasPrice: "auto",
      timeout: 300000, // 5 minutes
      confirmations: 2,
    },

    // Goerli testnet (backup)
    goerli: {
      url: INFURA_PROJECT_ID 
        ? `https://goerli.infura.io/v3/${INFURA_PROJECT_ID}`
        : `https://eth-goerli.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: PRIVATE_KEY !== "0x" + "0".repeat(64) ? [PRIVATE_KEY] : [],
      chainId: 5,
      gas: DEFAULT_GAS_LIMIT,
      gasPrice: "auto",
      timeout: 300000,
      confirmations: 2,
    },

    // Ethereum mainnet
    mainnet: {
      url: INFURA_PROJECT_ID 
        ? `https://mainnet.infura.io/v3/${INFURA_PROJECT_ID}`
        : `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: PRIVATE_KEY !== "0x" + "0".repeat(64) ? [PRIVATE_KEY] : [],
      chainId: 1,
      gas: DEFAULT_GAS_LIMIT,
      gasPrice: "auto",
      timeout: 600000, // 10 minutes for mainnet
      confirmations: 3, // More confirmations for mainnet
    },

    // Polygon Mumbai testnet
    mumbai: {
      url: "https://rpc-mumbai.maticvigil.com",
      accounts: PRIVATE_KEY !== "0x" + "0".repeat(64) ? [PRIVATE_KEY] : [],
      chainId: 80001,
      gas: DEFAULT_GAS_LIMIT,
      gasPrice: 20000000000, // 20 gwei
    },

    // Polygon mainnet
    polygon: {
      url: "https://polygon-rpc.com",
      accounts: PRIVATE_KEY !== "0x" + "0".repeat(64) ? [PRIVATE_KEY] : [],
      chainId: 137,
      gas: DEFAULT_GAS_LIMIT,
      gasPrice: 30000000000, // 30 gwei
    },
  },

  // Etherscan verification
  etherscan: {
    apiKey: {
      mainnet: ETHERSCAN_API_KEY,
      sepolia: ETHERSCAN_API_KEY,
      goerli: ETHERSCAN_API_KEY,
      polygon: process.env.POLYGONSCAN_API_KEY || "",
      polygonMumbai: process.env.POLYGONSCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "mumbai",
        chainId: 80001,
        urls: {
          apiURL: "https://api-testnet.polygonscan.com/api",
          browserURL: "https://mumbai.polygonscan.com/"
        }
      }
    ]
  },

  // Gas reporter configuration
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
    gasPrice: 20, // gwei
    coinmarketcap: COINMARKETCAP_API_KEY,
    token: "ETH",
    gasPriceApi: "https://api.etherscan.io/api?module=proxy&action=eth_gasPrice",
    showTimeSpent: true,
    showMethodSig: true,
    maxMethodDiff: 10,
    outputFile: process.env.GAS_REPORT_FILE || undefined,
    excludeContracts: ["Migrations", "Mock*", "Test*"],
  },

  // Contract size reporter
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: true,
    only: ["CoinEstate"],
  },

  // Coverage configuration  
  solcover: {
    mocha: {
      timeout: 100000
    },
    skipFiles: [
      "mocks/",
      "test/",
      "interfaces/",
    ]
  },

  // Test configuration
  mocha: {
    timeout: 100000, // 100 seconds
    bail: false,
    allowUncaught: false,
    reporter: process.env.MOCHA_REPORTER || "spec",
  },

  // Path configuration
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
    deploy: "./scripts",
  },

  // TypeChain configuration
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6",
    alwaysGenerateOverloads: false,
    externalArtifacts: ["externalArtifacts/*.json"],
    dontOverrideCompile: false,
  },

  // Warning configuration
  warnings: {
    "contracts/**/*": {
      "code-size": true,
      "unused-param": "off",
      "unused-return": "off",
    }
  },

  // Deployment configuration
  namedAccounts: {
    deployer: {
      default: 0, // First account by default
      1: 0, // Mainnet
      11155111: 0, // Sepolia
      5: 0, // Goerli
    },
    admin: {
      default: 1, // Second account by default
      1: "0x...", // Mainnet admin address
    },
  },
};

// Task definitions
const { task } = require("hardhat/config");

// Custom task to list accounts
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();
  
  console.log("Available accounts:");
  for (const account of accounts) {
    const balance = await hre.ethers.provider.getBalance(account.address);
    console.log(`${account.address}: ${hre.ethers.formatEther(balance)} ETH`);
  }
});

// Custom task to check contract sizes
task("size", "Check contract sizes", async (taskArgs, hre) => {
  await hre.run("compile");
  await hre.run("size-contracts");
});

// Custom task to verify deployment
task("verify-deployment", "Verify deployed contracts")
  .addParam("network", "Network name")
  .addParam("address", "Contract address")
  .setAction(async (taskArgs, hre) => {
    console.log(`Verifying contract on ${taskArgs.network}...`);
    await hre.run("verify:verify", {
      address: taskArgs.address,
      network: taskArgs.network,
    });
  });

// Custom task to export ABIs after compilation
task("compile", "Compiles contracts and exports ABIs", async (taskArgs, hre, runSuper) => {
  await runSuper(taskArgs);
  
  // Run ABI export after compilation
  try {
    const exportABIs = require("./scripts/export-abis.js");
    await exportABIs();
  } catch (error) {
    console.warn("⚠️  ABI export failed:", error.message);
    console.warn("   Run 'npm run abi:export' manually if needed");
  }
});

// Environment validation
if (process.env.NODE_ENV !== "test") {
  if (!PRIVATE_KEY || PRIVATE_KEY === "0x" + "0".repeat(64)) {
    console.warn("⚠️  PRIVATE_KEY not set. Deployment to networks will fail.");
  }
  
  if (!INFURA_PROJECT_ID && !ALCHEMY_API_KEY) {
    console.warn("⚠️  Neither INFURA_PROJECT_ID nor ALCHEMY_API_KEY set. Network connections may fail.");
  }
  
  if (!ETHERSCAN_API_KEY) {
    console.warn("⚠️  ETHERSCAN_API_KEY not set. Contract verification will fail.");
  }
}

console.log("🔧 Hardhat configuration loaded successfully");
console.log(`📊 Gas reporting: ${process.env.REPORT_GAS === "true" ? "enabled" : "disabled"}`);
console.log(`🔍 Contract size checking: enabled`);
console.log(`🧪 Test timeout: 100 seconds`);
console.log(`⚡ Compiler optimization: enabled (200 runs)`);
