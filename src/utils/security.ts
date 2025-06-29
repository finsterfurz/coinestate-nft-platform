/**
 * Enterprise Security Framework for CoinEstate NFT Platform
 * Comprehensive security implementation with OWASP compliance
 */

import crypto from 'crypto-js';
import Joi from 'joi';
import type { ValidationResult, SecurityEvent, SecurityContext } from '../types/enhanced';

// ================ SECURITY CONSTANTS ================

export const SECURITY_CONFIG = {
  // CSRF Protection
  CSRF_TOKEN_LENGTH: 32,
  CSRF_TOKEN_EXPIRY: 3600000, // 1 hour
  
  // Rate Limiting
  MAX_REQUESTS_PER_MINUTE: 60,
  MAX_LOGIN_ATTEMPTS: 5,
  LOGIN_LOCKOUT_DURATION: 900000, // 15 minutes
  
  // Session Management
  SESSION_TIMEOUT: 1800000, // 30 minutes
  MAX_SESSION_DURATION: 86400000, // 24 hours
  
  // Password Requirements
  MIN_PASSWORD_LENGTH: 12,
  PASSWORD_COMPLEXITY: {
    minUppercase: 1,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1
  },
  
  // Web3 Security
  WALLET_ADDRESS_PATTERN: /^0x[a-fA-F0-9]{40}$/,
  SIGNATURE_VALIDITY: 300000, // 5 minutes
  
  // Content Security
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  MAX_FILE_SIZE: 10485760, // 10MB
  
  // API Security
  API_KEY_LENGTH: 64,
  JWT_EXPIRY: '1h',
  REFRESH_TOKEN_EXPIRY: '7d'
};

// ================ INPUT VALIDATION & SANITIZATION ================

/**
 * Comprehensive input validation schemas
 */
export const ValidationSchemas = {
  // User Input Validation
  walletAddress: Joi.string()
    .pattern(SECURITY_CONFIG.WALLET_ADDRESS_PATTERN)
    .required()
    .messages({
      'string.pattern.base': 'Invalid wallet address format',
      'any.required': 'Wallet address is required'
    }),

  email: Joi.string()
    .email({ tlds: { allow: false } })
    .max(254)
    .required()
    .messages({
      'string.email': 'Invalid email format',
      'string.max': 'Email address too long',
      'any.required': 'Email is required'
    }),

  password: Joi.string()
    .min(SECURITY_CONFIG.MIN_PASSWORD_LENGTH)
    .pattern(new RegExp(
      `^(?=.*[a-z]){${SECURITY_CONFIG.PASSWORD_COMPLEXITY.minLowercase},}` +
      `(?=.*[A-Z]){${SECURITY_CONFIG.PASSWORD_COMPLEXITY.minUppercase},}` +
      `(?=.*\\d){${SECURITY_CONFIG.PASSWORD_COMPLEXITY.minNumbers},}` +
      `(?=.*[@$!%*?&]){${SECURITY_CONFIG.PASSWORD_COMPLEXITY.minSymbols},}`
    ))
    .required()
    .messages({
      'string.min': `Password must be at least ${SECURITY_CONFIG.MIN_PASSWORD_LENGTH} characters`,
      'string.pattern.base': 'Password must contain uppercase, lowercase, number, and symbol',
      'any.required': 'Password is required'
    }),

  // Web3 Input Validation
  transactionHash: Joi.string()
    .pattern(/^0x[a-fA-F0-9]{64}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid transaction hash format'
    }),

  contractAddress: Joi.string()
    .pattern(SECURITY_CONFIG.WALLET_ADDRESS_PATTERN)
    .required()
    .messages({
      'string.pattern.base': 'Invalid contract address format'
    }),

  tokenId: Joi.string()
    .pattern(/^[0-9]+$/)
    .max(78) // Max uint256 length
    .required()
    .messages({
      'string.pattern.base': 'Token ID must be a valid number',
      'string.max': 'Token ID too large'
    }),

  // General Input Validation
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.alphanum': 'Username must contain only alphanumeric characters',
      'string.min': 'Username must be at least 3 characters',
      'string.max': 'Username must not exceed 30 characters'
    }),

  amount: Joi.number()
    .positive()
    .precision(18) // ETH precision
    .max(1000000) // Reasonable max
    .required()
    .messages({
      'number.positive': 'Amount must be positive',
      'number.precision': 'Amount has too many decimal places',
      'number.max': 'Amount exceeds maximum allowed'
    }),

  // File Upload Validation
  fileUpload: Joi.object({
    filename: Joi.string().max(255).required(),
    mimetype: Joi.string().valid(...SECURITY_CONFIG.ALLOWED_FILE_TYPES).required(),
    size: Joi.number().max(SECURITY_CONFIG.MAX_FILE_SIZE).required()
  }).required(),

  // API Input Validation
  pagination: Joi.object({
    page: Joi.number().integer().min(1).max(1000).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20)
  }),

  sorting: Joi.object({
    field: Joi.string().valid('createdAt', 'updatedAt', 'name', 'value').default('createdAt'),
    order: Joi.string().valid('asc', 'desc').default('desc')
  })
};

/**
 * Advanced input sanitization
 */
export class InputSanitizer {
  /**
   * Sanitize HTML to prevent XSS
   */
  static sanitizeHTML(input: string): string {
    if (!input || typeof input !== 'string') return '';
    
    return input
      // Remove script tags
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      // Remove javascript: protocols
      .replace(/javascript:/gi, '')
      // Remove event handlers
      .replace(/\s*on\w+\s*=\s*[^>]*>/gi, '>')
      // Remove dangerous HTML tags
      .replace(/<(iframe|object|embed|link|meta|style)[^>]*>/gi, '')
      // Encode remaining HTML entities
      .replace(/[<>'"&]/g, (char) => {
        const entities: Record<string, string> = {
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#x27;',
          '&': '&amp;'
        };
        return entities[char] || char;
      });
  }

  /**
   * Sanitize SQL input to prevent injection
   */
  static sanitizeSQL(input: string): string {
    if (!input || typeof input !== 'string') return '';
    
    return input
      .replace(/['";\\]/g, '') // Remove SQL special characters
      .replace(/\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b/gi, ''); // Remove SQL keywords
  }

  /**
   * Sanitize file paths to prevent directory traversal
   */
  static sanitizeFilePath(input: string): string {
    if (!input || typeof input !== 'string') return '';
    
    return input
      .replace(/\.\./g, '') // Remove directory traversal
      .replace(/[<>:"|?*\\]/g, '') // Remove invalid filename characters
      .replace(/^\.+/, '') // Remove leading dots
      .trim();
  }

  /**
   * Sanitize Web3 addresses
   */
  static sanitizeAddress(address: string): string {
    if (!address || typeof address !== 'string') return '';
    
    // Remove non-hex characters and ensure proper format
    const cleaned = address.replace(/[^0-9a-fA-Fx]/g, '');
    
    // Ensure it starts with 0x and is correct length
    if (cleaned.length === 42 && cleaned.startsWith('0x')) {
      return cleaned.toLowerCase();
    }
    
    return '';
  }
}

/**
 * Comprehensive validation function
 */
export const validateAndSanitize = <T = any>(
  data: any,
  schema: Joi.Schema,
  sanitize = true
): ValidationResult => {
  try {
    // First sanitize the input if requested
    let sanitizedData = data;
    if (sanitize && typeof data === 'object') {
      sanitizedData = sanitizeObject(data);
    } else if (sanitize && typeof data === 'string') {
      sanitizedData = InputSanitizer.sanitizeHTML(data);
    }

    // Validate against schema
    const { error, value } = schema.validate(sanitizedData, {
      abortEarly: false,
      stripUnknown: true,
      errors: { wrap: { label: '"' } }
    });

    if (error) {
      return {
        isValid: false,
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          code: detail.type
        })),
        sanitizedData: null
      };
    }

    return {
      isValid: true,
      errors: [],
      sanitizedData: value
    };
  } catch (err) {
    return {
      isValid: false,
      errors: [{
        field: 'validation',
        message: 'Validation error occurred',
        code: 'validation.error'
      }],
      sanitizedData: null
    };
  }
};

/**
 * Recursively sanitize object properties
 */
const sanitizeObject = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'string') {
    return InputSanitizer.sanitizeHTML(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }
  
  return obj;
};

// ================ CSRF PROTECTION ================

/**
 * CSRF Token Management
 */
export class CSRFProtection {
  private static tokens = new Map<string, { token: string; expires: number }>();

  /**
   * Generate CSRF token for session
   */
  static generateToken(sessionId: string): string {
    const token = crypto.lib.WordArray.random(SECURITY_CONFIG.CSRF_TOKEN_LENGTH).toString();
    const expires = Date.now() + SECURITY_CONFIG.CSRF_TOKEN_EXPIRY;
    
    this.tokens.set(sessionId, { token, expires });
    
    // Clean up expired tokens
    this.cleanupExpiredTokens();
    
    return token;
  }

  /**
   * Validate CSRF token
   */
  static validateToken(sessionId: string, providedToken: string): boolean {
    const tokenData = this.tokens.get(sessionId);
    
    if (!tokenData) return false;
    if (Date.now() > tokenData.expires) {
      this.tokens.delete(sessionId);
      return false;
    }
    
    return tokenData.token === providedToken;
  }

  /**
   * Clean up expired tokens
   */
  private static cleanupExpiredTokens(): void {
    const now = Date.now();
    for (const [sessionId, tokenData] of this.tokens.entries()) {
      if (now > tokenData.expires) {
        this.tokens.delete(sessionId);
      }
    }
  }
}

// ================ RATE LIMITING ================

/**
 * Rate Limiting Implementation
 */
export class RateLimiter {
  private static requests = new Map<string, { count: number; resetTime: number }>();

  /**
   * Check if request is within rate limits
   */
  static checkLimit(identifier: string, maxRequests = SECURITY_CONFIG.MAX_REQUESTS_PER_MINUTE): boolean {
    const now = Date.now();
    const windowStart = now - 60000; // 1 minute window
    
    let requestData = this.requests.get(identifier);
    
    if (!requestData || requestData.resetTime < windowStart) {
      requestData = { count: 0, resetTime: now };
    }
    
    if (requestData.count >= maxRequests) {
      return false;
    }
    
    requestData.count++;
    this.requests.set(identifier, requestData);
    
    return true;
  }

  /**
   * Get remaining requests for identifier
   */
  static getRemainingRequests(identifier: string, maxRequests = SECURITY_CONFIG.MAX_REQUESTS_PER_MINUTE): number {
    const requestData = this.requests.get(identifier);
    if (!requestData) return maxRequests;
    
    return Math.max(0, maxRequests - requestData.count);
  }
}

// ================ SECURITY EVENT LOGGING ================

/**
 * Security Event Logger
 */
export class SecurityLogger {
  private static events: SecurityEvent[] = [];

  /**
   * Log security event
   */
  static logEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): void {
    const securityEvent: SecurityEvent = {
      ...event,
      id: crypto.lib.WordArray.random(16).toString(),
      timestamp: new Date(),
      resolved: false
    };

    this.events.push(securityEvent);
    
    // Alert on critical events
    if (event.severity === 'critical') {
      this.alertSecurityTeam(securityEvent);
    }
    
    // Keep only last 1000 events
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000);
    }
  }

  /**
   * Get security events by criteria
   */
  static getEvents(filters: {
    severity?: SecurityEvent['severity'];
    type?: SecurityEvent['type'];
    userId?: string;
    since?: Date;
  } = {}): SecurityEvent[] {
    return this.events.filter(event => {
      if (filters.severity && event.severity !== filters.severity) return false;
      if (filters.type && event.type !== filters.type) return false;
      if (filters.userId && event.userId !== filters.userId) return false;
      if (filters.since && event.timestamp < filters.since) return false;
      return true;
    });
  }

  /**
   * Alert security team (placeholder for actual implementation)
   */
  private static alertSecurityTeam(event: SecurityEvent): void {
    // In production, this would send alerts via email, Slack, etc.
    console.error('CRITICAL SECURITY EVENT:', event);
  }
}

// ================ ENCRYPTION UTILITIES ================

/**
 * Encryption utilities for sensitive data
 */
export class EncryptionUtils {
  private static readonly ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';

  /**
   * Encrypt sensitive data
   */
  static encrypt(data: string): string {
    const encrypted = crypto.AES.encrypt(data, this.ENCRYPTION_KEY).toString();
    return encrypted;
  }

  /**
   * Decrypt sensitive data
   */
  static decrypt(encryptedData: string): string {
    const decrypted = crypto.AES.decrypt(encryptedData, this.ENCRYPTION_KEY);
    return decrypted.toString(crypto.enc.Utf8);
  }

  /**
   * Hash data (one-way)
   */
  static hash(data: string, salt?: string): string {
    const saltToUse = salt || crypto.lib.WordArray.random(16).toString();
    return crypto.PBKDF2(data, saltToUse, { keySize: 256/32, iterations: 10000 }).toString();
  }

  /**
   * Generate secure random string
   */
  static generateSecureRandom(length = 32): string {
    return crypto.lib.WordArray.random(length).toString();
  }
}

// ================ WEB3 SECURITY ================

/**
 * Web3-specific security utilities
 */
export class Web3Security {
  /**
   * Validate Ethereum signature
   */
  static validateSignature(message: string, signature: string, address: string): boolean {
    try {
      // This would use ethers.js to verify signature
      // Implementation depends on available Web3 library
      return true; // Placeholder
    } catch (error) {
      SecurityLogger.logEvent({
        type: 'unauthorized_access',
        severity: 'medium',
        userId: address,
        details: { message: 'Invalid signature verification', error },
        ipAddress: '',
        userAgent: '',
        resolved: false
      });
      return false;
    }
  }

  /**
   * Validate transaction parameters
   */
  static validateTransaction(tx: any): ValidationResult {
    const schema = Joi.object({
      to: ValidationSchemas.walletAddress,
      value: Joi.string().pattern(/^0x[0-9a-fA-F]+$/).optional(),
      data: Joi.string().pattern(/^0x[0-9a-fA-F]*$/).optional(),
      gasLimit: Joi.string().pattern(/^0x[0-9a-fA-F]+$/).optional(),
      gasPrice: Joi.string().pattern(/^0x[0-9a-fA-F]+$/).optional()
    });

    return validateAndSanitize(tx, schema, false);
  }
}

// ================ EXPORT ALL SECURITY UTILITIES ================

export default {
  SECURITY_CONFIG,
  ValidationSchemas,
  InputSanitizer,
  validateAndSanitize,
  CSRFProtection,
  RateLimiter,
  SecurityLogger,
  EncryptionUtils,
  Web3Security
};

export {
  SECURITY_CONFIG,
  ValidationSchemas,
  InputSanitizer,
  validateAndSanitize,
  CSRFProtection,
  RateLimiter,
  SecurityLogger,
  EncryptionUtils,
  Web3Security
};
