/**
 * Enhanced TypeScript Definitions for CoinEstate NFT Platform
 * Enterprise-grade type safety implementation
 */

// ================ CORE APPLICATION TYPES ================

export interface Theme {
  mode: 'light' | 'dark' | 'blue' | 'auto';
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
}

export interface User {
  id: string;
  walletAddress: string;
  email?: string;
  kycStatus: KYCStatus;
  kycLevel: KYCLevel;
  registrationDate: Date;
  lastLoginDate?: Date;
  preferences: UserPreferences;
  governance: GovernanceProfile;
}

export interface UserPreferences {
  theme: Theme['mode'];
  language: string;
  currency: string;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

// ================ KYC & COMPLIANCE TYPES ================

export type KYCStatus = 
  | 'not_started'
  | 'in_progress' 
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'expired'
  | 'suspended';

export type KYCLevel = 'basic' | 'enhanced' | 'institutional';

export interface KYCData {
  status: KYCStatus;
  level: KYCLevel;
  submissionDate?: Date;
  approvalDate?: Date;
  expiryDate?: Date;
  documents: KYCDocument[];
  provider: 'jumio' | 'onfido' | 'manual';
  complianceFlags: ComplianceFlag[];
}

export interface KYCDocument {
  id: string;
  type: 'passport' | 'drivers_license' | 'national_id' | 'proof_of_address' | 'utility_bill';
  status: 'pending' | 'approved' | 'rejected';
  uploadDate: Date;
  expiryDate?: Date;
  verificationScore?: number;
}

// ================ GOVERNANCE & VOTING TYPES ================

export interface GovernanceProfile {
  votingPower: number;
  nftTokens: NFTToken[];
  votingHistory: VotingRecord[];
  participationScore: number;
  reputationScore: number;
  lastVoteDate?: Date;
}

export interface NFTToken {
  tokenId: string;
  contractAddress: string;
  propertyId: string;
  votingWeight: number;
  acquisitionDate: Date;
  transferHistory: TransferRecord[];
  metadata: NFTMetadata;
}

export interface VotingRecord {
  proposalId: string;
  vote: 'yes' | 'no' | 'abstain';
  votingPower: number;
  timestamp: Date;
  transactionHash?: string;
  delegated: boolean;
}

export interface Proposal {
  id: string;
  propertyId: string;
  title: string;
  description: string;
  category: ProposalCategory;
  proposer: string;
  status: ProposalStatus;
  votingStart: Date;
  votingEnd: Date;
  quorumRequired: number;
  threshold: number;
  votes: {
    yes: number;
    no: number;
    abstain: number;
  };
  participants: string[];
  executionDate?: Date;
}

export type ProposalCategory = 
  | 'maintenance'
  | 'capital_improvement'
  | 'budget_approval'
  | 'contractor_selection'
  | 'strategic_decision'
  | 'emergency_action';

export type ProposalStatus = 
  | 'draft'
  | 'active'
  | 'passed'
  | 'rejected'
  | 'executed'
  | 'expired'
  | 'cancelled';

// ================ PROPERTY & REAL ESTATE TYPES ================

export interface Property {
  id: string;
  address: PropertyAddress;
  type: PropertyType;
  status: PropertyStatus;
  financials: PropertyFinancials;
  management: PropertyManagement;
  governance: PropertyGovernance;
  documents: PropertyDocument[];
  multimedia: PropertyMultimedia[];
  metadata: PropertyMetadata;
}

export interface PropertyAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export type PropertyType = 
  | 'residential_single'
  | 'residential_multi'
  | 'commercial_office'
  | 'commercial_retail'
  | 'commercial_warehouse'
  | 'mixed_use'
  | 'land'
  | 'development';

export type PropertyStatus = 
  | 'acquisition'
  | 'active'
  | 'maintenance'
  | 'renovation'
  | 'sale_pending'
  | 'sold'
  | 'liquidated';

export interface PropertyFinancials {
  acquisitionPrice: number;
  currentValue: number;
  monthlyRent: number;
  monthlyExpenses: number;
  netCashFlow: number;
  roi: number;
  cap_rate: number;
  occupancyRate: number;
  lastUpdated: Date;
}

// ================ WEB3 & BLOCKCHAIN TYPES ================

export interface Web3Context {
  isConnected: boolean;
  account?: string;
  chainId?: number;
  network?: string;
  provider?: any; // Web3Provider
  signer?: any; // Signer
  balance?: string;
  contracts: {
    nft?: any; // Contract
    governance?: any; // Contract
  };
}

export interface TransactionRequest {
  to: string;
  value?: string;
  data?: string;
  gasLimit?: string;
  gasPrice?: string;
  nonce?: number;
}

export interface TransactionResponse {
  hash: string;
  blockNumber?: number;
  blockHash?: string;
  timestamp?: number;
  confirmations: number;
  status: 'pending' | 'confirmed' | 'failed';
  gasUsed?: string;
  effectiveGasPrice?: string;
}

// ================ SECURITY TYPES ================

export interface SecurityContext {
  csrfToken: string;
  sessionId: string;
  isAuthenticated: boolean;
  permissions: Permission[];
  securityLevel: SecurityLevel;
  lastSecurityCheck: Date;
  mfaEnabled: boolean;
  deviceFingerprint: string;
}

export type SecurityLevel = 'basic' | 'enhanced' | 'maximum';

export interface Permission {
  resource: string;
  action: 'read' | 'write' | 'execute' | 'admin';
  granted: boolean;
  expiryDate?: Date;
}

export interface SecurityEvent {
  id: string;
  type: SecurityEventType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId: string;
  timestamp: Date;
  details: any;
  ipAddress: string;
  userAgent: string;
  resolved: boolean;
}

export type SecurityEventType = 
  | 'login_attempt'
  | 'failed_login'
  | 'password_change'
  | 'permission_elevation'
  | 'suspicious_activity'
  | 'data_breach_attempt'
  | 'unauthorized_access';

// ================ API TYPES ================

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: APIError;
  metadata?: APIMetadata;
}

export interface APIError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  requestId: string;
}

export interface APIMetadata {
  requestId: string;
  timestamp: Date;
  version: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ================ VALIDATION SCHEMAS ================

export interface ValidationSchema {
  [key: string]: {
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    enum?: string[];
    custom?: (value: any) => boolean;
  };
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  sanitizedData?: any;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// ================ COMPONENT PROPS TYPES ================

export interface ComponentBaseProps {
  className?: string;
  testId?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

export interface ThemeProps {
  theme: Theme['mode'];
}

export interface NavigationProps {
  onNavigate: (route: string, analyticsEvent?: string) => void;
}

export interface LoadingProps {
  isLoading: boolean;
  loadingText?: string;
  spinner?: boolean;
}

export interface ErrorProps {
  error?: Error | string;
  retry?: () => void;
  fallback?: React.ReactNode;
}

// ================ ANALYTICS & MONITORING TYPES ================

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  userId?: string;
  timestamp: Date;
  sessionId: string;
}

export interface PerformanceMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  timeToInteractive: number;
}

export interface ErrorReport {
  message: string;
  stack?: string;
  component?: string;
  props?: any;
  timestamp: Date;
  userId?: string;
  url: string;
  userAgent: string;
}

// ================ TESTING TYPES ================

export interface TestContext {
  user: any; // Testing Library User
  container: HTMLElement;
  rerender: (ui: React.ReactElement) => void;
  unmount: () => void;
}

export interface MockData {
  users: User[];
  properties: Property[];
  proposals: Proposal[];
  nftTokens: NFTToken[];
}

// ================ UTILITY TYPES ================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type NonNullable<T> = T extends null | undefined ? never : T;

export type Awaited<T> = T extends Promise<infer U> ? U : T;

export type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];

export type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

// ================ ENVIRONMENT TYPES ================

export interface Environment {
  NODE_ENV: 'development' | 'production' | 'test';
  VITE_APP_NAME: string;
  VITE_APP_VERSION: string;
  VITE_ENVIRONMENT: string;
  VITE_NETWORK: string;
  VITE_CHAIN_ID: string;
  VITE_API_BASE_URL: string;
  VITE_WEBSOCKET_URL: string;
  VITE_ENABLE_WEB3: boolean;
  VITE_ENABLE_KYC: boolean;
  VITE_ENABLE_ANALYTICS: boolean;
  VITE_DEBUG_MODE: boolean;
}

// ================ CAYMAN ISLANDS COMPLIANCE TYPES ================

export interface CaymanCompliance {
  registrationNumber: string;
  foundationEntityId: string;
  cimaRegistration: string;
  amlOfficer: string;
  localDirector: string;
  registeredOffice: PropertyAddress;
  annualFilingDate: Date;
  complianceStatus: 'current' | 'overdue' | 'suspended';
}

export interface ComplianceFlag {
  type: string;
  severity: 'info' | 'warning' | 'error';
  message: string;
  dateRaised: Date;
  resolved: boolean;
  resolutionDate?: Date;
}

// ================ EXPORT DECLARATIONS ================

export default {
  User,
  Property,
  NFTToken,
  Proposal,
  Web3Context,
  SecurityContext,
  APIResponse,
  ValidationResult,
  AnalyticsEvent,
  PerformanceMetrics,
  Environment,
  CaymanCompliance
};
