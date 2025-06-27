/**
 * Security Configuration for CoinEstate NFT Platform
 * Implements comprehensive security measures for Web3 and traditional web security
 */

// Content Security Policy Configuration
export const CSP_CONFIG = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Required for React - minimize usage
    "https://cdn.jsdelivr.net",
    "https://unpkg.com",
    "https://www.googletagmanager.com"
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Required for Tailwind CSS
    "https://fonts.googleapis.com"
  ],
  'font-src': [
    "'self'",
    "https://fonts.gstatic.com"
  ],
  'img-src': [
    "'self'",
    "data:",
    "https://images.unsplash.com",
    "https://api.coinestate.io",
    "https://assets.coinestate.io"
  ],
  'connect-src': [
    "'self'",
    "https://api.coinestate.io",
    "https://mainnet.infura.io",
    "https://eth-sepolia.g.alchemy.com",
    "https://eth-mainnet.g.alchemy.com",
    "wss://ws.coinestate.io",
    "https://www.google-analytics.com"
  ],
  'frame-src': ["'none'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"]
};

// Security Headers Configuration
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};

// Trusted Domains for Web3 Interactions
export const TRUSTED_DOMAINS = [
  'metamask.io',
  'walletconnect.org',
  'infura.io',
  'alchemy.com',
  'etherscan.io'
];

// Rate Limiting Configuration
export const RATE_LIMITS = {
  API_CALLS_PER_MINUTE: 60,
  WALLET_CONNECTIONS_PER_HOUR: 10,
  KYC_ATTEMPTS_PER_DAY: 3,
  LOGIN_ATTEMPTS_PER_HOUR: 5
};

// Security Constants
export const SECURITY_CONSTANTS = {
  CSRF_TOKEN_LENGTH: 32,
  SESSION_TIMEOUT_MS: 30 * 60 * 1000, // 30 minutes
  MAX_FILE_SIZE_MB: 10,
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'application/pdf'],
  PASSWORD_MIN_LENGTH: 12,
  WALLET_ADDRESS_REGEX: /^0x[a-fA-F0-9]{40}$/
};

// Generate CSP String
export const generateCSPString = () => {
  return Object.entries(CSP_CONFIG)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ');
};

// Check if environment is secure
export const isSecureContext = () => {
  return (
    window.location.protocol === 'https:' ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  );
};

// Environment-based security settings
export const getSecurityConfig = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    enableSecurityHeaders: process.env.REACT_APP_ENABLE_SECURITY_HEADERS === 'true',
    enableCSP: isProduction,
    enableHSTS: isProduction,
    debugMode: isDevelopment && process.env.REACT_APP_DEBUG_MODE === 'true',
    strictMode: isProduction
  };
};