/**
 * CoinEstate Backend - Configuration Management
 * Centralized configuration with environment validation
 */

import dotenv from 'dotenv';
import Joi from 'joi';
import logger from '../utils/logger.js';

// Load environment variables
dotenv.config();

/**
 * Environment variables validation schema
 */
const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().port().default(5000),
  API_VERSION: Joi.string().default('v1'),
  SERVER_HOST: Joi.string().default('localhost'),
  CORS_ORIGIN: Joi.string().default('http://localhost:3000'),
  
  // Database
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().port().default(5432),
  DB_NAME: Joi.string().required(),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_MAX_CONNECTIONS: Joi.number().default(20),
  DB_SSL: Joi.boolean().default(false),
  
  // Redis
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().port().default(6379),
  REDIS_PASSWORD: Joi.string().allow('').default(''),
  REDIS_DB: Joi.number().default(0),
  REDIS_TTL: Joi.number().default(3600),
  
  // JWT
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRE: Joi.string().default('24h'),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_EXPIRE: Joi.string().default('7d'),
  
  // Security
  ENCRYPTION_KEY: Joi.string().length(32).required(),
  CSRF_SECRET: Joi.string().required(),
  SESSION_SECRET: Joi.string().required(),
  BCRYPT_ROUNDS: Joi.number().default(12),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: Joi.number().default(900000),
  RATE_LIMIT_MAX_REQUESTS: Joi.number().default(100),
  RATE_LIMIT_SKIP_SUCCESS: Joi.boolean().default(true),
  
  // Blockchain
  ETHEREUM_NETWORK: Joi.string().default('goerli'),
  INFURA_PROJECT_ID: Joi.string().required(),
  ALCHEMY_API_KEY: Joi.string().required(),
  CONTRACT_ADDRESS_NFT: Joi.string().required(),
  CONTRACT_ADDRESS_GOVERNANCE: Joi.string().required(),
  PRIVATE_KEY_OPERATOR: Joi.string().required(),
  GAS_LIMIT_DEFAULT: Joi.number().default(500000),
  GAS_PRICE_MULTIPLIER: Joi.number().default(1.2),
  
  // IPFS
  IPFS_API_URL: Joi.string().uri().default('https://api.pinata.cloud'),
  PINATA_API_KEY: Joi.string().required(),
  PINATA_SECRET_KEY: Joi.string().required(),
  IPFS_GATEWAY_URL: Joi.string().uri().default('https://gateway.pinata.cloud'),
  
  // Email
  SMTP_HOST: Joi.string().default('smtp.gmail.com'),
  SMTP_PORT: Joi.number().default(587),
  SMTP_SECURE: Joi.boolean().default(false),
  SMTP_USER: Joi.string().email().required(),
  SMTP_PASS: Joi.string().required(),
  FROM_EMAIL: Joi.string().email().required(),
  FROM_NAME: Joi.string().default('CoinEstate Platform'),
  
  // KYC
  KYC_PROVIDER: Joi.string().default('jumio'),
  KYC_API_URL: Joi.string().uri().required(),
  KYC_API_KEY: Joi.string().required(),
  KYC_API_SECRET: Joi.string().required(),
  KYC_WEBHOOK_SECRET: Joi.string().required(),
  
  // File Upload
  FILE_UPLOAD_MAX_SIZE: Joi.number().default(10485760),
  FILE_UPLOAD_ALLOWED_TYPES: Joi.string().default('image/jpeg,image/png,image/webp,application/pdf'),
  UPLOAD_PATH: Joi.string().default('uploads'),
  S3_BUCKET_NAME: Joi.string(),
  AWS_ACCESS_KEY_ID: Joi.string(),
  AWS_SECRET_ACCESS_KEY: Joi.string(),
  AWS_REGION: Joi.string().default('us-east-1'),
  
  // Monitoring
  SENTRY_DSN: Joi.string().uri(),
  MIXPANEL_TOKEN: Joi.string(),
  GOOGLE_ANALYTICS_ID: Joi.string(),
  
  // Logging
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug').default('info'),
  LOG_FILE_ENABLED: Joi.boolean().default(true),
  LOG_FILE_PATH: Joi.string().default('logs/app.log'),
  LOG_MAX_SIZE: Joi.string().default('20m'),
  LOG_MAX_FILES: Joi.string().default('14d'),
  
  // Security Headers
  CSP_POLICY: Joi.string(),
  HSTS_MAX_AGE: Joi.number().default(31536000),
  HSTS_INCLUDE_SUBDOMAINS: Joi.boolean().default(true),
  HSTS_PRELOAD: Joi.boolean().default(true),
  
  // API Keys
  COINGECKO_API_KEY: Joi.string(),
  MORTGAGE_API_KEY: Joi.string(),
  PROPERTY_DATA_API_KEY: Joi.string(),
  
  // Queue
  QUEUE_REDIS_URL: Joi.string().default('redis://localhost:6379'),
  QUEUE_DASHBOARD_PORT: Joi.number().default(5001),
  QUEUE_CONCURRENCY: Joi.number().default(5),
  
  // Development
  DEBUG_MODE: Joi.boolean().default(false),
  API_DOCS_ENABLED: Joi.boolean().default(false),
  SEED_DATABASE: Joi.boolean().default(false),
  MOCK_BLOCKCHAIN: Joi.boolean().default(false),
  MOCK_KYC: Joi.boolean().default(false),
  MOCK_EMAIL: Joi.boolean().default(false)
}).unknown();

/**
 * Validate and process environment variables
 */
const { error, value: env } = envSchema.validate(process.env);

if (error) {
  logger.error(`❌ Config validation error: ${error.message}`);
  process.exit(1);
}

/**
 * Application configuration object
 */
export const config = {
  // App settings
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  host: env.SERVER_HOST,
  apiVersion: env.API_VERSION,
  corsOrigin: env.CORS_ORIGIN,
  
  // Database configuration
  database: {
    host: env.DB_HOST,
    port: env.DB_PORT,
    name: env.DB_NAME,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    maxConnections: env.DB_MAX_CONNECTIONS,
    ssl: env.DB_SSL,
    connectionString: `postgresql://${env.DB_USER}:${env.DB_PASSWORD}@${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}${env.DB_SSL ? '?sslmode=require' : ''}`
  },
  
  // Redis configuration
  redis: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD || undefined,
    db: env.REDIS_DB,
    ttl: env.REDIS_TTL,
    url: `redis://${env.REDIS_PASSWORD ? `:${env.REDIS_PASSWORD}@` : ''}${env.REDIS_HOST}:${env.REDIS_PORT}/${env.REDIS_DB}`
  },
  
  // JWT configuration
  jwt: {
    secret: env.JWT_SECRET,
    expire: env.JWT_EXPIRE,
    refreshSecret: env.JWT_REFRESH_SECRET,
    refreshExpire: env.JWT_REFRESH_EXPIRE
  },
  
  // Security configuration
  security: {
    encryptionKey: env.ENCRYPTION_KEY,
    csrfSecret: env.CSRF_SECRET,
    sessionSecret: env.SESSION_SECRET,
    bcryptRounds: env.BCRYPT_ROUNDS,
    cspPolicy: env.CSP_POLICY,
    hstsMaxAge: env.HSTS_MAX_AGE,
    hstsIncludeSubdomains: env.HSTS_INCLUDE_SUBDOMAINS,
    hstsPreload: env.HSTS_PRELOAD
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
    skipSuccess: env.RATE_LIMIT_SKIP_SUCCESS
  },
  
  // Blockchain configuration
  blockchain: {
    network: env.ETHEREUM_NETWORK,
    infuraProjectId: env.INFURA_PROJECT_ID,
    alchemyApiKey: env.ALCHEMY_API_KEY,
    contracts: {
      nft: env.CONTRACT_ADDRESS_NFT,
      governance: env.CONTRACT_ADDRESS_GOVERNANCE
    },
    operatorPrivateKey: env.PRIVATE_KEY_OPERATOR,
    gasLimitDefault: env.GAS_LIMIT_DEFAULT,
    gasPriceMultiplier: env.GAS_PRICE_MULTIPLIER
  },
  
  // IPFS configuration
  ipfs: {
    apiUrl: env.IPFS_API_URL,
    pinataApiKey: env.PINATA_API_KEY,
    pinataSecretKey: env.PINATA_SECRET_KEY,
    gatewayUrl: env.IPFS_GATEWAY_URL
  },
  
  // Email configuration
  email: {
    smtp: {
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS
      }
    },
    from: {
      email: env.FROM_EMAIL,
      name: env.FROM_NAME
    }
  },
  
  // KYC configuration
  kyc: {
    provider: env.KYC_PROVIDER,
    apiUrl: env.KYC_API_URL,
    apiKey: env.KYC_API_KEY,
    apiSecret: env.KYC_API_SECRET,
    webhookSecret: env.KYC_WEBHOOK_SECRET
  },
  
  // File upload configuration
  upload: {
    maxSize: env.FILE_UPLOAD_MAX_SIZE,
    allowedTypes: env.FILE_UPLOAD_ALLOWED_TYPES.split(','),
    path: env.UPLOAD_PATH,
    s3: {
      bucketName: env.S3_BUCKET_NAME,
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      region: env.AWS_REGION
    }
  },
  
  // Monitoring configuration
  monitoring: {
    sentryDsn: env.SENTRY_DSN,
    mixpanelToken: env.MIXPANEL_TOKEN,
    googleAnalyticsId: env.GOOGLE_ANALYTICS_ID
  },
  
  // Logging configuration
  logging: {
    level: env.LOG_LEVEL,
    fileEnabled: env.LOG_FILE_ENABLED,
    filePath: env.LOG_FILE_PATH,
    maxSize: env.LOG_MAX_SIZE,
    maxFiles: env.LOG_MAX_FILES
  },
  
  // External API keys
  apiKeys: {
    coingecko: env.COINGECKO_API_KEY,
    mortgage: env.MORTGAGE_API_KEY,
    propertyData: env.PROPERTY_DATA_API_KEY
  },
  
  // Queue configuration
  queue: {
    redisUrl: env.QUEUE_REDIS_URL,
    dashboardPort: env.QUEUE_DASHBOARD_PORT,
    concurrency: env.QUEUE_CONCURRENCY
  },
  
  // Development settings
  development: {
    debugMode: env.DEBUG_MODE,
    seedDatabase: env.SEED_DATABASE,
    mockBlockchain: env.MOCK_BLOCKCHAIN,
    mockKyc: env.MOCK_KYC,
    mockEmail: env.MOCK_EMAIL
  },
  
  // API documentation
  apiDocsEnabled: env.API_DOCS_ENABLED,
  
  // Environment helpers
  isDevelopment: env.NODE_ENV === 'development',
  isProduction: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test'
};

// Log configuration in development
if (config.isDevelopment && config.development.debugMode) {
  logger.debug('🔧 Configuration loaded:', {
    nodeEnv: config.nodeEnv,
    port: config.port,
    database: { ...config.database, password: '***' },
    redis: { ...config.redis, password: '***' },
    blockchain: { ...config.blockchain, operatorPrivateKey: '***' }
  });
}

export default config;