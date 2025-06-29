/**
 * Global TypeScript Type Definitions
 * Shared interfaces and types across the CoinEstate NFT Platform
 */

// ================ CORE APPLICATION TYPES ================

export type Theme = 'light' | 'dark' | 'blue';

export interface User {
  id: string;
  walletAddress: string;
  email?: string;
  kycStatus: KYCStatus;
  nftCount: number;
  isActive: boolean;
  joinedAt: Date;
  lastLoginAt?: Date;
}

export type KYCStatus = 'pending' | 'approved' | 'rejected' | 'not_started';

export interface Property {
  id: string;
  name: string;
  location: string;
  description: string;
  totalValue: number;
  nftCount: number;
  mintedNfts: number;
  images: string[];
  propertyType: PropertyType;
  status: PropertyStatus;
  roi: number;
  occupancyRate: number;
  monthlyRent: number;
  createdAt: Date;
  updatedAt: Date;
}

export type PropertyType = 'residential' | 'commercial' | 'mixed_use' | 'industrial';
export type PropertyStatus = 'upcoming' | 'minting' | 'active' | 'completed' | 'sold';

export interface NFT {
  id: string;
  tokenId: number;
  propertyId: string;
  ownerAddress: string;
  metadata: NFTMetadata;
  purchasePrice: number;
  currentValue: number;
  acquisitionDate: Date;
  votingPower: number;
  isStaked: boolean;
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  animation_url?: string;
  external_url?: string;
  attributes: NFTAttribute[];
}

export interface NFTAttribute {
  trait_type: string;
  value: string | number;
  display_type?: 'number' | 'boost_percentage' | 'boost_number' | 'date';
}

// ================ DASHBOARD TYPES ================

export interface DashboardStats {
  totalPortfolioValue: number;
  totalNFTs: number;
  monthlyIncome: number;
  totalVotingPower: number;
  portfolioGrowth: number;
  pendingProposals: number;
}

export interface PortfolioItem {
  property: Property;
  nftCount: number;
  totalInvestment: number;
  currentValue: number;
  monthlyIncome: number;
  roi: number;
  votingPower: number;
}

// ================ GOVERNANCE TYPES ================

export interface Proposal {
  id: string;
  propertyId: string;
  title: string;
  description: string;
  type: ProposalType;
  status: ProposalStatus;
  creator: string;
  createdAt: Date;
  votingStartsAt: Date;
  votingEndsAt: Date;
  votesFor: number;
  votesAgainst: number;
  totalVotingPower: number;
  quorumRequired: number;
  executionDelay: number;
  metadata?: Record<string, any>;
}

export type ProposalType = 
  | 'maintenance' 
  | 'renovation' 
  | 'property_sale' 
  | 'rent_adjustment' 
  | 'management_change'
  | 'emergency_repair';

export type ProposalStatus = 
  | 'draft' 
  | 'active' 
  | 'passed' 
  | 'rejected' 
  | 'executed' 
  | 'expired';

export interface Vote {
  proposalId: string;
  voter: string;
  support: boolean;
  votingPower: number;
  reason?: string;
  timestamp: Date;
}

// ================ TRANSACTION TYPES ================

export interface Transaction {
  id: string;
  hash?: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  currency: string;
  from: string;
  to: string;
  propertyId?: string;
  nftId?: string;
  proposalId?: string;
  gasUsed?: number;
  gasPrice?: string;
  timestamp: Date;
  blockNumber?: number;
  metadata?: Record<string, any>;
}

export type TransactionType = 
  | 'nft_purchase' 
  | 'nft_sale' 
  | 'income_distribution' 
  | 'governance_vote' 
  | 'property_purchase'
  | 'maintenance_payment'
  | 'staking'
  | 'unstaking';

export type TransactionStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'failed' 
  | 'cancelled';

// ================ API TYPES ================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

// ================ COMPONENT PROPS TYPES ================

export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  theme?: Theme;
}

export interface NavigationProps extends BaseComponentProps {
  onNavigate?: (route: string) => void;
  currentPath?: string;
  isAuthenticated?: boolean;
}

export interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  message?: string;
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

// ================ FORM TYPES ================

export interface FormFieldProps {
  name: string;
  label: string;
  value: any;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  onChange: (value: any) => void;
}

export interface FormState<T = Record<string, any>> {
  values: T;
  errors: Record<keyof T, string>;
  touched: Record<keyof T, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
}

// ================ WALLET TYPES ================

export interface WalletInfo {
  address: string;
  balance: string;
  networkId: number;
  isConnected: boolean;
  provider?: any;
  signer?: any;
}

export interface WalletConnection {
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: (networkId: number) => Promise<void>;
  signMessage: (message: string) => Promise<string>;
  sendTransaction: (tx: TransactionData) => Promise<string>;
}

export interface TransactionData {
  to: string;
  value: string;
  data?: string;
  gasLimit?: string;
  gasPrice?: string;
}

// ================ CONTEXT TYPES ================

export interface AuthContextType {
  user: User | null;
  wallet: WalletInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (walletAddress: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
  isLight: boolean;
}

export interface AppContextType {
  properties: Property[];
  nfts: NFT[];
  proposals: Proposal[];
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

// ================ UTILITY TYPES ================

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Dict<T = any> = Record<string, T>;

export interface TimeRange {
  startDate: Date;
  endDate: Date;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  timestamp: Date;
  metadata?: Dict;
}

export interface PerformanceMetrics {
  totalReturn: number;
  annualizedReturn: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
}

// ================ SECURITY TYPES ================

export interface SecurityConfig {
  csrfToken: string;
  sessionTimeout: number;
  maxLoginAttempts: number;
  lockoutDuration: number;
  requireMFA: boolean;
  allowedOrigins: string[];
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  metadata?: Dict;
}

// ================ ENVIRONMENT TYPES ================

export interface EnvironmentConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  VITE_API_BASE_URL: string;
  VITE_NETWORK: string;
  VITE_CHAIN_ID: string;
  VITE_ENABLE_ANALYTICS: string;
  VITE_DEBUG_MODE: string;
  [key: string]: string;
}

// ================ EXPORT HELPERS ================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OmitFields<T, K extends keyof T> = Omit<T, K>;

export type PickFields<T, K extends keyof T> = Pick<T, K>;
