const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CoinEstateGovernance", function () {
    let CoinEstateNFT;
    let CoinEstateGovernance;
    let nft;
    let governance;
    let owner;
    let addr1;
    let addr2;

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();

        CoinEstateNFT = await ethers.getContractFactory("CoinEstateNFT");
        nft = await CoinEstateNFT.deploy("CoinEstate NFT", "CNFT");
        await nft.deployed();

        CoinEstateGovernance = await ethers.getContractFactory("CoinEstateGovernance");
        governance = await CoinEstateGovernance.deploy(
            nft.address,
            "CoinEstate Governor",
            1,
            7200,
            1
        );
        await governance.deployed();

        await nft.createProperty("Test Property", "NY", 100, addr1.address, "uri");
        await nft.verifyKYC(addr1.address);
        await nft.verifyKYC(addr2.address);
        await nft.verifyPropertyKYC(addr1.address, 1);
        await nft.verifyPropertyKYC(addr2.address, 1);
        for (let i = 0; i < 5; i++) {
            await nft.mint(addr1.address, 1, `uri-${i}`);
        }
        for (let i = 0; i < 3; i++) {
            await nft.mint(addr2.address, 1, `uri-${i + 5}`);
        }
        await nft.connect(addr1).delegate(addr1.address);
        await nft.connect(addr2).delegate(addr2.address);
    });

    describe("Proposal Creation", function () {
        it("Should create operational proposal", async function () {
            const tx = await governance.connect(addr1).createPropertyProposal(
                1,
                "Repair roof - €3000",
                300000,
                "ipfs-hash",
                [ethers.constants.AddressZero],
                [0],
                ["0x"]
            );
            const receipt = await tx.wait();
            const event = receipt.events?.find(e => e.event === 'ProposalCreated');
            expect(event.args.propertyId).to.equal(1);
            expect(event.args.proposalType).to.equal(0);
        });

        it("Should create strategic proposal", async function () {
            const tx = await governance.connect(addr1).createPropertyProposal(
                1,
                "Major renovation - €25000",
                2500000,
                "ipfs-hash",
                [ethers.constants.AddressZero],
                [0],
                ["0x"]
            );
            const receipt = await tx.wait();
            const event = receipt.events?.find(e => e.event === 'ProposalCreated');
            expect(event.args.proposalType).to.equal(1);
        });

        it("Should not allow proposal without voting rights", async function () {
            await expect(
                governance.connect(owner).createPropertyProposal(
                    1, "Test", 100000, "hash",
                    [ethers.constants.AddressZero], [0], ["0x"]
                )
            ).to.be.revertedWith("No voting rights for this property");
        });
    });

    describe("Voting", function () {
        let proposalId;

        beforeEach(async function () {
            const tx = await governance.connect(addr1).createPropertyProposal(
                1, "Test Proposal", 100000, "hash",
                [ethers.constants.AddressZero], [0], ["0x"]
            );
            const receipt = await tx.wait();
            proposalId = receipt.events?.find(e => e.event === 'ProposalCreated')?.args?.proposalId;
            await ethers.provider.send("hardhat_mine", ["0x2"]);
        });

        it("Should allow voting with correct weight", async function () {
            await governance.connect(addr1).castVote(proposalId, 1);
            const results = await governance.getProposalResults(proposalId);
            expect(results.votesFor).to.equal(5);
        });

        it("Should prevent double voting", async function () {
            await governance.connect(addr1).castVote(proposalId, 1);
            await expect(
                governance.connect(addr1).castVote(proposalId, 1)
            ).to.be.revertedWith("Already voted");
        });

        it("Should calculate quorum correctly", async function () {
            const quorum = await governance.proposalQuorum(proposalId);
            expect(quorum).to.equal(25);
        });
    });
});
