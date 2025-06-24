const { ethers, upgrades } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());

    console.log("\nDeploying CoinEstateNFT...");
    const CoinEstateNFT = await ethers.getContractFactory("CoinEstateNFT");
    const nft = await CoinEstateNFT.deploy("CoinEstate NFT", "CNFT");
    await nft.deployed();
    console.log("CoinEstateNFT deployed to:", nft.address);

    console.log("\nDeploying PropertyRegistry...");
    const PropertyRegistry = await ethers.getContractFactory("PropertyRegistry");
    const registry = await PropertyRegistry.deploy();
    await registry.deployed();
    console.log("PropertyRegistry deployed to:", registry.address);

    console.log("\nDeploying CoinEstateGovernance...");
    const CoinEstateGovernance = await ethers.getContractFactory("CoinEstateGovernance");
    const governance = await CoinEstateGovernance.deploy(
        nft.address,
        "CoinEstate Governor",
        1,
        50400,
        1
    );
    await governance.deployed();
    console.log("CoinEstateGovernance deployed to:", governance.address);

    if (network.name !== "hardhat" && network.name !== "localhost") {
        console.log("\nWaiting for block confirmations...");
        await nft.deployTransaction.wait(5);
        await registry.deployTransaction.wait(5);
        await governance.deployTransaction.wait(5);

        console.log("\nVerifying contracts...");
        try {
            await hre.run("verify:verify", {
                address: nft.address,
                constructorArguments: ["CoinEstate NFT", "CNFT"],
            });
        } catch (e) {
            console.log("NFT verification failed:", e.message);
        }
        try {
            await hre.run("verify:verify", {
                address: registry.address,
                constructorArguments: [],
            });
        } catch (e) {
            console.log("Registry verification failed:", e.message);
        }
        try {
            await hre.run("verify:verify", {
                address: governance.address,
                constructorArguments: [
                    nft.address,
                    "CoinEstate Governor",
                    1,
                    50400,
                    1
                ],
            });
        } catch (e) {
            console.log("Governance verification failed:", e.message);
        }
    }

    console.log("\n" + "=".repeat(50));
    console.log("DEPLOYMENT SUMMARY");
    console.log("=".repeat(50));
    console.log("Network:", network.name);
    console.log("Deployer:", deployer.address);
    console.log("NFT Contract:", nft.address);
    console.log("Property Registry:", registry.address);
    console.log("Governance Contract:", governance.address);
    console.log("=".repeat(50));

    const fs = require("fs");
    const deploymentInfo = {
        network: network.name,
        deployer: deployer.address,
        contracts: {
            CoinEstateNFT: nft.address,
            PropertyRegistry: registry.address,
            CoinEstateGovernance: governance.address
        },
        deployedAt: new Date().toISOString()
    };
    fs.mkdirSync('deployments', { recursive: true });
    fs.writeFileSync(
        `deployments/${network.name}-deployment.json`,
        JSON.stringify(deploymentInfo, null, 2)
    );
    console.log(`\nDeployment info saved to deployments/${network.name}-deployment.json`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
