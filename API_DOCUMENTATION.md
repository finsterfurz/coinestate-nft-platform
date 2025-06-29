# 🔌 API Documentation

## Overview
CoinEstate NFT Platform API documentation for Web3 integration and governance functionality.

## Base URL
```
Production: https://api.coinestate.io/v1
Development: http://localhost:3001/api/v1
```

## Authentication
All API requests require either wallet signature or JWT token:

```bash
# Wallet Signature Authentication
curl -H "Authorization: Signature ${wallet_signature}" \
     -H "Wallet-Address: ${wallet_address}" \
     https://api.coinestate.io/v1/governance/proposals

# JWT Token Authentication  
curl -H "Authorization: Bearer ${jwt_token}" \
     https://api.coinestate.io/v1/user/profile
```

## Endpoints

### 🗳️ Governance API

#### GET /governance/proposals
Retrieve all active governance proposals.

**Response:**
```json
{
  "proposals": [
    {
      "id": "proposal-001",
      "title": "Property Maintenance Budget Q3 2025",
      "description": "Approve €15,000 for roof repairs and HVAC maintenance",
      "status": "active",
      "voting_deadline": "2025-07-15T23:59:59Z",
      "yes_votes": 142,
      "no_votes": 23,
      "total_eligible_voters": 500,
      "quorum_required": 0.5,
      "created_at": "2025-06-15T10:00:00Z"
    }
  ],
  "total": 1,
  "page": 1
}
```

#### POST /governance/vote
Submit a vote on a proposal.

**Request:**
```json
{
  "proposal_id": "proposal-001",
  "vote": "yes", // "yes" | "no" | "abstain"
  "wallet_signature": "0x...",
  "nft_token_ids": [1, 5, 12] // NFTs used for voting
}
```

**Response:**
```json
{
  "success": true,
  "vote_id": "vote-12345",
  "voting_power": 3,
  "transaction_hash": "0x..."
}
```

### 🏠 Property API

#### GET /properties
List all properties in the platform.

**Query Parameters:**
- `status`: `active` | `under_governance` | `sold`
- `limit`: Number of results (default: 20)
- `offset`: Pagination offset

**Response:**
```json
{
  "properties": [
    {
      "id": "prop-001",
      "address": "123 Blockchain Street, Cayman Islands",
      "value_usd": 2500000,
      "nft_collection_address": "0x...",
      "total_nfts": 500,
      "annual_roi": 0.08,
      "governance_status": "active",
      "next_governance_deadline": "2025-07-30T23:59:59Z"
    }
  ]
}
```

### 👤 User API

#### GET /user/profile
Get user profile and NFT holdings.

**Response:**
```json
{
  "user": {
    "wallet_address": "0x...",
    "kyc_status": "verified",
    "nft_holdings": [
      {
        "token_id": 1,
        "property_id": "prop-001",
        "voting_power": 1,
        "acquisition_date": "2025-01-15T00:00:00Z"
      }
    ],
    "voting_history": {
      "total_votes": 15,
      "participation_rate": 0.93
    }
  }
}
```

#### POST /user/kyc/verify
Submit KYC verification documents.

**Request (multipart/form-data):**
```
identity_document: File
proof_of_address: File
wallet_signature: String
```

## Error Handling

All API errors return consistent format:

```json
{
  "error": {
    "code": "INSUFFICIENT_VOTING_POWER",
    "message": "Your NFT holdings do not provide sufficient voting power for this proposal",
    "details": {
      "required_voting_power": 5,
      "current_voting_power": 2
    }
  },
  "request_id": "req-12345"
}
```

## Rate Limiting

- **Public endpoints**: 100 requests per minute per IP
- **Authenticated endpoints**: 1000 requests per minute per wallet
- **Voting endpoints**: 10 requests per minute per wallet

## Webhooks

Register webhooks to receive real-time updates:

### Proposal Status Changes
```json
{
  "event": "proposal.status_changed",
  "data": {
    "proposal_id": "proposal-001",
    "old_status": "active",
    "new_status": "passed",
    "final_vote_count": {
      "yes": 245,
      "no": 87,
      "abstain": 12
    }
  },
  "timestamp": "2025-07-16T00:00:01Z"
}
```

## SDKs and Examples

### JavaScript/TypeScript SDK
```bash
npm install @coinestate/api-sdk
```

```javascript
import { CoinEstateAPI } from '@coinestate/api-sdk';

const api = new CoinEstateAPI({
  baseURL: 'https://api.coinestate.io/v1',
  walletProvider: window.ethereum
});

// Vote on proposal
const result = await api.governance.vote({
  proposalId: 'proposal-001',
  vote: 'yes',
  nftTokenIds: [1, 5, 12]
});
```

## Security Considerations

- All sensitive operations require wallet signature verification
- Rate limiting prevents abuse
- KYC verification required for voting
- Multi-signature validation for high-value proposals
- Audit logs for all governance actions

---

**Note:** This API is under development. Production endpoints will be available with the mainnet launch.
