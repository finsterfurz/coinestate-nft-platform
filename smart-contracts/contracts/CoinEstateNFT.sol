// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title CoinEstateNFT
 * @dev NFT contract for CoinEstate real estate governance platform
 * Each NFT represents voting rights and operational control over specific real estate projects
 */
contract CoinEstateNFT is ERC721, ERC721URIStorage, AccessControl, Pausable {
    using Counters for Counters.Counter;

    // Roles
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant GOVERNANCE_ROLE = keccak256("GOVERNANCE_ROLE");
    bytes32 public constant KYC_ADMIN_ROLE = keccak256("KYC_ADMIN_ROLE");

    // Token counter
    Counters.Counter private _tokenIdCounter;

    // Property struct
    struct Property {
        string name;
        string location;
        uint256 totalValue;
        uint256 totalShares;
        bool isActive;
        string documentHash; // IPFS hash for legal documents
    }

    // Mapping from property ID to property details
    mapping(uint256 => Property) public properties;
    
    // Mapping from token ID to property ID
    mapping(uint256 => uint256) public tokenToProperty;
    
    // Mapping from token ID to shares amount
    mapping(uint256 => uint256) public tokenShares;
    
    // Mapping from property ID to total minted shares
    mapping(uint256 => uint256) public mintedShares;
    
    // KYC verification mapping
    mapping(address => bool) public kycVerified;
    
    // Max shares per wallet per property (10% rule)
    mapping(address => mapping(uint256 => uint256)) public walletPropertyShares;
    
    // Property counter
    Counters.Counter private _propertyIdCounter;

    // Events
    event PropertyCreated(uint256 indexed propertyId, string name, uint256 totalShares);
    event NFTMinted(uint256 indexed tokenId, address indexed to, uint256 propertyId, uint256 shares);
    event KYCStatusUpdated(address indexed user, bool verified);
    event SharesTransferred(uint256 indexed tokenId, address indexed from, address indexed to);

    constructor() ERC721("CoinEstate Governance NFT", "CGOV") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(KYC_ADMIN_ROLE, msg.sender);
        
        // Start counters at 1
        _tokenIdCounter.increment();
        _propertyIdCounter.increment();
    }

    /**
     * @dev Create a new property for tokenization
     */
    function createProperty(
        string memory name,
        string memory location,
        uint256 totalValue,
        uint256 totalShares,
        string memory documentHash
    ) public onlyRole(MINTER_ROLE) returns (uint256) {
        uint256 propertyId = _propertyIdCounter.current();
        _propertyIdCounter.increment();

        properties[propertyId] = Property({
            name: name,
            location: location,
            totalValue: totalValue,
            totalShares: totalShares,
            isActive: true,
            documentHash: documentHash
        });

        emit PropertyCreated(propertyId, name, totalShares);
        return propertyId;
    }

    /**
     * @dev Mint NFT with specific shares for a property
     */
    function mintNFT(
        address to,
        uint256 propertyId,
        uint256 shares,
        string memory tokenURI
    ) public onlyRole(MINTER_ROLE) returns (uint256) {
        require(kycVerified[to], "CoinEstate: Recipient must be KYC verified");
        require(properties[propertyId].isActive, "CoinEstate: Property not active");
        require(shares > 0, "CoinEstate: Shares must be greater than 0");
        
        // Check total shares limit
        require(
            mintedShares[propertyId] + shares <= properties[propertyId].totalShares,
            "CoinEstate: Exceeds total property shares"
        );
        
        // Check 10% wallet limit per property
        uint256 maxSharesPerWallet = properties[propertyId].totalShares / 10;
        require(
            walletPropertyShares[to][propertyId] + shares <= maxSharesPerWallet,
            "CoinEstate: Exceeds 10% ownership limit per property"
        );

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        // Update mappings
        tokenToProperty[tokenId] = propertyId;
        tokenShares[tokenId] = shares;
        mintedShares[propertyId] += shares;
        walletPropertyShares[to][propertyId] += shares;

        // Mint NFT
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);

        emit NFTMinted(tokenId, to, propertyId, shares);
        return tokenId;
    }

    /**
     * @dev Update KYC status for address
     */
    function updateKYCStatus(address user, bool verified) 
        public 
        onlyRole(KYC_ADMIN_ROLE) 
    {
        kycVerified[user] = verified;
        emit KYCStatusUpdated(user, verified);
    }

    /**
     * @dev Get voting power for address across all properties
     */
    function getVotingPower(address owner) public view returns (uint256) {
        uint256 totalVotingPower = 0;
        uint256 balance = balanceOf(owner);
        
        for (uint256 i = 0; i < balance; i++) {
            uint256 tokenId = tokenOfOwnerByIndex(owner, i);
            totalVotingPower += tokenShares[tokenId];
        }
        
        return totalVotingPower;
    }

    /**
     * @dev Get voting power for address for specific property
     */
    function getPropertyVotingPower(address owner, uint256 propertyId) 
        public 
        view 
        returns (uint256) 
    {
        return walletPropertyShares[owner][propertyId];
    }

    /**
     * @dev Get property details
     */
    function getProperty(uint256 propertyId) 
        public 
        view 
        returns (Property memory) 
    {
        return properties[propertyId];
    }

    /**
     * @dev Get current property ID counter
     */
    function getCurrentPropertyId() public view returns (uint256) {
        return _propertyIdCounter.current() - 1;
    }

    /**
     * @dev Override transfer functions to maintain KYC requirement
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
        
        // Allow minting and burning
        if (from == address(0) || to == address(0)) {
            return;
        }
        
        // Require KYC for transfers
        require(kycVerified[to], "CoinEstate: Recipient must be KYC verified");
        
        // Update property share tracking
        uint256 propertyId = tokenToProperty[tokenId];
        uint256 shares = tokenShares[tokenId];
        
        // Check 10% limit for recipient
        uint256 maxSharesPerWallet = properties[propertyId].totalShares / 10;
        require(
            walletPropertyShares[to][propertyId] + shares <= maxSharesPerWallet,
            "CoinEstate: Transfer would exceed 10% ownership limit"
        );
    }

    /**
     * @dev Override transfer functions to update share tracking
     */
    function _afterTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override {
        super._afterTokenTransfer(from, to, tokenId, batchSize);
        
        // Update share tracking for transfers (not mints/burns)
        if (from != address(0) && to != address(0)) {
            uint256 propertyId = tokenToProperty[tokenId];
            uint256 shares = tokenShares[tokenId];
            
            walletPropertyShares[from][propertyId] -= shares;
            walletPropertyShares[to][propertyId] += shares;
            
            emit SharesTransferred(tokenId, from, to);
        }
    }

    /**
     * @dev Pause contract (emergency)
     */
    function pause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause contract
     */
    function unpause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    // Required overrides
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}