// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Votes.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title CoinEstateNFT
 * @dev NFT contract for CoinEstate governance tokens
 * Each NFT represents voting rights for specific real estate properties
 */
contract CoinEstateNFT is 
    ERC721,
    ERC721Enumerable,
    ERC721URIStorage,
    ERC721Votes,
    AccessControl,
    Pausable,
    ReentrancyGuard
{
    using Counters for Counters.Counter;

    // Role definitions
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant GOVERNANCE_ROLE = keccak256("GOVERNANCE_ROLE");
    bytes32 public constant KYC_ROLE = keccak256("KYC_ROLE");

    // Counters
    Counters.Counter private _tokenIdCounter;
    Counters.Counter private _propertyIdCounter;

    // Property and NFT structures
    struct Property {
        uint256 id;
        string name;
        string location;
        uint256 totalNFTs;
        uint256 mintedNFTs;
        bool active;
        address propertyManager;
        string metadataURI;
    }

    struct NFTDetails {
        uint256 propertyId;
        uint256 serialNumber;
        bool active;
        uint256 mintTimestamp;
    }

    // Mappings
    mapping(uint256 => Property) public properties;
    mapping(uint256 => NFTDetails) public nftDetails;
    mapping(uint256 => mapping(address => uint256)) public propertyOwnership; // propertyId => owner => count
    mapping(address => bool) public kycVerified;
    mapping(address => mapping(uint256 => bool)) public propertyKYC; // address => propertyId => verified

    // Events
    event PropertyCreated(uint256 indexed propertyId, string name, uint256 totalNFTs);
    event NFTMinted(uint256 indexed tokenId, uint256 indexed propertyId, address indexed owner);
    event KYCVerified(address indexed account, uint256 indexed propertyId);
    event PropertyStatusUpdated(uint256 indexed propertyId, bool active);

    constructor(
        string memory name,
        string memory symbol
    ) ERC721(name, symbol) EIP712(name, "1") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(KYC_ROLE, msg.sender);
        
        // Start token IDs at 1
        _tokenIdCounter.increment();
        _propertyIdCounter.increment();
    }

    /**
     * @dev Create a new property
     */
    function createProperty(
        string memory name,
        string memory location,
        uint256 totalNFTs,
        address propertyManager,
        string memory metadataURI
    ) public onlyRole(DEFAULT_ADMIN_ROLE) returns (uint256) {
        require(totalNFTs > 0, "Total NFTs must be greater than 0");
        require(totalNFTs <= 10000, "Total NFTs cannot exceed 10,000");
        
        uint256 propertyId = _propertyIdCounter.current();
        _propertyIdCounter.increment();

        properties[propertyId] = Property({
            id: propertyId,
            name: name,
            location: location,
            totalNFTs: totalNFTs,
            mintedNFTs: 0,
            active: true,
            propertyManager: propertyManager,
            metadataURI: metadataURI
        });

        emit PropertyCreated(propertyId, name, totalNFTs);
        return propertyId;
    }

    /**
     * @dev Mint NFT to address after KYC verification
     */
    function mint(
        address to,
        uint256 propertyId,
        string memory tokenURI
    ) public onlyRole(MINTER_ROLE) nonReentrant returns (uint256) {
        require(properties[propertyId].active, "Property not active");
        require(
            properties[propertyId].mintedNFTs < properties[propertyId].totalNFTs,
            "All NFTs for this property have been minted"
        );
        require(kycVerified[to], "Recipient must be KYC verified");
        require(propertyKYC[to][propertyId], "Recipient must be KYC verified for this property");

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        // Update property minting count
        properties[propertyId].mintedNFTs++;
        
        // Set NFT details
        nftDetails[tokenId] = NFTDetails({
            propertyId: propertyId,
            serialNumber: properties[propertyId].mintedNFTs,
            active: true,
            mintTimestamp: block.timestamp
        });

        // Update ownership tracking
        propertyOwnership[propertyId][to]++;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);

        emit NFTMinted(tokenId, propertyId, to);
        return tokenId;
    }

    /**
     * @dev Batch mint multiple NFTs
     */
    function batchMint(
        address[] calldata recipients,
        uint256 propertyId,
        string[] calldata tokenURIs
    ) external onlyRole(MINTER_ROLE) nonReentrant {
        require(recipients.length == tokenURIs.length, "Arrays length mismatch");
        require(recipients.length <= 50, "Batch size too large");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            mint(recipients[i], propertyId, tokenURIs[i]);
        }
    }

    /**
     * @dev Verify KYC for an address
     */
    function verifyKYC(address account) external onlyRole(KYC_ROLE) {
        kycVerified[account] = true;
    }

    /**
     * @dev Verify KYC for specific property
     */
    function verifyPropertyKYC(address account, uint256 propertyId) external onlyRole(KYC_ROLE) {
        require(properties[propertyId].id == propertyId, "Property does not exist");
        propertyKYC[account][propertyId] = true;
        emit KYCVerified(account, propertyId);
    }

    /**
     * @dev Get voting weight for address on specific property
     */
    function getVotingWeight(address account, uint256 propertyId) external view returns (uint256) {
        if (!kycVerified[account] || !propertyKYC[account][propertyId]) {
            return 0;
        }
        
        uint256 ownedNFTs = propertyOwnership[propertyId][account];
        uint256 totalNFTs = properties[propertyId].totalNFTs;
        
        // Apply 10% voting power cap
        uint256 maxVotingPower = (totalNFTs * 10) / 100;
        return ownedNFTs > maxVotingPower ? maxVotingPower : ownedNFTs;
    }

    /**
     * @dev Get all properties owned by address
     */
    function getPropertiesOwnedBy(address owner) external view returns (uint256[] memory, uint256[] memory) {
        uint256 propertyCount = _propertyIdCounter.current() - 1;
        uint256[] memory ownedProperties = new uint256[](propertyCount);
        uint256[] memory nftCounts = new uint256[](propertyCount);
        uint256 ownedCount = 0;

        for (uint256 i = 1; i <= propertyCount; i++) {
            if (propertyOwnership[i][owner] > 0) {
                ownedProperties[ownedCount] = i;
                nftCounts[ownedCount] = propertyOwnership[i][owner];
                ownedCount++;
            }
        }

        // Resize arrays to actual count
        assembly {
            mstore(ownedProperties, ownedCount)
            mstore(nftCounts, ownedCount)
        }

        return (ownedProperties, nftCounts);
    }

    /**
     * @dev Override transfer functions to update ownership tracking
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) whenNotPaused {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);

        // Update property ownership tracking
        if (from != address(0) && to != address(0)) {
            uint256 propertyId = nftDetails[tokenId].propertyId;
            propertyOwnership[propertyId][from]--;
            propertyOwnership[propertyId][to]++;
        }
    }

    /**
     * @dev Override for ERC721Votes
     */
    function _afterTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Votes) {
        super._afterTokenTransfer(from, to, tokenId, batchSize);
    }

    /**
     * @dev Pause contract functions
     */
    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause contract functions
     */
    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /**
     * @dev Update property status
     */
    function setPropertyActive(uint256 propertyId, bool active) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(properties[propertyId].id == propertyId, "Property does not exist");
        properties[propertyId].active = active;
        emit PropertyStatusUpdated(propertyId, active);
    }

    // View functions
    function getProperty(uint256 propertyId) external view returns (Property memory) {
        return properties[propertyId];
    }

    function getNFTDetails(uint256 tokenId) external view returns (NFTDetails memory) {
        return nftDetails[tokenId];
    }

    function totalProperties() external view returns (uint256) {
        return _propertyIdCounter.current() - 1;
    }

    // Required overrides
    function tokenURI(uint256 tokenId)
        public view override(ERC721, ERC721URIStorage) returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public view override(ERC721, ERC721Enumerable, AccessControl) returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
}
