// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title PropertyRegistry
 * @dev Registry for real estate properties and their metadata
 */
contract PropertyRegistry is AccessControl, ReentrancyGuard {
    using Counters for Counters.Counter;

    bytes32 public constant PROPERTY_MANAGER_ROLE = keccak256("PROPERTY_MANAGER_ROLE");
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");

    struct PropertyMetadata {
        string name;
        string location;
        string propertyType;
        uint256 purchasePrice;
        uint256 estimatedValue;
        uint256 monthlyRent;
        string documentHash;
        bool verified;
        uint256 createdAt;
        uint256 lastUpdated;
    }

    struct FinancialRecord {
        uint256 month;
        uint256 rentReceived;
        uint256 expenses;
        uint256 netIncome;
        string expenseBreakdown;
        bool verified;
    }

    mapping(uint256 => PropertyMetadata) public properties;
    mapping(uint256 => FinancialRecord[]) public financialHistory;
    mapping(uint256 => uint256) public currentValuation;

    Counters.Counter private _propertyIds;

    event PropertyRegistered(uint256 indexed propertyId, string name, string location);
    event PropertyUpdated(uint256 indexed propertyId);
    event FinancialRecordAdded(uint256 indexed propertyId, uint256 month, uint256 netIncome);
    event ValuationUpdated(uint256 indexed propertyId, uint256 newValue);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PROPERTY_MANAGER_ROLE, msg.sender);
        _grantRole(ORACLE_ROLE, msg.sender);
    }

    function registerProperty(
        string memory name,
        string memory location,
        string memory propertyType,
        uint256 purchasePrice,
        uint256 estimatedValue,
        uint256 monthlyRent,
        string memory documentHash
    ) external onlyRole(PROPERTY_MANAGER_ROLE) returns (uint256) {
        _propertyIds.increment();
        uint256 propertyId = _propertyIds.current();

        properties[propertyId] = PropertyMetadata({
            name: name,
            location: location,
            propertyType: propertyType,
            purchasePrice: purchasePrice,
            estimatedValue: estimatedValue,
            monthlyRent: monthlyRent,
            documentHash: documentHash,
            verified: false,
            createdAt: block.timestamp,
            lastUpdated: block.timestamp
        });

        currentValuation[propertyId] = estimatedValue;

        emit PropertyRegistered(propertyId, name, location);
        return propertyId;
    }

    function addFinancialRecord(
        uint256 propertyId,
        uint256 month,
        uint256 rentReceived,
        uint256 expenses,
        string memory expenseBreakdown
    ) external onlyRole(PROPERTY_MANAGER_ROLE) {
        require(properties[propertyId].createdAt > 0, "Property does not exist");
        uint256 netIncome = rentReceived > expenses ? rentReceived - expenses : 0;
        financialHistory[propertyId].push(FinancialRecord({
            month: month,
            rentReceived: rentReceived,
            expenses: expenses,
            netIncome: netIncome,
            expenseBreakdown: expenseBreakdown,
            verified: false
        }));
        emit FinancialRecordAdded(propertyId, month, netIncome);
    }

    function updateValuation(uint256 propertyId, uint256 newValue) 
        external onlyRole(ORACLE_ROLE) 
    {
        require(properties[propertyId].createdAt > 0, "Property does not exist");
        currentValuation[propertyId] = newValue;
        properties[propertyId].lastUpdated = block.timestamp;
        emit ValuationUpdated(propertyId, newValue);
    }

    function getFinancialHistory(uint256 propertyId) 
        external view returns (FinancialRecord[] memory) 
    {
        return financialHistory[propertyId];
    }

    function getPropertyCount() external view returns (uint256) {
        return _propertyIds.current();
    }
}
