const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CoinEstate Smart Contracts", function () {
  let nftContract;
  let governanceContract;
  let owner;
  let addr1;
  let addr2;
  let addr3;

  beforeEach(async function () {
    // Get signers
    [owner, addr1, addr2, addr3] = await ethers.getSigners();

    // Deploy NFT contract
    const CoinEstateNFT = await ethers.getContractFactory("CoinEstateNFT");
    nftContract = await CoinEstateNFT.deploy();
    await nftContract.waitForDeployment();

    // Deploy Governance contract
    const CoinEstateGovernance = await ethers.getContractFactory("CoinEstateGovernance");
    governanceContract = await CoinEstateGovernance.deploy(await nftContract.getAddress());
    await governanceContract.waitForDeployment();

    // Grant governance role to governance contract
    const GOVERNANCE_ROLE = await nftContract.GOVERNANCE_ROLE();
    await nftContract.grantRole(GOVERNANCE_ROLE, await governanceContract.getAddress());
  });

  describe("NFT Contract", function () {
    describe("Property Management", function () {
      it("Should create a property", async function () {
        const tx = await nftContract.createProperty(
          "Luxury Apartment Berlin",
          "Berlin, Germany",
          ethers.parseEther("500000"), // 500k EUR
          1000, // 1000 shares
          "QmTest123..." // IPFS hash
        );

        await expect(tx)
          .to.emit(nftContract, "PropertyCreated")
          .withArgs(1, "Luxury Apartment Berlin", 1000);

        const property = await nftContract.getProperty(1);
        expect(property.name).to.equal("Luxury Apartment Berlin");
        expect(property.totalShares).to.equal(1000);
        expect(property.isActive).to.be.true;
      });

      it("Should not allow non-minter to create property", async function () {
        await expect(
          nftContract.connect(addr1).createProperty(
            "Test Property",
            "Test Location",
            ethers.parseEther("100000"),
            500,
            "QmTest..."
          )
        ).to.be.reverted;
      });
    });

    describe("KYC Management", function () {
      it("Should update KYC status", async function () {
        await expect(nftContract.updateKYCStatus(addr1.address, true))
          .to.emit(nftContract, "KYCStatusUpdated")
          .withArgs(addr1.address, true);

        expect(await nftContract.kycVerified(addr1.address)).to.be.true;
      });

      it("Should not allow non-KYC admin to update KYC", async function () {
        await expect(
          nftContract.connect(addr1).updateKYCStatus(addr2.address, true)
        ).to.be.reverted;
      });
    });

    describe("NFT Minting", function () {
      beforeEach(async function () {
        // Create property
        await nftContract.createProperty(
          "Test Property",
          "Test Location",
          ethers.parseEther("100000"),
          1000,
          "QmTest..."
        );
        
        // Verify KYC for addr1
        await nftContract.updateKYCStatus(addr1.address, true);
      });

      it("Should mint NFT to KYC verified address", async function () {
        const tx = await nftContract.mintNFT(
          addr1.address,
          1, // propertyId
          50, // shares
          "QmTokenURI..." // tokenURI
        );

        await expect(tx)
          .to.emit(nftContract, "NFTMinted")
          .withArgs(1, addr1.address, 1, 50);

        expect(await nftContract.balanceOf(addr1.address)).to.equal(1);
        expect(await nftContract.tokenShares(1)).to.equal(50);
        expect(await nftContract.walletPropertyShares(addr1.address, 1)).to.equal(50);
      });

      it("Should not mint to non-KYC verified address", async function () {
        await expect(
          nftContract.mintNFT(addr2.address, 1, 50, "QmTokenURI...")
        ).to.be.revertedWith("CoinEstate: Recipient must be KYC verified");
      });

      it("Should enforce 10% ownership limit", async function () {
        // Try to mint more than 10% (100 shares out of 1000)
        await expect(
          nftContract.mintNFT(addr1.address, 1, 150, "QmTokenURI...")
        ).to.be.revertedWith("CoinEstate: Exceeds 10% ownership limit per property");
      });

      it("Should not exceed total property shares", async function () {
        // Mint close to max
        await nftContract.mintNFT(addr1.address, 1, 100, "QmTokenURI1...");
        
        // Verify another address
        await nftContract.updateKYCStatus(addr2.address, true);
        await nftContract.mintNFT(addr2.address, 1, 100, "QmTokenURI2...");
        
        // Continue until we reach close to limit
        await nftContract.updateKYCStatus(addr3.address, true);
        for (let i = 0; i < 8; i++) {
          const newAddr = ethers.Wallet.createRandom().connect(ethers.provider);
          await nftContract.updateKYCStatus(newAddr.address, true);
          await nftContract.mintNFT(newAddr.address, 1, 100, `QmTokenURI${i}...`);
        }

        // Now should fail
        const newAddr = ethers.Wallet.createRandom().connect(ethers.provider);
        await nftContract.updateKYCStatus(newAddr.address, true);
        await expect(
          nftContract.mintNFT(newAddr.address, 1, 100, "QmTokenURIFail...")
        ).to.be.revertedWith("CoinEstate: Exceeds total property shares");
      });
    });

    describe("Voting Power", function () {
      beforeEach(async function () {
        // Create properties
        await nftContract.createProperty("Property1", "Location1", ethers.parseEther("100000"), 1000, "QmTest1...");
        await nftContract.createProperty("Property2", "Location2", ethers.parseEther("200000"), 2000, "QmTest2...");
        
        // Verify KYC
        await nftContract.updateKYCStatus(addr1.address, true);
        
        // Mint NFTs
        await nftContract.mintNFT(addr1.address, 1, 50, "QmURI1...");
        await nftContract.mintNFT(addr1.address, 2, 100, "QmURI2...");
      });

      it("Should calculate voting power correctly", async function () {
        expect(await nftContract.getVotingPower(addr1.address)).to.equal(150);
        expect(await nftContract.getPropertyVotingPower(addr1.address, 1)).to.equal(50);
        expect(await nftContract.getPropertyVotingPower(addr1.address, 2)).to.equal(100);
      });
    });
  });

  describe("Governance Contract", function () {
    beforeEach(async function () {
      // Create property
      await nftContract.createProperty(
        "Governance Test Property",
        "Test Location",
        ethers.parseEther("100000"),
        1000,
        "QmTest..."
      );
      
      // Setup KYC and mint NFTs
      await nftContract.updateKYCStatus(addr1.address, true);
      await nftContract.updateKYCStatus(addr2.address, true);
      
      await nftContract.mintNFT(addr1.address, 1, 80, "QmURI1...");
      await nftContract.mintNFT(addr2.address, 1, 60, "QmURI2...");
    });

    describe("Proposal Creation", function () {
      it("Should create operational proposal", async function () {
        const tx = await governanceContract.connect(addr1).createProposal(
          1, // propertyId
          "Repair Roof",
          "Fix the leaking roof",
          ethers.parseEther("3000"), // 3k EUR - operational
          "QmProposalDocs..."
        );

        await expect(tx)
          .to.emit(governanceContract, "ProposalCreated")
          .withArgs(1, 1, addr1.address, 0); // 0 = OPERATIONAL

        const proposal = await governanceContract.getProposal(1);
        expect(proposal.title).to.equal("Repair Roof");
        expect(proposal.proposalType).to.equal(0); // OPERATIONAL
        expect(proposal.quorumRequired).to.equal(10);
        expect(proposal.approvalThreshold).to.equal(60);
      });

      it("Should create strategic proposal", async function () {
        const tx = await governanceContract.connect(addr1).createProposal(
          1,
          "Major Renovation",
          "Complete property renovation",
          ethers.parseEther("25000"), // 25k EUR - strategic
          "QmProposalDocs..."
        );

        const proposal = await governanceContract.getProposal(1);
        expect(proposal.proposalType).to.equal(1); // STRATEGIC
        expect(proposal.quorumRequired).to.equal(90);
        expect(proposal.approvalThreshold).to.equal(75);
      });

      it("Should not allow non-property-owner to create proposal", async function () {
        await expect(
          governanceContract.connect(addr3).createProposal(
            1,
            "Test Proposal",
            "Description",
            ethers.parseEther("1000"),
            "QmDocs..."
          )
        ).to.be.revertedWith("Governance: Must own property shares to propose");
      });
    });

    describe("Voting Process", function () {
      beforeEach(async function () {
        // Create a proposal
        await governanceContract.connect(addr1).createProposal(
          1,
          "Test Proposal",
          "Test Description",
          ethers.parseEther("2000"),
          "QmDocs..."
        );

        // Move past voting delay
        await ethers.provider.send("evm_increaseTime", [86400]); // 1 day
        await ethers.provider.send("evm_mine");
      });

      it("Should allow voting with correct power", async function () {
        const tx = await governanceContract.connect(addr1).vote(1, true);

        await expect(tx)
          .to.emit(governanceContract, "VoteCast")
          .withArgs(1, addr1.address, true, 80);

        const vote = await governanceContract.getVote(1, addr1.address);
        expect(vote.hasVoted).to.be.true;
        expect(vote.support).to.be.true;
        expect(vote.votingPower).to.equal(80);

        const proposal = await governanceContract.getProposal(1);
        expect(proposal.forVotes).to.equal(80);
      });

      it("Should not allow double voting", async function () {
        await governanceContract.connect(addr1).vote(1, true);
        
        await expect(
          governanceContract.connect(addr1).vote(1, false)
        ).to.be.revertedWith("Governance: Already voted");
      });

      it("Should not allow voting before voting period", async function () {
        // Create new proposal
        await governanceContract.connect(addr1).createProposal(
          1,
          "Future Proposal",
          "Future Description",
          ethers.parseEther("1000"),
          "QmDocs2..."
        );

        await expect(
          governanceContract.connect(addr1).vote(2, true)
        ).to.be.revertedWith("Governance: Voting not started");
      });
    });

    describe("Proposal Execution", function () {
      beforeEach(async function () {
        // Create proposal
        await governanceContract.connect(addr1).createProposal(
          1,
          "Test Proposal",
          "Test Description",
          ethers.parseEther("2000"),
          "QmDocs..."
        );

        // Move past voting delay and vote
        await ethers.provider.send("evm_increaseTime", [86400]); // 1 day
        await ethers.provider.send("evm_mine");

        await governanceContract.connect(addr1).vote(1, true); // 80 votes for
        await governanceContract.connect(addr2).vote(1, true); // 60 votes for
      });

      it("Should execute proposal when requirements met", async function () {
        // Move past voting period
        await ethers.provider.send("evm_increaseTime", [604800]); // 7 days
        await ethers.provider.send("evm_mine");

        const tx = await governanceContract.executeProposal(1);
        await expect(tx).to.emit(governanceContract, "ProposalExecuted").withArgs(1);

        const proposal = await governanceContract.getProposal(1);
        expect(proposal.executed).to.be.true;
        expect(proposal.status).to.equal(2); // EXECUTED
      });

      it("Should reject proposal when requirements not met", async function () {
        // Vote against with addr2
        await governanceContract.connect(addr2).vote(1, false); // This changes addr2's vote to false

        // Move past voting period
        await ethers.provider.send("evm_increaseTime", [604800]); // 7 days
        await ethers.provider.send("evm_mine");

        await governanceContract.executeProposal(1);

        const proposal = await governanceContract.getProposal(1);
        expect(proposal.executed).to.be.false;
        expect(proposal.status).to.equal(3); // REJECTED
      });
    });
  });
});