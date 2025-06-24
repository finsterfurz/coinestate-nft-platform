const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CoinEstateNFT", function () {
    let CoinEstateNFT;
    let nft;
    let owner;
    let addr1;
    let addr2;
    let addrs;

    beforeEach(async function () {
        CoinEstateNFT = await ethers.getContractFactory("CoinEstateNFT");
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

        nft = await CoinEstateNFT.deploy("CoinEstate NFT", "CNFT");
        await nft.deployed();
    });

    describe("Property Management", function () {
        it("Should create a new property", async function () {
            const tx = await nft.createProperty(
                "Test Property",
                "New York",
                1000,
                addr1.address,
                "https://metadata.uri"
            );
            
            const receipt = await tx.wait();
            const event = receipt.events?.find(e => e.event === 'PropertyCreated');
            
            expect(event.args.propertyId).to.equal(1);
            expect(event.args.name).to.equal("Test Property");
            expect(event.args.totalNFTs).to.equal(1000);
        });

        it("Should not allow creating property with 0 NFTs", async function () {
            await expect(
                nft.createProperty("Test", "Location", 0, addr1.address, "uri")
            ).to.be.revertedWith("Total NFTs must be greater than 0");
        });
    });

    describe("KYC and Minting", function () {
        beforeEach(async function () {
            await nft.createProperty("Test Property", "NY", 100, addr1.address, "uri");
        });

        it("Should verify KYC and mint NFT", async function () {
            await nft.verifyKYC(addr1.address);
            await nft.verifyPropertyKYC(addr1.address, 1);
            
            await nft.mint(addr1.address, 1, "token-uri");
            
            expect(await nft.balanceOf(addr1.address)).to.equal(1);
            expect(await nft.propertyOwnership(1, addr1.address)).to.equal(1);
        });

        it("Should not mint without KYC", async function () {
            await expect(
                nft.mint(addr1.address, 1, "token-uri")
            ).to.be.revertedWith("Recipient must be KYC verified");
        });

        it("Should calculate voting weight correctly", async function () {
            await nft.verifyKYC(addr1.address);
            await nft.verifyPropertyKYC(addr1.address, 1);
            
            for (let i = 0; i < 5; i++) {
                await nft.mint(addr1.address, 1, `token-uri-${i}`);
            }
            
            expect(await nft.getVotingWeight(addr1.address, 1)).to.equal(5);
        });

        it("Should apply 10% voting power cap", async function () {
            await nft.verifyKYC(addr1.address);
            await nft.verifyPropertyKYC(addr1.address, 1);
            
            for (let i = 0; i < 15; i++) {
                await nft.mint(addr1.address, 1, `token-uri-${i}`);
            }
            
            expect(await nft.getVotingWeight(addr1.address, 1)).to.equal(10);
        });
    });

    describe("Transfer Tracking", function () {
        beforeEach(async function () {
            await nft.createProperty("Test Property", "NY", 100, addr1.address, "uri");
            await nft.verifyKYC(addr1.address);
            await nft.verifyKYC(addr2.address);
            await nft.verifyPropertyKYC(addr1.address, 1);
            await nft.verifyPropertyKYC(addr2.address, 1);
            await nft.mint(addr1.address, 1, "token-uri");
        });

        it("Should update ownership tracking on transfer", async function () {
            expect(await nft.propertyOwnership(1, addr1.address)).to.equal(1);
            expect(await nft.propertyOwnership(1, addr2.address)).to.equal(0);
            
            await nft.connect(addr1).transferFrom(addr1.address, addr2.address, 1);
            
            expect(await nft.propertyOwnership(1, addr1.address)).to.equal(0);
            expect(await nft.propertyOwnership(1, addr2.address)).to.equal(1);
        });
    });
});
