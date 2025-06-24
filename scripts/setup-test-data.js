const { ethers } = require("hardhat");

async function main() {
    const [deployer, user1, user2] = await ethers.getSigners();
    const deploymentFile = `deployments/${network.name}-deployment.json`;
    const deployment = require(`../${deploymentFile}`);

    const nft = await ethers.getContractAt("CoinEstateNFT", deployment.contracts.CoinEstateNFT);
    const registry = await ethers.getContractAt("PropertyRegistry", deployment.contracts.PropertyRegistry);

    console.log("Setting up test data...");
    console.log("Creating test properties...");
    const tx1 = await nft.createProperty(
        "Manhattan Apartment Complex",
        "New York, NY",
        1000,
        deployer.address,
        "https://ipfs.io/ipfs/QmTest1"
    );
    await tx1.wait();

    const tx2 = await nft.createProperty(
        "Berlin Office Building",
        "Berlin, Germany",
        500,
        deployer.address,
        "https://ipfs.io/ipfs/QmTest2"
    );
    await tx2.wait();

    await registry.registerProperty(
        "Manhattan Apartment Complex",
        "New York, NY",
        "residential",
        500000000,
        520000000,
        2500000,
        "QmPropertyDocs1"
    );

    await registry.registerProperty(
        "Berlin Office Building",
        "Berlin, Germany",
        "commercial",
        300000000,
        310000000,
        1500000,
        "QmPropertyDocs2"
    );

    console.log("Setting up KYC for test users...");
    await nft.verifyKYC(user1.address);
    await nft.verifyKYC(user2.address);
    await nft.verifyPropertyKYC(user1.address, 1);
    await nft.verifyPropertyKYC(user1.address, 2);
    await nft.verifyPropertyKYC(user2.address, 1);
    await nft.verifyPropertyKYC(user2.address, 2);

    console.log("Minting test NFTs...");
    for (let i = 0; i < 10; i++) {
        await nft.mint(user1.address, 1, `https://metadata.uri/property1/${i}`);
    }
    for (let i = 0; i < 5; i++) {
        await nft.mint(user2.address, 1, `https://metadata.uri/property1/${i + 10}`);
    }
    for (let i = 0; i < 8; i++) {
        await nft.mint(user1.address, 2, `https://metadata.uri/property2/${i}`);
    }

    console.log("Test data setup complete!");
    console.log("\n" + "=".repeat(50));
    console.log("TEST DATA SUMMARY");
    console.log("=".repeat(50));
    console.log("Properties created: 2");
    console.log("User1 Property 1 NFTs:", await nft.propertyOwnership(1, user1.address));
    console.log("User2 Property 1 NFTs:", await nft.propertyOwnership(1, user2.address));
    console.log("User1 Property 2 NFTs:", await nft.propertyOwnership(2, user1.address));
    console.log("User1 total balance:", await nft.balanceOf(user1.address));
    console.log("User2 total balance:", await nft.balanceOf(user2.address));
    console.log("=".repeat(50));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
