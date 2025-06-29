/**
 * CoinEstate Backend - NFT Routes
 * NFT management and trading endpoints
 */

import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validate } from '../utils/validation.js';
import { nftSchemas } from '../utils/validation.js';
import { authenticate, requireKYC } from '../middleware/auth.js';
import { userRateLimit } from '../middleware/security.js';
import * as nftController from '../controllers/nftController.js';

const router = express.Router();

/**
 * @swagger
 * /api/v1/nfts:
 *   get:
 *     tags: [NFTs]
 *     summary: Get all NFTs
 *     description: Retrieve a list of NFTs with filtering and pagination
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *       - in: query
 *         name: owner
 *         schema:
 *           type: string
 *           description: Filter by owner wallet address
 *       - in: query
 *         name: propertyId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: isStaked
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: NFTs retrieved successfully
 */
router.get('/',
  validate(nftSchemas.filter, 'query'),
  asyncHandler(nftController.getAllNFTs)
);

/**
 * @swagger
 * /api/v1/nfts/{tokenId}:
 *   get:
 *     tags: [NFTs]
 *     summary: Get NFT by token ID
 *     description: Retrieve detailed information about a specific NFT
 *     parameters:
 *       - in: path
 *         name: tokenId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: NFT retrieved successfully
 */
router.get('/:tokenId',
  validate({ tokenId: require('joi').number().integer().positive().required() }, 'params'),
  asyncHandler(nftController.getNFTByTokenId)
);

/**
 * @swagger
 * /api/v1/nfts/mint:
 *   post:
 *     tags: [NFTs]
 *     summary: Mint new NFT
 *     description: Mint a new NFT for a property (admin only)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MintNFTRequest'
 *     responses:
 *       201:
 *         description: NFT minting initiated
 */
router.post('/mint',
  authenticate,
  requireKYC,
  userRateLimit(15 * 60 * 1000, 10), // 10 requests per 15 minutes
  validate(nftSchemas.mint),
  asyncHandler(nftController.mintNFT)
);

/**
 * @swagger
 * /api/v1/nfts/transfer:
 *   post:
 *     tags: [NFTs]
 *     summary: Transfer NFT
 *     description: Transfer NFT to another wallet
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TransferNFTRequest'
 *     responses:
 *       200:
 *         description: NFT transfer initiated
 */
router.post('/transfer',
  authenticate,
  requireKYC,
  userRateLimit(15 * 60 * 1000, 5), // 5 requests per 15 minutes
  validate(nftSchemas.transfer),
  asyncHandler(nftController.transferNFT)
);

/**
 * @swagger
 * /api/v1/nfts/stake:
 *   post:
 *     tags: [NFTs]
 *     summary: Stake NFTs
 *     description: Stake NFTs for additional benefits
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StakeNFTRequest'
 *     responses:
 *       200:
 *         description: NFTs staked successfully
 */
router.post('/stake',
  authenticate,
  requireKYC,
  validate(nftSchemas.stake),
  asyncHandler(nftController.stakeNFTs)
);

/**
 * @swagger
 * /api/v1/nfts/unstake:
 *   post:
 *     tags: [NFTs]
 *     summary: Unstake NFTs
 *     description: Unstake previously staked NFTs
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tokenIds
 *             properties:
 *               tokenIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: NFTs unstaked successfully
 */
router.post('/unstake',
  authenticate,
  requireKYC,
  validate({
    tokenIds: require('joi').array().items(require('joi').number().integer().positive()).min(1).required()
  }),
  asyncHandler(nftController.unstakeNFTs)
);

/**
 * @swagger
 * /api/v1/nfts/{tokenId}/metadata:
 *   get:
 *     tags: [NFTs]
 *     summary: Get NFT metadata
 *     description: Retrieve NFT metadata in standard format
 *     parameters:
 *       - in: path
 *         name: tokenId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: NFT metadata retrieved successfully
 */
router.get('/:tokenId/metadata',
  validate({ tokenId: require('joi').number().integer().positive().required() }, 'params'),
  asyncHandler(nftController.getNFTMetadata)
);

/**
 * @swagger
 * /api/v1/nfts/{tokenId}/history:
 *   get:
 *     tags: [NFTs]
 *     summary: Get NFT transaction history
 *     description: Retrieve transaction history for a specific NFT
 *     parameters:
 *       - in: path
 *         name: tokenId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: NFT history retrieved successfully
 */
router.get('/:tokenId/history',
  validate({ tokenId: require('joi').number().integer().positive().required() }, 'params'),
  asyncHandler(nftController.getNFTHistory)
);

/**
 * @swagger
 * /api/v1/nfts/portfolio/{walletAddress}:
 *   get:
 *     tags: [NFTs]
 *     summary: Get user NFT portfolio
 *     description: Retrieve all NFTs owned by a specific wallet address
 *     parameters:
 *       - in: path
 *         name: walletAddress
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User portfolio retrieved successfully
 */
router.get('/portfolio/:walletAddress',
  authenticate,
  validate({ walletAddress: require('joi').string().pattern(/^0x[a-fA-F0-9]{40}$/).required() }, 'params'),
  asyncHandler(nftController.getUserPortfolio)
);

export default router;