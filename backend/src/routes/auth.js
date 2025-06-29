/**
 * CoinEstate Backend - Authentication Routes
 * Wallet-based authentication with JWT tokens
 */

import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validate } from '../utils/validation.js';
import { userSchemas } from '../utils/validation.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { loginAttemptTracker } from '../middleware/security.js';
import * as authController from '../controllers/authController.js';

const router = express.Router();

/**
 * @swagger
 * /api/v1/auth/nonce:
 *   post:
 *     tags: [Authentication]
 *     summary: Request authentication nonce
 *     description: Get a nonce for wallet signature verification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - walletAddress
 *             properties:
 *               walletAddress:
 *                 type: string
 *                 example: "0x742d35Cc6634C0532925a3b8D52c18D11F8a30a7"
 *     responses:
 *       200:
 *         description: Nonce generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     nonce:
 *                       type: string
 *                     message:
 *                       type: string
 *                     expiresAt:
 *                       type: string
 */
router.post('/nonce',
  validate({
    walletAddress: userSchemas.register.extract('walletAddress')
  }),
  asyncHandler(authController.generateNonce)
);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Login with wallet signature
 *     description: Authenticate using wallet signature verification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *                     expiresIn:
 *                       type: string
 *                     user:
 *                       $ref: '#/components/schemas/User'
 */
router.post('/login',
  loginAttemptTracker,
  validate(userSchemas.login),
  asyncHandler(authController.login)
);

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Register new user
 *     description: Register a new user with wallet signature
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User registered successfully
 */
router.post('/register',
  validate(userSchemas.register),
  asyncHandler(authController.register)
);

/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     tags: [Authentication]
 *     summary: Refresh access token
 *     description: Get new access token using refresh token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 */
router.post('/refresh',
  validate({
    refreshToken: require('joi').string().required()
  }),
  asyncHandler(authController.refreshToken)
);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     tags: [Authentication]
 *     summary: Logout user
 *     description: Invalidate access token and clear session
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post('/logout',
  authenticate,
  asyncHandler(authController.logout)
);

/**
 * @swagger
 * /api/v1/auth/verify:
 *   get:
 *     tags: [Authentication]
 *     summary: Verify token
 *     description: Verify if current access token is valid
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Token is valid
 */
router.get('/verify',
  authenticate,
  asyncHandler(authController.verifyToken)
);

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     tags: [Authentication]
 *     summary: Get current user
 *     description: Get current authenticated user information
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 */
router.get('/me',
  authenticate,
  asyncHandler(authController.getCurrentUser)
);

/**
 * @swagger
 * /api/v1/auth/change-password:
 *   post:
 *     tags: [Authentication]
 *     summary: Change password (if email auth enabled)
 *     description: Change user password for email-based authentication
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Password changed successfully
 */
router.post('/change-password',
  authenticate,
  validate({
    currentPassword: require('joi').string().required(),
    newPassword: require('joi').string().min(8).required()
  }),
  asyncHandler(authController.changePassword)
);

/**
 * @swagger
 * /api/v1/auth/forgot-password:
 *   post:
 *     tags: [Authentication]
 *     summary: Request password reset
 *     description: Send password reset link to user email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Password reset email sent
 */
router.post('/forgot-password',
  validate({
    email: require('joi').string().email().required()
  }),
  asyncHandler(authController.forgotPassword)
);

/**
 * @swagger
 * /api/v1/auth/reset-password:
 *   post:
 *     tags: [Authentication]
 *     summary: Reset password
 *     description: Reset password using reset token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Password reset successfully
 */
router.post('/reset-password',
  validate({
    token: require('joi').string().required(),
    newPassword: require('joi').string().min(8).required()
  }),
  asyncHandler(authController.resetPassword)
);

export default router;