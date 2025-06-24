// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./CoinEstateNFT.sol";

/**
 * @title CoinEstateGovernance
 * @dev Governance contract for property management decisions
 */
contract CoinEstateGovernance is
    Governor,
    GovernorSettings,
    GovernorCountingSimple,
    GovernorVotes,
    GovernorVotesQuorumFraction,
    AccessControl,
    ReentrancyGuard
{
    enum ProposalType { OPERATIONAL, STRATEGIC }

    uint256 public constant OPERATIONAL_THRESHOLD = 500000; // €5,000 in cents
    uint256 public constant STRATEGIC_THRESHOLD = 2000000;  // €20,000 in cents
    uint256 public constant MAX_VOTING_POWER_PERCENT = 10;  // 10% max voting power

    bytes32 public constant PROPOSER_ROLE = keccak256("PROPOSER_ROLE");
    bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");
    bytes32 public constant KYC_ROLE = keccak256("KYC_ROLE");

    CoinEstateNFT public immutable nftContract;

    struct ProposalDetails {
        uint256 propertyId;
        ProposalType proposalType;
        uint256 amountEurCents;
        string ipfsHash;
        address proposer;
        uint256 creationTime;
        bool executed;
        mapping(address => bool) hasVoted;
        uint256 totalVotes;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 votesAbstain;
    }

    struct ParticipationInfo {
        uint256 lastVoteTime;
        uint256 totalVotes;
        uint256 nonParticipationStreak;
        bool warningIssued;
    }

    mapping(uint256 => ProposalDetails) public proposalDetails;
    mapping(address => mapping(uint256 => ParticipationInfo)) public participation; // voter => propertyId => info
    mapping(uint256 => mapping(address => uint256)) public propertyVotingPower; // propertyId => voter => power

    event ProposalCreated(
        uint256 indexed proposalId,
        uint256 indexed propertyId,
        ProposalType proposalType,
        uint256 amount,
        address proposer
    );

    event VoteCastWithParams(
        uint256 indexed proposalId,
        address indexed voter,
        uint8 support,
        uint256 weight,
        string reason
    );

    event ParticipationWarning(address indexed voter, uint256 indexed propertyId);
    event BuybackEligible(address indexed voter, uint256 indexed propertyId);

    constructor(
        CoinEstateNFT _nftContract,
        string memory _name,
        uint256 _votingDelay,
        uint256 _votingPeriod,
        uint256 _proposalThreshold
    )
        Governor(_name)
        GovernorSettings(_votingDelay, _votingPeriod, _proposalThreshold)
        GovernorVotes(IVotes(address(_nftContract)))
        GovernorVotesQuorumFraction(4)
    {
        nftContract = _nftContract;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PROPOSER_ROLE, msg.sender);
        _grantRole(EXECUTOR_ROLE, msg.sender);
        _grantRole(KYC_ROLE, msg.sender);
    }

    function createPropertyProposal(
        uint256 propertyId,
        string memory description,
        uint256 amountEurCents,
        string memory ipfsHash,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas
    ) public returns (uint256) {
        require(_hasVotingRights(msg.sender, propertyId), "No voting rights for this property");
        require(_isKYCVerified(msg.sender, propertyId), "KYC verification required");
        ProposalType pType = amountEurCents >= STRATEGIC_THRESHOLD ? 
            ProposalType.STRATEGIC : ProposalType.OPERATIONAL;

        uint256 proposalId = propose(targets, values, calldatas, description);

        ProposalDetails storage details = proposalDetails[proposalId];
        details.propertyId = propertyId;
        details.proposalType = pType;
        details.amountEurCents = amountEurCents;
        details.ipfsHash = ipfsHash;
        details.proposer = msg.sender;
        details.creationTime = block.timestamp;
        details.executed = false;

        emit ProposalCreated(proposalId, propertyId, pType, amountEurCents, msg.sender);
        return proposalId;
    }

    function castVote(uint256 proposalId, uint8 support) 
        public override returns (uint256) 
    {
        return _castVoteWithReason(proposalId, support, "");
    }

    function castVoteWithReason(uint256 proposalId, uint8 support, string calldata reason)
        public override returns (uint256)
    {
        return _castVoteWithReason(proposalId, support, reason);
    }

    function _castVoteWithReason(uint256 proposalId, uint8 support, string memory reason)
        internal returns (uint256)
    {
        ProposalDetails storage proposal = proposalDetails[proposalId];
        require(proposal.creationTime > 0, "Proposal does not exist");
        require(!proposal.hasVoted[msg.sender], "Already voted");
        require(_isKYCVerified(msg.sender, proposal.propertyId), "KYC verification required");

        uint256 weight = _getVotingWeight(msg.sender, proposal.propertyId);
        require(weight > 0, "No voting power");

        proposal.hasVoted[msg.sender] = true;
        proposal.totalVotes += weight;
        if (support == 0) proposal.votesAgainst += weight;
        else if (support == 1) proposal.votesFor += weight;
        else if (support == 2) proposal.votesAbstain += weight;

        ParticipationInfo storage info = participation[msg.sender][proposal.propertyId];
        info.lastVoteTime = block.timestamp;
        info.totalVotes++;
        info.nonParticipationStreak = 0;

        emit VoteCastWithParams(proposalId, msg.sender, support, weight, reason);

        return _castVote(proposalId, msg.sender, support, reason);
    }

    function _getVotingWeight(address voter, uint256 propertyId) internal view returns (uint256) {
        return nftContract.getVotingWeight(voter, propertyId);
    }

    function _hasVotingRights(address voter, uint256 propertyId) internal view returns (bool) {
        return _getVotingWeight(voter, propertyId) > 0;
    }

    function _isKYCVerified(address voter, uint256 propertyId) internal view returns (bool) {
        return nftContract.kycVerified(voter) && nftContract.propertyKYC(voter, propertyId);
    }

    function quorum(uint256 blockNumber) public view override returns (uint256) {
        return super.quorum(blockNumber);
    }

    function proposalQuorum(uint256 proposalId) public view returns (uint256) {
        ProposalDetails storage proposal = proposalDetails[proposalId];
        CoinEstateNFT.Property memory property = nftContract.getProperty(proposal.propertyId);
        if (proposal.proposalType == ProposalType.STRATEGIC) {
            return (property.totalNFTs * 90) / 100; // 90% for strategic
        } else {
            return (property.totalNFTs * 25) / 100; // 25% for operational
        }
    }

    function hasReachedQuorum(uint256 proposalId) public view returns (bool) {
        ProposalDetails storage proposal = proposalDetails[proposalId];
        uint256 requiredQuorum = proposalQuorum(proposalId);
        return proposal.totalVotes >= requiredQuorum;
    }

    function applyNonParticipationPenalty(address voter, uint256 propertyId) 
        external onlyRole(KYC_ROLE) 
    {
        ParticipationInfo storage info = participation[voter][propertyId];
        info.nonParticipationStreak++;

        if (info.nonParticipationStreak >= 3 && !info.warningIssued) {
            info.warningIssued = true;
            emit ParticipationWarning(voter, propertyId);
        }

        if (block.timestamp - info.lastVoteTime > 365 days) {
            emit BuybackEligible(voter, propertyId);
        }
    }

    function getProposalResults(uint256 proposalId) external view returns (
        uint256 totalVotes,
        uint256 votesFor,
        uint256 votesAgainst,
        uint256 votesAbstain,
        uint256 requiredQuorum,
        bool quorumReached
    ) {
        ProposalDetails storage proposal = proposalDetails[proposalId];
        uint256 quorumNeeded = proposalQuorum(proposalId);
        return (
            proposal.totalVotes,
            proposal.votesFor,
            proposal.votesAgainst,
            proposal.votesAbstain,
            quorumNeeded,
            proposal.totalVotes >= quorumNeeded
        );
    }

    function getParticipationInfo(address voter, uint256 propertyId) 
        external view returns (ParticipationInfo memory) 
    {
        return participation[voter][propertyId];
    }

    function votingDelay() public view override(Governor, GovernorSettings) returns (uint256) {
        return super.votingDelay();
    }

    function votingPeriod() public view override(Governor, GovernorSettings) returns (uint256) {
        return super.votingPeriod();
    }

    function proposalThreshold() public view override(Governor, GovernorSettings) returns (uint256) {
        return super.proposalThreshold();
    }

    function supportsInterface(bytes4 interfaceId)
        public view override(Governor, AccessControl) returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
