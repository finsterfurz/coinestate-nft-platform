// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./CoinEstateNFT.sol";

/**
 * @title CoinEstateGovernance
 * @dev Governance contract for property management decisions
 * Implements voting mechanisms for operational and strategic decisions
 */
contract CoinEstateGovernance is AccessControl, Pausable {
    using Counters for Counters.Counter;

    // Roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant PROPOSER_ROLE = keccak256("PROPOSER_ROLE");

    // Proposal types
    enum ProposalType {
        OPERATIONAL,    // <5k EUR decisions
        STRATEGIC,      // >20k EUR decisions
        EMERGENCY       // Emergency decisions
    }

    // Proposal status
    enum ProposalStatus {
        PENDING,
        ACTIVE,
        EXECUTED,
        REJECTED,
        CANCELLED
    }

    // Proposal struct
    struct Proposal {
        uint256 id;
        uint256 propertyId;
        ProposalType proposalType;
        string title;
        string description;
        uint256 amount; // EUR amount (in wei for precision)
        address proposer;
        uint256 startTime;
        uint256 endTime;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 quorumRequired;
        uint256 approvalThreshold; // Percentage (60 = 60%)
        ProposalStatus status;
        bool executed;
        string documentsHash; // IPFS hash for supporting documents
    }

    // Vote struct
    struct Vote {
        bool hasVoted;
        bool support;
        uint256 votingPower;
        uint256 timestamp;
    }

    // Reference to NFT contract
    CoinEstateNFT public nftContract;

    // Proposal counter
    Counters.Counter private _proposalIdCounter;

    // Proposals mapping
    mapping(uint256 => Proposal) public proposals;
    
    // Proposal votes: proposalId => voter => Vote
    mapping(uint256 => mapping(address => Vote)) public votes;
    
    // Proposal voters list for each proposal
    mapping(uint256 => address[]) public proposalVoters;

    // Governance parameters
    uint256 public constant OPERATIONAL_THRESHOLD = 5000 ether; // 5k EUR in wei
    uint256 public constant STRATEGIC_THRESHOLD = 20000 ether; // 20k EUR in wei
    uint256 public constant VOTING_DELAY = 1 days;
    uint256 public constant OPERATIONAL_VOTING_PERIOD = 7 days;
    uint256 public constant STRATEGIC_VOTING_PERIOD = 14 days;
    uint256 public constant EMERGENCY_VOTING_PERIOD = 3 days;

    // Events
    event ProposalCreated(
        uint256 indexed proposalId,
        uint256 indexed propertyId,
        address indexed proposer,
        ProposalType proposalType
    );
    event VoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        bool support,
        uint256 votingPower
    );
    event ProposalExecuted(uint256 indexed proposalId);
    event ProposalCancelled(uint256 indexed proposalId);

    constructor(address _nftContract) {
        nftContract = CoinEstateNFT(_nftContract);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(PROPOSER_ROLE, msg.sender);
        
        _proposalIdCounter.increment(); // Start at 1
    }

    /**
     * @dev Create a new proposal
     */
    function createProposal(
        uint256 propertyId,
        string memory title,
        string memory description,
        uint256 amount,
        string memory documentsHash
    ) public returns (uint256) {
        require(
            nftContract.kycVerified(msg.sender),
            "Governance: Proposer must be KYC verified"
        );
        require(
            nftContract.getPropertyVotingPower(msg.sender, propertyId) > 0,
            "Governance: Must own property shares to propose"
        );

        // Determine proposal type based on amount
        ProposalType proposalType;
        uint256 quorumRequired;
        uint256 approvalThreshold;
        uint256 votingPeriod;

        if (amount == 0) {
            // Non-financial proposals
            proposalType = ProposalType.OPERATIONAL;
            quorumRequired = 10; // 10%
            approvalThreshold = 51; // 51%
            votingPeriod = OPERATIONAL_VOTING_PERIOD;
        } else if (amount < OPERATIONAL_THRESHOLD) {
            proposalType = ProposalType.OPERATIONAL;
            quorumRequired = 10; // 10%
            approvalThreshold = 60; // 60%
            votingPeriod = OPERATIONAL_VOTING_PERIOD;
        } else if (amount >= STRATEGIC_THRESHOLD) {
            proposalType = ProposalType.STRATEGIC;
            quorumRequired = 90; // 90%
            approvalThreshold = 75; // 75%
            votingPeriod = STRATEGIC_VOTING_PERIOD;
        } else {
            proposalType = ProposalType.OPERATIONAL;
            quorumRequired = 25; // 25%
            approvalThreshold = 66; // 66%
            votingPeriod = OPERATIONAL_VOTING_PERIOD;
        }

        uint256 proposalId = _proposalIdCounter.current();
        _proposalIdCounter.increment();

        proposals[proposalId] = Proposal({
            id: proposalId,
            propertyId: propertyId,
            proposalType: proposalType,
            title: title,
            description: description,
            amount: amount,
            proposer: msg.sender,
            startTime: block.timestamp + VOTING_DELAY,
            endTime: block.timestamp + VOTING_DELAY + votingPeriod,
            forVotes: 0,
            againstVotes: 0,
            quorumRequired: quorumRequired,
            approvalThreshold: approvalThreshold,
            status: ProposalStatus.PENDING,
            executed: false,
            documentsHash: documentsHash
        });

        emit ProposalCreated(proposalId, propertyId, msg.sender, proposalType);
        return proposalId;
    }

    /**
     * @dev Cast vote on proposal
     */
    function vote(uint256 proposalId, bool support) public {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.id != 0, "Governance: Proposal does not exist");
        require(
            nftContract.kycVerified(msg.sender),
            "Governance: Voter must be KYC verified"
        );
        require(
            block.timestamp >= proposal.startTime,
            "Governance: Voting not started"
        );
        require(
            block.timestamp <= proposal.endTime,
            "Governance: Voting period ended"
        );
        require(
            proposal.status == ProposalStatus.PENDING || proposal.status == ProposalStatus.ACTIVE,
            "Governance: Proposal not active"
        );
        require(
            !votes[proposalId][msg.sender].hasVoted,
            "Governance: Already voted"
        );

        // Get voting power for this property
        uint256 votingPower = nftContract.getPropertyVotingPower(msg.sender, proposal.propertyId);
        require(votingPower > 0, "Governance: No voting power for this property");

        // Update proposal status to active if first vote
        if (proposal.status == ProposalStatus.PENDING) {
            proposal.status = ProposalStatus.ACTIVE;
        }

        // Record vote
        votes[proposalId][msg.sender] = Vote({
            hasVoted: true,
            support: support,
            votingPower: votingPower,
            timestamp: block.timestamp
        });

        // Add to voters list
        proposalVoters[proposalId].push(msg.sender);

        // Update vote tallies
        if (support) {
            proposal.forVotes += votingPower;
        } else {
            proposal.againstVotes += votingPower;
        }

        emit VoteCast(proposalId, msg.sender, support, votingPower);
    }

    /**
     * @dev Execute proposal if conditions are met
     */
    function executeProposal(uint256 proposalId) public {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.id != 0, "Governance: Proposal does not exist");
        require(!proposal.executed, "Governance: Already executed");
        require(
            block.timestamp > proposal.endTime,
            "Governance: Voting period not ended"
        );

        // Calculate results
        uint256 totalPropertyShares = nftContract.getProperty(proposal.propertyId).totalShares;
        uint256 totalVotes = proposal.forVotes + proposal.againstVotes;
        uint256 quorumMet = (totalVotes * 100) / totalPropertyShares;
        uint256 approvalRate = totalVotes > 0 ? (proposal.forVotes * 100) / totalVotes : 0;

        // Check if proposal passes
        bool quorumReached = quorumMet >= proposal.quorumRequired;
        bool approved = approvalRate >= proposal.approvalThreshold;

        if (quorumReached && approved) {
            proposal.status = ProposalStatus.EXECUTED;
            proposal.executed = true;
            emit ProposalExecuted(proposalId);
        } else {
            proposal.status = ProposalStatus.REJECTED;
        }
    }

    /**
     * @dev Cancel proposal (admin only)
     */
    function cancelProposal(uint256 proposalId) public onlyRole(ADMIN_ROLE) {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.id != 0, "Governance: Proposal does not exist");
        require(!proposal.executed, "Governance: Cannot cancel executed proposal");
        
        proposal.status = ProposalStatus.CANCELLED;
        emit ProposalCancelled(proposalId);
    }

    /**
     * @dev Get proposal details
     */
    function getProposal(uint256 proposalId) public view returns (Proposal memory) {
        return proposals[proposalId];
    }

    /**
     * @dev Get vote details for specific voter and proposal
     */
    function getVote(uint256 proposalId, address voter) public view returns (Vote memory) {
        return votes[proposalId][voter];
    }

    /**
     * @dev Get all voters for a proposal
     */
    function getProposalVoters(uint256 proposalId) public view returns (address[] memory) {
        return proposalVoters[proposalId];
    }

    /**
     * @dev Get voting results for proposal
     */
    function getVotingResults(uint256 proposalId) public view returns (
        uint256 totalVotes,
        uint256 forVotes,
        uint256 againstVotes,
        uint256 quorumPercentage,
        uint256 approvalPercentage,
        bool quorumMet,
        bool approved
    ) {
        Proposal memory proposal = proposals[proposalId];
        uint256 totalPropertyShares = nftContract.getProperty(proposal.propertyId).totalShares;
        
        totalVotes = proposal.forVotes + proposal.againstVotes;
        forVotes = proposal.forVotes;
        againstVotes = proposal.againstVotes;
        quorumPercentage = totalPropertyShares > 0 ? (totalVotes * 100) / totalPropertyShares : 0;
        approvalPercentage = totalVotes > 0 ? (forVotes * 100) / totalVotes : 0;
        quorumMet = quorumPercentage >= proposal.quorumRequired;
        approved = approvalPercentage >= proposal.approvalThreshold;
    }

    /**
     * @dev Get current proposal ID counter
     */
    function getCurrentProposalId() public view returns (uint256) {
        return _proposalIdCounter.current() - 1;
    }

    /**
     * @dev Update NFT contract address (admin only)
     */
    function updateNFTContract(address newNFTContract) public onlyRole(ADMIN_ROLE) {
        nftContract = CoinEstateNFT(newNFTContract);
    }

    /**
     * @dev Pause contract (emergency)
     */
    function pause() public onlyRole(ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause contract
     */
    function unpause() public onlyRole(ADMIN_ROLE) {
        _unpause();
    }
}