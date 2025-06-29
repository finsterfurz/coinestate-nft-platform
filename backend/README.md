# CoinEstate NFT Platform - Backend API

## 🚀 Overview

The CoinEstate backend is a comprehensive REST API built with Node.js and Express.js for managing fractional real estate NFTs, user authentication, property management, and decentralized governance features.

## ✨ Features

### Core Functionality
- **User Management**: Registration, authentication, profile management with role-based access control
- **Property Management**: CRUD operations for real estate properties with detailed metadata
- **NFT Operations**: Minting, trading, and portfolio management for fractional property ownership
- **DAO Governance**: Proposal creation, voting, and execution system for property governance
- **File Uploads**: Secure image and document handling with validation
- **Real-time Features**: WebSocket support for live updates

### Security & Performance
- **JWT Authentication**: Secure token-based authentication with refresh tokens
- **Rate Limiting**: Protection against abuse and DDoS attacks
- **Input Validation**: Comprehensive request validation using express-validator
- **Data Sanitization**: XSS and NoSQL injection protection
- **Caching**: Redis-based caching for improved performance
- **Logging**: Structured logging with Winston

### Blockchain Integration
- **Ethereum Integration**: Smart contract interaction via Web3.js
- **IPFS Storage**: Decentralized metadata storage
- **Multi-network Support**: Mainnet, Sepolia, Polygon support

## 📋 Prerequisites

- **Node.js** 18.x or higher
- **MongoDB** 6.x or higher
- **Redis** 7.x or higher
- **Docker & Docker Compose** (optional, for containerized deployment)

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone https://github.com/finsterfurz/coinestate-nft-platform.git
cd coinestate-nft-platform/backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
```bash
# Copy environment template
cp ../.env.example .env

# Edit the .env file with your configuration
nano .env
```

### 4. Database Setup
```bash
# Start MongoDB (if running locally)
mongod

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:7.0
```

### 5. Redis Setup
```bash
# Start Redis (if running locally)
redis-server

# Or using Docker
docker run -d -p 6379:6379 --name redis redis:7.2-alpine
```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Using Docker Compose
```bash
# Development with hot reload
docker-compose --profile development up

# Production build
docker-compose --profile production up
```

## 📚 API Documentation

### Interactive Documentation
When running in development mode, access the Swagger documentation at:
- **Local**: http://localhost:5000/api/docs
- **Health Check**: http://localhost:5000/health

### API Endpoints Overview

#### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/forgot-password` - Request password reset
- `PUT /api/v1/auth/reset-password/:token` - Reset password

#### Users
- `GET /api/v1/users` - Get all users (admin)
- `GET /api/v1/users/:id` - Get user by ID
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user (admin)

#### Properties
- `GET /api/v1/properties` - Get all properties
- `GET /api/v1/properties/:id` - Get property by ID
- `POST /api/v1/properties` - Create property (admin/manager)
- `PUT /api/v1/properties/:id` - Update property
- `DELETE /api/v1/properties/:id` - Delete property (admin/manager)
- `GET /api/v1/properties/search` - Search properties
- `POST /api/v1/properties/:id/images` - Upload property images

#### NFTs
- `GET /api/v1/nfts` - Get all NFTs
- `GET /api/v1/nfts/:id` - Get NFT by ID
- `POST /api/v1/nfts/mint` - Mint NFTs (admin/manager)
- `POST /api/v1/nfts/:id/purchase` - Purchase NFT shares
- `POST /api/v1/nfts/:id/transfer` - Transfer NFT shares
- `GET /api/v1/nfts/portfolio` - Get user portfolio
- `GET /api/v1/nfts/market/stats` - Get market statistics

#### Governance
- `GET /api/v1/governance/proposals` - Get all proposals
- `POST /api/v1/governance/proposals` - Create proposal
- `POST /api/v1/governance/proposals/:id/vote` - Vote on proposal
- `POST /api/v1/governance/proposals/:id/execute` - Execute proposal
- `GET /api/v1/governance/voting-power/:propertyId` - Get voting power
- `POST /api/v1/governance/delegate` - Delegate voting power

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── database.js   # MongoDB connection
│   │   ├── redis.js      # Redis connection
│   │   └── blockchain.js # Web3 configuration
│   ├── controllers/      # Route controllers
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── property.controller.js
│   │   ├── nft.controller.js
│   │   └── governance.controller.js
│   ├── middleware/       # Custom middleware
│   │   ├── auth.js       # Authentication middleware
│   │   ├── error.js      # Error handling
│   │   ├── cache.js      # Redis caching
│   │   ├── upload.js     # File upload handling
│   │   └── rateLimit.js  # Rate limiting
│   ├── models/           # Mongoose models
│   │   ├── User.js
│   │   ├── Property.js
│   │   ├── NFT.js
│   │   ├── Transaction.js
│   │   ├── Proposal.js
│   │   └── Vote.js
│   ├── routes/           # API routes
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── property.routes.js
│   │   ├── nft.routes.js
│   │   ├── governance.routes.js
│   │   └── health.routes.js
│   ├── services/         # Business logic
│   │   ├── auth.service.js
│   │   ├── user.service.js
│   │   ├── property.service.js
│   │   ├── nft.service.js
│   │   └── governance.service.js
│   ├── utils/            # Utility functions
│   │   ├── logger.js     # Winston logger
│   │   ├── email.js      # Email utilities
│   │   └── validation.js # Custom validators
│   ├── app.js            # Express app setup
│   └── server.js         # Server entry point
├── tests/                # Test files
├── docs/                 # API documentation
├── uploads/              # File uploads directory
├── logs/                 # Application logs
├── Dockerfile            # Docker configuration
├── .dockerignore
├── package.json
└── README.md
```

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Test Categories
- **Unit Tests**: Individual function testing
- **Integration Tests**: API endpoint testing
- **Security Tests**: Authentication and authorization
- **Performance Tests**: Load and stress testing

## 🔧 Configuration

### Environment Variables

Key configuration options in `.env`:

```bash
# Application
NODE_ENV=development
PORT=5000

# Database
MONGO_URI=mongodb://localhost:27017/coinestate

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d

# Blockchain
BLOCKCHAIN_NETWORK=sepolia
INFURA_PROJECT_ID=your-infura-id
PRIVATE_KEY=your-private-key
```

### Security Configuration

- **JWT Secret**: Use a strong, unique secret (minimum 32 characters)
- **Private Key**: Use a dedicated wallet, never your main wallet
- **CORS**: Configure allowed origins for production
- **Rate Limiting**: Adjust limits based on your needs

## 🚀 Deployment

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d

# Scale services
docker-compose up --scale backend=3

# View logs
docker-compose logs -f backend
```

### Manual Deployment
```bash
# Install dependencies
npm ci --only=production

# Build for production
npm run build

# Start with PM2
pm2 start ecosystem.config.js
```

### Environment-Specific Configurations

#### Development
- Swagger documentation enabled
- Detailed error messages
- Hot reload with nodemon
- Debug logging

#### Production
- Optimized Docker builds
- Error reporting with Sentry
- Performance monitoring
- Secure headers and HTTPS

## 📊 Monitoring & Logging

### Health Checks
- **Basic**: `GET /health`
- **Detailed**: `GET /api/v1/health`
- **Readiness**: `GET /api/v1/health/ready`
- **Liveness**: `GET /api/v1/health/live`

### Logging
- **Console**: Development logging
- **File**: Rotating log files
- **External**: Sentry for error tracking

### Metrics
- API response times
- Database query performance
- Cache hit rates
- Error rates and types

## 🔒 Security Best Practices

### Authentication & Authorization
- JWT tokens with expiration
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Account lockout after failed attempts

### Data Protection
- Input validation and sanitization
- SQL/NoSQL injection prevention
- XSS protection
- CSRF protection with tokens

### API Security
- Rate limiting per IP and user
- CORS configuration
- Helmet.js security headers
- Request size limiting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow ESLint configuration
- Write comprehensive tests
- Update documentation
- Use conventional commit messages

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 🆘 Support

### Common Issues

**Database Connection Error**
```bash
# Check MongoDB status
mongosh --eval "db.adminCommand('ping')"

# Restart MongoDB
sudo systemctl restart mongod
```

**Redis Connection Error**
```bash
# Check Redis status
redis-cli ping

# Restart Redis
sudo systemctl restart redis
```

**Port Already in Use**
```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>
```

### Getting Help
- 📧 Email: support@coinestate.com
- 📖 Documentation: [docs.coinestate.com](https://docs.coinestate.com)
- 🐛 Issues: [GitHub Issues](https://github.com/finsterfurz/coinestate-nft-platform/issues)

## 🔄 Changelog

### Version 1.0.0
- Initial release with core features
- User authentication and management
- Property and NFT management
- DAO governance system
- Docker containerization
- Comprehensive API documentation