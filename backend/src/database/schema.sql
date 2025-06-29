-- =================================================================
-- CoinEstate NFT Platform - Database Schema
-- PostgreSQL database schema for the complete platform
-- =================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- =================================================================
-- ENUMS
-- =================================================================

CREATE TYPE kyc_status AS ENUM ('not_started', 'pending', 'approved', 'rejected');
CREATE TYPE property_type AS ENUM ('residential', 'commercial', 'mixed_use', 'industrial');
CREATE TYPE property_status AS ENUM ('upcoming', 'minting', 'active', 'completed', 'sold');
CREATE TYPE proposal_type AS ENUM ('maintenance', 'renovation', 'property_sale', 'rent_adjustment', 'management_change', 'emergency_repair');
CREATE TYPE proposal_status AS ENUM ('draft', 'active', 'passed', 'rejected', 'executed', 'expired');
CREATE TYPE transaction_type AS ENUM ('nft_purchase', 'nft_sale', 'income_distribution', 'governance_vote', 'property_purchase', 'maintenance_payment', 'staking', 'unstaking');
CREATE TYPE transaction_status AS ENUM ('pending', 'confirmed', 'failed', 'cancelled');
CREATE TYPE audit_action AS ENUM ('create', 'read', 'update', 'delete', 'login', 'logout', 'vote', 'transfer');

-- =================================================================
-- CORE TABLES
-- =================================================================

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address VARCHAR(42) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  email_verified BOOLEAN DEFAULT FALSE,
  kyc_status kyc_status DEFAULT 'not_started',
  kyc_provider_id VARCHAR(255),
  kyc_data JSONB,
  nft_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  last_login_at TIMESTAMP WITH TIME ZONE,
  last_ip VARCHAR(45),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_wallet_address CHECK (wallet_address ~ '^0x[a-fA-F0-9]{40}$'),
  CONSTRAINT valid_email CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- User profiles table
CREATE TABLE user_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  country_code VARCHAR(3),
  timezone VARCHAR(50),
  language VARCHAR(10) DEFAULT 'en',
  avatar_url TEXT,
  bio TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Properties table
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  location VARCHAR(255) NOT NULL,
  address TEXT,
  coordinates POINT,
  property_type property_type NOT NULL,
  status property_status DEFAULT 'upcoming',
  total_value DECIMAL(15,2) NOT NULL,
  nft_count INTEGER NOT NULL,
  minted_nfts INTEGER DEFAULT 0,
  nft_price DECIMAL(15,2),
  images TEXT[] DEFAULT '{}',
  documents TEXT[] DEFAULT '{}',
  roi DECIMAL(5,2),
  occupancy_rate DECIMAL(5,2),
  monthly_rent DECIMAL(12,2),
  annual_income DECIMAL(15,2),
  expenses DECIMAL(15,2),
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT positive_total_value CHECK (total_value > 0),
  CONSTRAINT positive_nft_count CHECK (nft_count > 0),
  CONSTRAINT valid_roi CHECK (roi >= 0 AND roi <= 100),
  CONSTRAINT valid_occupancy CHECK (occupancy_rate >= 0 AND occupancy_rate <= 100)
);

-- NFTs table
CREATE TABLE nfts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token_id BIGINT UNIQUE NOT NULL,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  owner_address VARCHAR(42) NOT NULL,
  previous_owner_address VARCHAR(42),
  metadata_uri TEXT,
  metadata JSONB,
  purchase_price DECIMAL(15,2),
  current_value DECIMAL(15,2),
  acquisition_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  voting_power INTEGER DEFAULT 1,
  is_staked BOOLEAN DEFAULT FALSE,
  staked_at TIMESTAMP WITH TIME ZONE,
  staking_rewards DECIMAL(15,2) DEFAULT 0,
  tx_hash VARCHAR(66),
  block_number BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_owner_address CHECK (owner_address ~ '^0x[a-fA-F0-9]{40}$'),
  CONSTRAINT positive_token_id CHECK (token_id >= 0),
  CONSTRAINT positive_voting_power CHECK (voting_power > 0)
);

-- Governance proposals table
CREATE TABLE proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  type proposal_type NOT NULL,
  status proposal_status DEFAULT 'draft',
  creator VARCHAR(42) NOT NULL,
  voting_starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  voting_ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  execution_delay INTEGER DEFAULT 0,
  votes_for BIGINT DEFAULT 0,
  votes_against BIGINT DEFAULT 0,
  total_voting_power BIGINT DEFAULT 0,
  quorum_required DECIMAL(5,2) DEFAULT 50.0,
  threshold_required DECIMAL(5,2) DEFAULT 50.0,
  metadata JSONB DEFAULT '{}',
  execution_tx_hash VARCHAR(66),
  executed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_creator CHECK (creator ~ '^0x[a-fA-F0-9]{40}$'),
  CONSTRAINT valid_voting_period CHECK (voting_ends_at > voting_starts_at),
  CONSTRAINT valid_quorum CHECK (quorum_required >= 0 AND quorum_required <= 100),
  CONSTRAINT valid_threshold CHECK (threshold_required >= 0 AND threshold_required <= 100)
);

-- Votes table
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  voter VARCHAR(42) NOT NULL,
  support BOOLEAN NOT NULL,
  voting_power INTEGER NOT NULL,
  reason TEXT,
  tx_hash VARCHAR(66),
  block_number BIGINT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_voter CHECK (voter ~ '^0x[a-fA-F0-9]{40}$'),
  CONSTRAINT positive_voting_power CHECK (voting_power > 0),
  UNIQUE(proposal_id, voter)
);

-- Transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hash VARCHAR(66) UNIQUE,
  type transaction_type NOT NULL,
  status transaction_status DEFAULT 'pending',
  amount DECIMAL(18,8),
  currency VARCHAR(10) DEFAULT 'ETH',
  from_address VARCHAR(42) NOT NULL,
  to_address VARCHAR(42) NOT NULL,
  property_id UUID REFERENCES properties(id),
  nft_id UUID REFERENCES nfts(id),
  proposal_id UUID REFERENCES proposals(id),
  gas_used BIGINT,
  gas_price DECIMAL(18,0),
  block_number BIGINT,
  block_timestamp TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_addresses CHECK (
    from_address ~ '^0x[a-fA-F0-9]{40}$' AND 
    to_address ~ '^0x[a-fA-F0-9]{40}$'
  )
);

-- Property performance metrics
CREATE TABLE property_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  occupancy_rate DECIMAL(5,2),
  rental_income DECIMAL(12,2),
  expenses DECIMAL(12,2),
  net_income DECIMAL(12,2),
  property_value DECIMAL(15,2),
  roi DECIMAL(5,2),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(property_id, date)
);

-- User portfolios
CREATE TABLE user_portfolios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  nft_count INTEGER NOT NULL DEFAULT 0,
  total_investment DECIMAL(15,2) NOT NULL DEFAULT 0,
  current_value DECIMAL(15,2) NOT NULL DEFAULT 0,
  monthly_income DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_income DECIMAL(15,2) NOT NULL DEFAULT 0,
  roi DECIMAL(5,2) NOT NULL DEFAULT 0,
  voting_power INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, property_id)
);

-- Income distributions
CREATE TABLE income_distributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_income DECIMAL(15,2) NOT NULL,
  total_expenses DECIMAL(15,2) NOT NULL,
  net_income DECIMAL(15,2) NOT NULL,
  per_nft_amount DECIMAL(15,8) NOT NULL,
  distributed_at TIMESTAMP WITH TIME ZONE,
  tx_hash VARCHAR(66),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_period CHECK (period_end >= period_start),
  CONSTRAINT positive_amounts CHECK (
    total_income >= 0 AND 
    total_expenses >= 0 AND 
    net_income >= 0 AND 
    per_nft_amount >= 0
  )
);

-- =================================================================
-- SECURITY & AUDIT TABLES
-- =================================================================

-- Audit logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action audit_action NOT NULL,
  resource VARCHAR(100) NOT NULL,
  resource_id UUID,
  details JSONB DEFAULT '{}',
  ip_address VARCHAR(45),
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  INDEX (user_id, timestamp),
  INDEX (action, timestamp),
  INDEX (resource, resource_id)
);

-- Security events
CREATE TABLE security_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  user_id UUID REFERENCES users(id),
  ip_address VARCHAR(45),
  user_agent TEXT,
  details JSONB DEFAULT '{}',
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  INDEX (event_type, timestamp),
  INDEX (severity, timestamp),
  INDEX (user_id, timestamp)
);

-- API keys (for external integrations)
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  key_hash VARCHAR(255) NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  permissions TEXT[] DEFAULT '{}',
  rate_limit INTEGER DEFAULT 1000,
  expires_at TIMESTAMP WITH TIME ZONE,
  last_used_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  INDEX (key_hash),
  INDEX (user_id, is_active)
);

-- =================================================================
-- INDEXES
-- =================================================================

-- Users indexes
CREATE INDEX idx_users_wallet_address ON users(wallet_address);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_kyc_status ON users(kyc_status);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Properties indexes
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_type ON properties(property_type);
CREATE INDEX idx_properties_location ON properties USING gin(to_tsvector('english', location));
CREATE INDEX idx_properties_created_at ON properties(created_at);

-- NFTs indexes
CREATE INDEX idx_nfts_token_id ON nfts(token_id);
CREATE INDEX idx_nfts_owner ON nfts(owner_address);
CREATE INDEX idx_nfts_property ON nfts(property_id);
CREATE INDEX idx_nfts_staked ON nfts(is_staked);

-- Proposals indexes
CREATE INDEX idx_proposals_property ON proposals(property_id);
CREATE INDEX idx_proposals_status ON proposals(status);
CREATE INDEX idx_proposals_creator ON proposals(creator);
CREATE INDEX idx_proposals_voting_period ON proposals(voting_starts_at, voting_ends_at);

-- Votes indexes
CREATE INDEX idx_votes_proposal ON votes(proposal_id);
CREATE INDEX idx_votes_voter ON votes(voter);
CREATE INDEX idx_votes_timestamp ON votes(timestamp);

-- Transactions indexes
CREATE INDEX idx_transactions_hash ON transactions(hash);
CREATE INDEX idx_transactions_from ON transactions(from_address);
CREATE INDEX idx_transactions_to ON transactions(to_address);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);

-- Property metrics indexes
CREATE INDEX idx_property_metrics_property_date ON property_metrics(property_id, date);
CREATE INDEX idx_property_metrics_date ON property_metrics(date);

-- Portfolio indexes
CREATE INDEX idx_user_portfolios_user ON user_portfolios(user_id);
CREATE INDEX idx_user_portfolios_property ON user_portfolios(property_id);

-- =================================================================
-- TRIGGERS & FUNCTIONS
-- =================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_nfts_updated_at BEFORE UPDATE ON nfts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON proposals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update user NFT count
CREATE OR REPLACE FUNCTION update_user_nft_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE users SET nft_count = nft_count + 1 WHERE wallet_address = NEW.owner_address;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' AND OLD.owner_address != NEW.owner_address THEN
    UPDATE users SET nft_count = nft_count - 1 WHERE wallet_address = OLD.owner_address;
    UPDATE users SET nft_count = nft_count + 1 WHERE wallet_address = NEW.owner_address;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE users SET nft_count = nft_count - 1 WHERE wallet_address = OLD.owner_address;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_nft_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON nfts
  FOR EACH ROW EXECUTE FUNCTION update_user_nft_count();

-- Function to update property minted NFTs count
CREATE OR REPLACE FUNCTION update_property_minted_nfts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE properties SET minted_nfts = minted_nfts + 1 WHERE id = NEW.property_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE properties SET minted_nfts = minted_nfts - 1 WHERE id = OLD.property_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_property_minted_nfts_trigger
  AFTER INSERT OR DELETE ON nfts
  FOR EACH ROW EXECUTE FUNCTION update_property_minted_nfts();

-- =================================================================
-- VIEWS
-- =================================================================

-- Active proposals view
CREATE VIEW active_proposals AS
SELECT 
  p.*,
  pr.name as property_name,
  pr.location as property_location,
  CASE 
    WHEN NOW() < p.voting_starts_at THEN 'upcoming'
    WHEN NOW() BETWEEN p.voting_starts_at AND p.voting_ends_at THEN 'active'
    WHEN NOW() > p.voting_ends_at THEN 'ended'
  END as voting_phase
FROM proposals p
JOIN properties pr ON p.property_id = pr.id
WHERE p.status IN ('active', 'draft');

-- User portfolio summary view
CREATE VIEW user_portfolio_summary AS
SELECT 
  u.id as user_id,
  u.wallet_address,
  COUNT(DISTINCT up.property_id) as properties_count,
  SUM(up.nft_count) as total_nfts,
  SUM(up.total_investment) as total_investment,
  SUM(up.current_value) as current_value,
  SUM(up.monthly_income) as monthly_income,
  SUM(up.total_income) as total_income,
  AVG(up.roi) as average_roi,
  SUM(up.voting_power) as total_voting_power
FROM users u
LEFT JOIN user_portfolios up ON u.id = up.user_id
GROUP BY u.id, u.wallet_address;

-- Property performance view
CREATE VIEW property_performance AS
SELECT 
  p.id,
  p.name,
  p.location,
  p.total_value,
  p.nft_count,
  p.minted_nfts,
  ROUND((p.minted_nfts::decimal / p.nft_count * 100), 2) as mint_percentage,
  p.roi,
  p.occupancy_rate,
  p.monthly_rent,
  COUNT(DISTINCT n.owner_address) as unique_owners,
  AVG(pm.roi) as avg_historical_roi,
  COALESCE(SUM(id.net_income), 0) as total_distributed_income
FROM properties p
LEFT JOIN nfts n ON p.id = n.property_id
LEFT JOIN property_metrics pm ON p.id = pm.property_id AND pm.date >= CURRENT_DATE - INTERVAL '12 months'
LEFT JOIN income_distributions id ON p.id = id.property_id
GROUP BY p.id;

-- =================================================================
-- SAMPLE DATA (for development)
-- =================================================================

-- Insert sample users (only in development)
-- INSERT INTO users (wallet_address, email, kyc_status) VALUES 
-- ('0x742d35Cc6634C0532925a3b8D52c18D11F8a30a7', 'demo@coinestate.io', 'approved'),
-- ('0x8ba1f109551bD432803012645Hac136c72Ce4A8d', 'investor@coinestate.io', 'approved');

-- =================================================================
-- GRANTS & PERMISSIONS
-- =================================================================

-- Grant permissions to application user
-- GRANT CONNECT ON DATABASE coinestate_dev TO coinestate_user;
-- GRANT USAGE ON SCHEMA public TO coinestate_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO coinestate_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO coinestate_user;

-- =================================================================
-- SCHEMA COMPLETE
-- =================================================================