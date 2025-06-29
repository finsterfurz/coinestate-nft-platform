/**
 * Enterprise API Server for CoinEstate NFT Platform
 * Express.js backend with security, validation, and Web3 integration
 */

import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { body, query, param, validationResult } from 'express-validator';
import { ethers } from 'ethers';
import jwt from 'jsonwebtoken';
import { 
  ValidationSchemas, 
  CSRFProtection, 
  SecurityLogger, 
  EncryptionUtils,
  validateAndSanitize 
} from '../utils/security';
import type { 
  User, 
  Property, 
  Proposal, 
  NFTToken, 
  APIResponse, 
  SecurityContext 
} from '../types/enhanced';

// ================ SERVER CONFIGURATION ================

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ================ SECURITY MIDDLEWARE ================

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "wss://ws.coinestate.io"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: NODE_ENV === 'production' 
    ? ['https://coinestate.io', 'https://app.coinestate.io']
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many authentication attempts',
  skipSuccessfulRequests: true,
});

// Compression
app.use(compression());

// Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ================ AUTHENTICATION MIDDLEWARE ================

interface AuthenticatedRequest extends Request {
  user?: User;
  securityContext?: SecurityContext;
}

/**
 * JWT Authentication middleware
 */
const authenticateToken = async (
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json(createErrorResponse('Access token required'));
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret') as any;
    const user = await getUserById(decoded.userId);

    if (!user) {
      res.status(401).json(createErrorResponse('Invalid token'));
      return;
    }

    req.user = user;
    req.securityContext = {
      csrfToken: CSRFProtection.generateToken(decoded.sessionId),
      sessionId: decoded.sessionId,
      isAuthenticated: true,
      permissions: [], // Load from database
      securityLevel: 'basic',
      lastSecurityCheck: new Date(),
      mfaEnabled: false,
      deviceFingerprint: req.headers['user-agent'] || ''
    };

    next();
  } catch (error) {
    SecurityLogger.logEvent({
      type: 'unauthorized_access',
      severity: 'medium',
      userId: 'unknown',
      details: { error: error.message },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || '',
      resolved: false
    });

    res.status(403).json(createErrorResponse('Invalid token'));
  }
};

/**
 * CSRF Protection middleware
 */
const csrfProtection = (
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
): void => {
  if (req.method === 'GET') {
    next();
    return;
  }

  const csrfToken = req.headers['x-csrf-token'] as string;
  const sessionId = req.securityContext?.sessionId;

  if (!sessionId || !CSRFProtection.validateToken(sessionId, csrfToken)) {
    res.status(403).json(createErrorResponse('Invalid CSRF token'));
    return;
  }

  next();
};

// ================ VALIDATION MIDDLEWARE ================

/**
 * Request validation middleware
 */
const validateRequest = (validations: any[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json(createErrorResponse('Validation failed', errors.array()));
      return;
    }

    next();
  };
};

// ================ UTILITY FUNCTIONS ================

/**
 * Create standardized API response
 */
const createResponse = <T>(data: T, metadata?: any): APIResponse<T> => ({
  success: true,
  data,
  metadata: {
    timestamp: new Date(),
    requestId: EncryptionUtils.generateSecureRandom(16),
    version: '1.0',
    ...metadata
  }
});

/**
 * Create standardized error response
 */
const createErrorResponse = (message: string, details?: any): APIResponse => ({
  success: false,
  error: {
    code: 'API_ERROR',
    message,
    details,
    timestamp: new Date(),
    requestId: EncryptionUtils.generateSecureRandom(16)
  }
});

// ================ DATABASE MOCK (Replace with real database) ================

// Mock database - replace with actual database implementation
const mockDatabase = {
  users: new Map<string, User>(),
  properties: new Map<string, Property>(),
  proposals: new Map<string, Proposal>(),
  nftTokens: new Map<string, NFTToken>()
};

const getUserById = async (id: string): Promise<User | null> => {
  return mockDatabase.users.get(id) || null;
};

const getUserByWallet = async (walletAddress: string): Promise<User | null> => {
  for (const user of mockDatabase.users.values()) {
    if (user.walletAddress.toLowerCase() === walletAddress.toLowerCase()) {
      return user;
    }
  }
  return null;
};

// ================ WEB3 INTEGRATION ================

/**
 * Web3 provider setup
 */
const provider = new ethers.JsonRpcProvider(
  process.env.ETHEREUM_RPC_URL || 'https://eth-sepolia.g.alchemy.com/v2/demo'
);

/**
 * Verify wallet signature
 */
const verifyWalletSignature = async (
  message: string, 
  signature: string, 
  address: string
): Promise<boolean> => {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === address.toLowerCase();
  } catch (error) {
    return false;
  }
};

// ================ API ROUTES ================

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json(createResponse({
    status: 'healthy',
    timestamp: new Date(),
    version: process.env.npm_package_version || '1.0.0',
    environment: NODE_ENV
  }));
});

// ================ AUTHENTICATION ROUTES ================

/**
 * Web3 Authentication - Request nonce
 */
app.post('/api/auth/nonce', 
  authLimiter,
  validateRequest([
    body('walletAddress').custom(async (value) => {
      const result = validateAndSanitize(value, ValidationSchemas.walletAddress);
      if (!result.isValid) {
        throw new Error(result.errors[0]?.message || 'Invalid wallet address');
      }
      return true;
    })
  ]),
  async (req: Request, res: Response) => {
    try {
      const { walletAddress } = req.body;
      const nonce = EncryptionUtils.generateSecureRandom(16);
      
      // Store nonce temporarily (use Redis in production)
      // mockNonceStore.set(walletAddress, nonce, { ttl: 300 }); // 5 minutes
      
      res.json(createResponse({
        nonce,
        message: `Sign this message to authenticate with CoinEstate: ${nonce}`,
        expiresAt: new Date(Date.now() + 300000) // 5 minutes
      }));
    } catch (error) {
      res.status(500).json(createErrorResponse('Failed to generate nonce'));
    }
  }
);

/**
 * Web3 Authentication - Verify signature
 */
app.post('/api/auth/verify',
  authLimiter,
  validateRequest([
    body('walletAddress').custom(async (value) => {
      const result = validateAndSanitize(value, ValidationSchemas.walletAddress);
      if (!result.isValid) throw new Error('Invalid wallet address');
      return true;
    }),
    body('signature').isLength({ min: 130, max: 132 }),
    body('nonce').isLength({ min: 16, max: 64 })
  ]),
  async (req: Request, res: Response) => {
    try {
      const { walletAddress, signature, nonce } = req.body;
      
      // Verify nonce (check against stored nonce)
      // const storedNonce = mockNonceStore.get(walletAddress);
      // if (!storedNonce || storedNonce !== nonce) {
      //   return res.status(400).json(createErrorResponse('Invalid or expired nonce'));
      // }
      
      const message = `Sign this message to authenticate with CoinEstate: ${nonce}`;
      const isValidSignature = await verifyWalletSignature(message, signature, walletAddress);
      
      if (!isValidSignature) {
        SecurityLogger.logEvent({
          type: 'failed_login',
          severity: 'medium',
          userId: walletAddress,
          details: { reason: 'Invalid signature' },
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'] || '',
          resolved: false
        });
        
        return res.status(401).json(createErrorResponse('Invalid signature'));
      }
      
      // Get or create user
      let user = await getUserByWallet(walletAddress);
      if (!user) {
        user = {
          id: EncryptionUtils.generateSecureRandom(16),
          walletAddress,
          kycStatus: 'not_started',
          kycLevel: 'basic',
          registrationDate: new Date(),
          preferences: {
            theme: 'light',
            language: 'en',
            currency: 'USD',
            notifications: {
              email: true,
              push: true,
              sms: false
            },
            privacy: {
              shareData: false,
              analytics: true
            }
          },
          governance: {
            votingPower: 0,
            nftTokens: [],
            votingHistory: [],
            participationScore: 0,
            reputationScore: 50
          }
        } as User;
        
        mockDatabase.users.set(user.id, user);
      }
      
      // Generate JWT
      const sessionId = EncryptionUtils.generateSecureRandom(16);
      const token = jwt.sign(
        { userId: user.id, sessionId, walletAddress },
        process.env.JWT_SECRET || 'dev-secret',
        { expiresIn: '1h' }
      );
      
      res.json(createResponse({
        token,
        user: {
          ...user,
          // Don't send sensitive data
        },
        expiresAt: new Date(Date.now() + 3600000) // 1 hour
      }));
      
    } catch (error) {
      res.status(500).json(createErrorResponse('Authentication failed'));
    }
  }
);

// ================ USER ROUTES ================

/**
 * Get user profile
 */
app.get('/api/user/profile', 
  authenticateToken,
  (req: AuthenticatedRequest, res: Response) => {
    res.json(createResponse(req.user));
  }
);

/**
 * Update user preferences
 */
app.put('/api/user/preferences',
  authenticateToken,
  csrfProtection,
  validateRequest([
    body('theme').optional().isIn(['light', 'dark', 'blue', 'auto']),
    body('language').optional().isLength({ min: 2, max: 5 }),
    body('currency').optional().isLength({ min: 3, max: 3 })
  ]),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = req.user!;
      const updates = req.body;
      
      // Update user preferences
      user.preferences = { ...user.preferences, ...updates };
      mockDatabase.users.set(user.id, user);
      
      res.json(createResponse(user.preferences));
    } catch (error) {
      res.status(500).json(createErrorResponse('Failed to update preferences'));
    }
  }
);

// ================ PROPERTY ROUTES ================

/**
 * Get all properties
 */
app.get('/api/properties',
  authenticateToken,
  validateRequest([
    query('page').optional().isInt({ min: 1, max: 1000 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['acquisition', 'active', 'maintenance', 'sale_pending'])
  ]),
  (req: AuthenticatedRequest, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;
    
    let properties = Array.from(mockDatabase.properties.values());
    
    if (status) {
      properties = properties.filter(p => p.status === status);
    }
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProperties = properties.slice(startIndex, endIndex);
    
    res.json(createResponse(paginatedProperties, {
      pagination: {
        page,
        limit,
        total: properties.length,
        hasNext: endIndex < properties.length,
        hasPrev: page > 1
      }
    }));
  }
);

/**
 * Get property by ID
 */
app.get('/api/properties/:id',
  authenticateToken,
  validateRequest([
    param('id').isLength({ min: 1, max: 50 })
  ]),
  (req: AuthenticatedRequest, res: Response) => {
    const property = mockDatabase.properties.get(req.params.id);
    
    if (!property) {
      return res.status(404).json(createErrorResponse('Property not found'));
    }
    
    res.json(createResponse(property));
  }
);

// ================ GOVERNANCE ROUTES ================

/**
 * Get proposals
 */
app.get('/api/governance/proposals',
  authenticateToken,
  validateRequest([
    query('propertyId').optional().isLength({ min: 1, max: 50 }),
    query('status').optional().isIn(['draft', 'active', 'passed', 'rejected']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ]),
  (req: AuthenticatedRequest, res: Response) => {
    const { propertyId, status } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    
    let proposals = Array.from(mockDatabase.proposals.values());
    
    if (propertyId) {
      proposals = proposals.filter(p => p.propertyId === propertyId);
    }
    
    if (status) {
      proposals = proposals.filter(p => p.status === status);
    }
    
    const startIndex = (page - 1) * limit;
    const paginatedProposals = proposals.slice(startIndex, startIndex + limit);
    
    res.json(createResponse(paginatedProposals, {
      pagination: {
        page,
        limit,
        total: proposals.length,
        hasNext: startIndex + limit < proposals.length,
        hasPrev: page > 1
      }
    }));
  }
);

/**
 * Submit vote
 */
app.post('/api/governance/vote',
  authenticateToken,
  csrfProtection,
  validateRequest([
    body('proposalId').isLength({ min: 1, max: 50 }),
    body('vote').isIn(['yes', 'no', 'abstain']),
    body('signature').optional().isLength({ min: 130, max: 132 })
  ]),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { proposalId, vote, signature } = req.body;
      const user = req.user!;
      
      const proposal = mockDatabase.proposals.get(proposalId);
      if (!proposal) {
        return res.status(404).json(createErrorResponse('Proposal not found'));
      }
      
      if (proposal.status !== 'active') {
        return res.status(400).json(createErrorResponse('Proposal not accepting votes'));
      }
      
      // Check if user has voting power
      if (user.governance.votingPower === 0) {
        return res.status(403).json(createErrorResponse('No voting power'));
      }
      
      // Record vote (in production, ensure one vote per user per proposal)
      const votingRecord = {
        proposalId,
        vote,
        votingPower: user.governance.votingPower,
        timestamp: new Date(),
        transactionHash: signature ? `0x${EncryptionUtils.generateSecureRandom(32)}` : undefined,
        delegated: false
      };
      
      user.governance.votingHistory.push(votingRecord);
      user.governance.lastVoteDate = new Date();
      mockDatabase.users.set(user.id, user);
      
      // Update proposal votes
      proposal.votes[vote as keyof typeof proposal.votes] += user.governance.votingPower;
      if (!proposal.participants.includes(user.id)) {
        proposal.participants.push(user.id);
      }
      mockDatabase.proposals.set(proposalId, proposal);
      
      res.json(createResponse({
        vote: votingRecord,
        proposal: {
          id: proposal.id,
          votes: proposal.votes,
          participantCount: proposal.participants.length
        }
      }));
      
    } catch (error) {
      res.status(500).json(createErrorResponse('Failed to submit vote'));
    }
  }
);

// ================ ERROR HANDLING ================

/**
 * Global error handler
 */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', error);
  
  SecurityLogger.logEvent({
    type: 'unauthorized_access',
    severity: 'high',
    userId: 'system',
    details: { error: error.message, stack: error.stack },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'] || '',
    resolved: false
  });
  
  res.status(500).json(createErrorResponse('Internal server error'));
});

/**
 * 404 handler
 */
app.use('*', (req: Request, res: Response) => {
  res.status(404).json(createErrorResponse('Endpoint not found'));
});

// ================ SERVER STARTUP ================

/**
 * Start server
 */
const startServer = async () => {
  try {
    app.listen(PORT, () => {
      console.log(`🚀 CoinEstate API Server running on port ${PORT}`);
      console.log(`📊 Environment: ${NODE_ENV}`);
      console.log(`🔒 Security: Enhanced`);
      console.log(`🌐 CORS: Configured`);
      console.log(`⚡ Performance: Optimized`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start server if this file is run directly
if (require.main === module) {
  startServer();
}

export default app;
export { startServer };
