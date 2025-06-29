/**
 * CoinEstate Backend - Authentication Controller
 * Handles wallet-based authentication and user management
 */

import { ethers } from 'ethers';
import { database } from '../database/connection.js';
import { redis } from '../services/redis.js';
import { queueService } from '../services/queue.js';
import logger from '../utils/logger.js';
import {
  generateToken,
  generateRefreshToken,
  generateNonce,
  storeNonce,
  verifyNonce,
  verifyWalletSignature,
  logout as logoutToken,
  refreshAccessToken
} from '../middleware/auth.js';
import {
  recordFailedLogin,
  clearLoginAttempts
} from '../middleware/security.js';
import {
  AuthenticationError,
  ValidationError,
  ConflictError,
  NotFoundError
} from '../middleware/errorHandler.js';

/**
 * Generate authentication nonce
 */
export const generateNonce = async (req, res) => {
  const { walletAddress } = req.body;
  
  try {
    // Generate nonce
    const nonce = generateNonce();
    
    // Store nonce with 5-minute expiration
    await storeNonce(walletAddress, nonce, 300);
    
    // Create message for signing
    const message = `Welcome to CoinEstate NFT Platform!\n\nSign this message to authenticate with your wallet.\n\nWallet: ${walletAddress}\nNonce: ${nonce}\nTimestamp: ${new Date().toISOString()}`;
    
    logger.info('Authentication nonce generated', {
      walletAddress,
      nonce: nonce.substring(0, 8) + '...'
    });
    
    res.json({
      success: true,
      data: {
        nonce,
        message,
        expiresAt: new Date(Date.now() + 300000).toISOString() // 5 minutes
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Nonce generation failed:', error);
    throw new AuthenticationError('Failed to generate authentication nonce');
  }
};

/**
 * User login with wallet signature
 */
export const login = async (req, res) => {
  const { walletAddress, signature, message, nonce } = req.body;
  
  try {
    // Verify nonce
    const isValidNonce = await verifyNonce(walletAddress, nonce);
    if (!isValidNonce) {
      await recordFailedLogin(walletAddress);
      throw new AuthenticationError('Invalid or expired nonce');
    }
    
    // Verify wallet signature
    const isValidSignature = verifyWalletSignature(walletAddress, message, signature);
    if (!isValidSignature) {
      await recordFailedLogin(walletAddress);
      throw new AuthenticationError('Invalid wallet signature');
    }
    
    // Get or create user
    let user = await getUserByWalletAddress(walletAddress);
    
    if (!user) {
      // Auto-register user on first login
      user = await createUser(walletAddress);
      
      // Send welcome email if email is provided
      if (user.email) {
        await queueService.addJob('email', 'send-welcome', {
          userId: user.id,
          email: user.email,
          walletAddress: user.wallet_address
        });
      }
    }
    
    // Check if user is active
    if (!user.is_active) {
      throw new AuthenticationError('Account is deactivated');
    }
    
    // Generate tokens
    const accessToken = generateToken({
      userId: user.id,
      walletAddress: user.wallet_address
    });
    
    const refreshToken = generateRefreshToken({
      userId: user.id,
      walletAddress: user.wallet_address
    });
    
    // Clear failed login attempts
    await clearLoginAttempts(walletAddress);
    
    // Update last login
    await database.query(
      'UPDATE users SET last_login_at = NOW(), last_ip = $1 WHERE id = $2',
      [req.ip, user.id]
    );
    
    // Store refresh token in Redis
    await redis.setex(`refresh_token:${user.id}`, 7 * 24 * 60 * 60, refreshToken);
    
    logger.audit('login', 'user', user.wallet_address, {
      userId: user.id,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    res.json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        expiresIn: '24h',
        user: {
          id: user.id,
          walletAddress: user.wallet_address,
          email: user.email,
          kycStatus: user.kyc_status,
          isActive: user.is_active,
          isVerified: user.is_verified,
          nftCount: user.nft_count,
          joinedAt: user.created_at
        }
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error;
    }
    logger.error('Login failed:', error);
    throw new AuthenticationError('Login failed');
  }
};

/**
 * User registration
 */
export const register = async (req, res) => {
  const { walletAddress, email, signature, message, nonce } = req.body;
  
  try {
    // Verify nonce
    const isValidNonce = await verifyNonce(walletAddress, nonce);
    if (!isValidNonce) {
      throw new AuthenticationError('Invalid or expired nonce');
    }
    
    // Verify wallet signature
    const isValidSignature = verifyWalletSignature(walletAddress, message, signature);
    if (!isValidSignature) {
      throw new AuthenticationError('Invalid wallet signature');
    }
    
    // Check if user already exists
    const existingUser = await getUserByWalletAddress(walletAddress);
    if (existingUser) {
      throw new ConflictError('User already registered with this wallet address');
    }
    
    // Check email uniqueness if provided
    if (email) {
      const emailExists = await database.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );
      if (emailExists.rows.length > 0) {
        throw new ConflictError('Email address already registered');
      }
    }
    
    // Create user
    const user = await createUser(walletAddress, email);
    
    // Send welcome email
    if (email) {
      await queueService.addJob('email', 'send-welcome', {
        userId: user.id,
        email: user.email,
        walletAddress: user.wallet_address
      });
    }
    
    logger.audit('register', 'user', walletAddress, {
      userId: user.id,
      email: email || null,
      ip: req.ip
    });
    
    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          walletAddress: user.wallet_address,
          email: user.email,
          kycStatus: user.kyc_status,
          isActive: user.is_active,
          isVerified: user.is_verified,
          joinedAt: user.created_at
        }
      },
      message: 'User registered successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    if (error instanceof AuthenticationError || error instanceof ConflictError) {
      throw error;
    }
    logger.error('Registration failed:', error);
    throw new ValidationError('Registration failed');
  }
};

/**
 * Refresh access token
 */
export const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  
  try {
    const tokenData = await refreshAccessToken(refreshToken);
    
    res.json({
      success: true,
      data: tokenData,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Token refresh failed:', error);
    throw new AuthenticationError('Invalid refresh token');
  }
};

/**
 * Logout user
 */
export const logout = async (req, res) => {
  try {
    // Blacklist token
    await logoutToken(req.token, req.user.id);
    
    // Remove refresh token
    await redis.del(`refresh_token:${req.user.id}`);
    
    logger.audit('logout', 'user', req.user.walletAddress, {
      userId: req.user.id,
      ip: req.ip
    });
    
    res.json({
      success: true,
      message: 'Logged out successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Logout failed:', error);
    throw new AuthenticationError('Logout failed');
  }
};

/**
 * Verify token
 */
export const verifyToken = async (req, res) => {
  res.json({
    success: true,
    data: {
      valid: true,
      user: {
        id: req.user.id,
        walletAddress: req.user.walletAddress,
        email: req.user.email,
        kycStatus: req.user.kycStatus,
        isActive: req.user.isActive,
        isVerified: req.user.isVerified
      }
    },
    timestamp: new Date().toISOString()
  });
};

/**
 * Get current user
 */
export const getCurrentUser = async (req, res) => {
  try {
    const user = await getUserById(req.user.id);
    
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    res.json({
      success: true,
      data: {
        id: user.id,
        walletAddress: user.wallet_address,
        email: user.email,
        kycStatus: user.kyc_status,
        isActive: user.is_active,
        isVerified: user.is_verified,
        nftCount: user.nft_count,
        lastLoginAt: user.last_login_at,
        joinedAt: user.created_at,
        profile: user.profile
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Get current user failed:', error);
    throw error;
  }
};

/**
 * Change password (for email-based auth)
 */
export const changePassword = async (req, res) => {
  // This would be implemented if email/password auth is supported
  throw new ValidationError('Password authentication not supported');
};

/**
 * Forgot password
 */
export const forgotPassword = async (req, res) => {
  // This would be implemented if email/password auth is supported
  throw new ValidationError('Password authentication not supported');
};

/**
 * Reset password
 */
export const resetPassword = async (req, res) => {
  // This would be implemented if email/password auth is supported
  throw new ValidationError('Password authentication not supported');
};

/**
 * Helper functions
 */

/**
 * Get user by wallet address
 */
const getUserByWalletAddress = async (walletAddress) => {
  try {
    const result = await database.query(`
      SELECT 
        u.*,
        up.first_name,
        up.last_name,
        up.phone,
        up.country_code,
        up.avatar_url,
        up.bio,
        up.preferences
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.wallet_address = $1
    `, [walletAddress.toLowerCase()]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const user = result.rows[0];
    user.profile = {
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      countryCode: user.country_code,
      avatarUrl: user.avatar_url,
      bio: user.bio,
      preferences: user.preferences || {}
    };
    
    return user;
  } catch (error) {
    logger.error('Get user by wallet address failed:', error);
    throw error;
  }
};

/**
 * Get user by ID
 */
const getUserById = async (userId) => {
  try {
    const result = await database.query(`
      SELECT 
        u.*,
        up.first_name,
        up.last_name,
        up.phone,
        up.country_code,
        up.avatar_url,
        up.bio,
        up.preferences
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.id = $1
    `, [userId]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const user = result.rows[0];
    user.profile = {
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      countryCode: user.country_code,
      avatarUrl: user.avatar_url,
      bio: user.bio,
      preferences: user.preferences || {}
    };
    
    return user;
  } catch (error) {
    logger.error('Get user by ID failed:', error);
    throw error;
  }
};

/**
 * Create new user
 */
const createUser = async (walletAddress, email = null) => {
  try {
    const result = await database.query(`
      INSERT INTO users (wallet_address, email)
      VALUES ($1, $2)
      RETURNING *
    `, [walletAddress.toLowerCase(), email]);
    
    const user = result.rows[0];
    
    // Create user profile
    await database.query(`
      INSERT INTO user_profiles (user_id)
      VALUES ($1)
    `, [user.id]);
    
    logger.info('User created', {
      userId: user.id,
      walletAddress: user.wallet_address,
      email: user.email
    });
    
    return user;
  } catch (error) {
    logger.error('Create user failed:', error);
    throw error;
  }
};

export default {
  generateNonce,
  login,
  register,
  refreshToken,
  logout,
  verifyToken,
  getCurrentUser,
  changePassword,
  forgotPassword,
  resetPassword
};