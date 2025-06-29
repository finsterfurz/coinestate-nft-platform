/**
 * Input Validation and Sanitization Utilities
 * Comprehensive validation for Web3 and traditional inputs
 */

import Joi from 'joi';
import CryptoJS from 'crypto-js';
import { SECURITY_CONSTANTS } from '../config/security';

// ================ TYPE DEFINITIONS ================

export interface ValidationResult<T = any> {
  isValid: boolean;
  value: T | null;
  error: string | null;
}

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface KYCData {
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  nationality: string;
  documentType: 'passport' | 'drivers_license' | 'national_id';
  documentNumber: string;
}

export interface TransactionData {
  to: string;
  value: string;
  gasLimit?: number;
  gasPrice?: string;
}

export interface NFTAttribute {
  trait_type: string;
  value: string | number;
}

export interface NFTMetadata {
  name: string;
  description?: string;
  image: string;
  attributes?: NFTAttribute[];
}

export interface RateLimitConfig {
  limit: number;
  windowMs: number;
}

// ================ VALIDATION SCHEMAS ================

// Ethereum Wallet Address Validation
export const walletAddressSchema = Joi.string()
  .pattern(SECURITY_CONSTANTS.WALLET_ADDRESS_REGEX)
  .required()
  .messages({
    'string.pattern.base': 'Invalid Ethereum wallet address format',
    'string.empty': 'Wallet address is required'
  });

// Email Validation
export const emailSchema = Joi.string()
  .email({ tlds: { allow: false } })
  .max(254)
  .required()
  .messages({
    'string.email': 'Please enter a valid email address',
    'string.max': 'Email address is too long'
  });

// KYC Data Validation
export const kycDataSchema = Joi.object<KYCData>({
  firstName: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-ZÀ-ÿ\s'-]+$/)
    .required()
    .messages({
      'string.pattern.base': 'First name can only contain letters, spaces, hyphens, and apostrophes'
    }),
  
  lastName: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-ZÀ-ÿ\s'-]+$/)
    .required(),
  
  dateOfBirth: Joi.date()
    .max('now')
    .min('1900-01-01')
    .required()
    .messages({
      'date.max': 'Date of birth cannot be in the future',
      'date.min': 'Invalid date of birth'
    }),
  
  nationality: Joi.string()
    .length(2)
    .pattern(/^[A-Z]{2}$/)
    .required()
    .messages({
      'string.pattern.base': 'Nationality must be a valid 2-letter ISO country code'
    }),
  
  documentType: Joi.string()
    .valid('passport', 'drivers_license', 'national_id')
    .required(),
  
  documentNumber: Joi.string()
    .min(5)
    .max(20)
    .pattern(/^[A-Z0-9]+$/i)
    .required()
    .messages({
      'string.pattern.base': 'Document number can only contain letters and numbers'
    })
});

// Transaction Validation
export const transactionSchema = Joi.object<TransactionData>({
  to: walletAddressSchema,
  value: Joi.string()
    .pattern(/^\d+(\.\d{1,18})?$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid ETH amount format'
    }),
  gasLimit: Joi.number()
    .integer()
    .min(21000)
    .max(10000000)
    .optional(),
  gasPrice: Joi.string()
    .pattern(/^\d+$/)
    .optional()
});

// NFT Metadata Validation
export const nftMetadataSchema = Joi.object<NFTMetadata>({
  name: Joi.string().min(1).max(100).required(),
  description: Joi.string().max(1000).optional(),
  image: Joi.string().uri().required(),
  attributes: Joi.array().items(
    Joi.object<NFTAttribute>({
      trait_type: Joi.string().required(),
      value: Joi.alternatives().try(
        Joi.string(),
        Joi.number()
      ).required()
    })
  ).optional()
});

// ================ SANITIZATION FUNCTIONS ================

/**
 * Comprehensive input sanitization
 * Removes potential XSS vectors and dangerous characters
 */
export const sanitizeInput = (input: unknown): unknown => {
  if (typeof input !== 'string') return input;
  
  return input
    // Remove script tags
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove javascript: protocol
    .replace(/javascript:/gi, '')
    // Remove event handlers
    .replace(/on\w+\s*=/gi, '')
    // Remove data: protocol (except images)
    .replace(/data:(?!image\/(png|jpg|jpeg|gif|svg))/gi, '')
    // Trim whitespace
    .trim();
};

/**
 * Sanitize HTML content (for rich text)
 */
export const sanitizeHTML = (html: string): string => {
  const allowedTags = ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'ul', 'ol', 'li'];
  const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/gi;
  
  return html.replace(tagRegex, (match, tag) => {
    return allowedTags.includes(tag.toLowerCase()) ? match : '';
  });
};

/**
 * Sanitize file names
 */
export const sanitizeFileName = (fileName: string): string => {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 255);
};

// ================ VALIDATION HELPERS ================

/**
 * Validate and sanitize input with schema
 */
export const validateAndSanitize = <T>(
  input: unknown, 
  schema: Joi.Schema<T>
): ValidationResult<T> => {
  try {
    // Sanitize first
    const sanitized = typeof input === 'object' && input !== null
      ? sanitizeObject(input)
      : sanitizeInput(input);
    
    // Then validate
    const { error, value } = schema.validate(sanitized, {
      abortEarly: false,
      stripUnknown: true
    });
    
    if (error) {
      const errorMessages = error.details.map(detail => detail.message);
      throw new Error(errorMessages.join(', '));
    }
    
    return { isValid: true, value, error: null };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Validation failed';
    return { isValid: false, value: null, error: errorMessage };
  }
};

/**
 * Sanitize object properties recursively
 */
const sanitizeObject = (obj: Record<string, unknown>): Record<string, unknown> => {
  if (typeof obj !== 'object' || obj === null) return obj;
  
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const sanitizedKey = sanitizeInput(key) as string;
    sanitized[sanitizedKey] = typeof value === 'object' && value !== null
      ? sanitizeObject(value as Record<string, unknown>)
      : sanitizeInput(value);
  }
  return sanitized;
};

// ================ CRYPTO UTILITIES ================

/**
 * Generate secure random token
 */
export const generateSecureToken = (length: number = SECURITY_CONSTANTS.CSRF_TOKEN_LENGTH): string => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Generate CSRF token
 */
export const generateCSRFToken = (): string => {
  return generateSecureToken(SECURITY_CONSTANTS.CSRF_TOKEN_LENGTH);
};

/**
 * Hash sensitive data (for client-side hashing only)
 */
export const hashData = (data: string, salt: string = ''): string => {
  return CryptoJS.SHA256(data + salt).toString();
};

/**
 * Validate CSRF token
 */
export const validateCSRFToken = (token: string | null, storedToken: string | null): boolean => {
  return Boolean(token && storedToken && token === storedToken);
};

// ================ WEB3 SPECIFIC VALIDATION ================

/**
 * Validate Ethereum address checksum
 */
export const validateAddressChecksum = (address: string): boolean => {
  if (!SECURITY_CONSTANTS.WALLET_ADDRESS_REGEX.test(address)) {
    return false;
  }
  
  // Basic checksum validation (simplified)
  const lowerCaseAddress = address.toLowerCase();
  const hash = hashData(lowerCaseAddress.substring(2));
  
  for (let i = 0; i < 40; i++) {
    const char = address[i + 2];
    const shouldBeUppercase = parseInt(hash[i], 16) >= 8;
    
    if (char !== char.toLowerCase() && !shouldBeUppercase) {
      return false;
    }
    if (char !== char.toUpperCase() && shouldBeUppercase) {
      return false;
    }
  }
  
  return true;
};

/**
 * Validate smart contract address
 */
export const validateContractAddress = async (
  address: string, 
  provider: { getCode: (address: string) => Promise<string> }
): Promise<boolean> => {
  try {
    if (!validateAddressChecksum(address)) {
      return false;
    }
    
    // Check if address has contract code
    const code = await provider.getCode(address);
    return code !== '0x';
  } catch (error) {
    console.error('Contract validation error:', error);
    return false;
  }
};

/**
 * Validate transaction parameters
 */
export const validateTransaction = (tx: unknown): ValidationResult<TransactionData> => {
  const result = validateAndSanitize(tx, transactionSchema);
  
  if (!result.isValid || !result.value) {
    return result;
  }
  
  // Additional business logic validation
  const { value, gasLimit } = result.value;
  
  // Check for reasonable gas limits
  if (gasLimit && (gasLimit < 21000 || gasLimit > 5000000)) {
    return {
      isValid: false,
      value: null,
      error: 'Gas limit out of reasonable range'
    };
  }
  
  // Check for reasonable transaction value
  const ethValue = parseFloat(value);
  if (ethValue < 0 || ethValue > 1000) {
    return {
      isValid: false,
      value: null,
      error: 'Transaction value out of reasonable range'
    };
  }
  
  return result;
};

// ================ RATE LIMITING ================

class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  
  isAllowed(key: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!this.attempts.has(key)) {
      this.attempts.set(key, []);
    }
    
    const attempts = this.attempts.get(key)!;
    
    // Remove old attempts outside the window
    const recentAttempts = attempts.filter(time => time > windowStart);
    this.attempts.set(key, recentAttempts);
    
    if (recentAttempts.length >= limit) {
      return false;
    }
    
    // Record this attempt
    recentAttempts.push(now);
    return true;
  }
  
  reset(key: string): void {
    this.attempts.delete(key);
  }
}

export const rateLimiter = new RateLimiter();

// ================ FILE VALIDATION ================

/**
 * Validate uploaded file
 */
export const validateFile = (file: File): FileValidationResult => {
  const errors: string[] = [];
  
  // Check file size
  if (file.size > SECURITY_CONSTANTS.MAX_FILE_SIZE_MB * 1024 * 1024) {
    errors.push(`File size exceeds ${SECURITY_CONSTANTS.MAX_FILE_SIZE_MB}MB limit`);
  }
  
  // Check file type
  if (!SECURITY_CONSTANTS.ALLOWED_FILE_TYPES.includes(file.type)) {
    errors.push('File type not allowed');
  }
  
  // Check file name
  if (file.name.length > 255) {
    errors.push('File name too long');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// ================ EXPORT ALL ================

export default {
  // Schemas
  walletAddressSchema,
  emailSchema,
  kycDataSchema,
  transactionSchema,
  nftMetadataSchema,
  
  // Sanitization
  sanitizeInput,
  sanitizeHTML,
  sanitizeFileName,
  
  // Validation
  validateAndSanitize,
  validateAddressChecksum,
  validateContractAddress,
  validateTransaction,
  validateFile,
  
  // Security
  generateSecureToken,
  generateCSRFToken,
  validateCSRFToken,
  hashData,
  
  // Rate limiting
  rateLimiter
};
