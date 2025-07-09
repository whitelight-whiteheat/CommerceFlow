# 🛒 CommerceFlow - Full-Stack Ecommerce Platform

A production-ready, full-stack ecommerce platform built with modern technologies, featuring comprehensive security, performance optimization, and deployment automation.

## 🎯 Portfolio Demo Project

**CommerFlow** is a full-stack e-commerce platform built as a portfolio demonstration project. This project showcases modern web development skills with a focus on **easy access and exploration**.

### 🌟 Key Features
- **Easy Setup**: Minimal configuration required
- **Demo Credentials**: Pre-configured for immediate access
- **Full Feature Set**: Complete e-commerce functionality
- **Modern Tech Stack**: React, Node.js, PostgreSQL, Docker

### 🚀 Live Demo
- **Frontend**: [https://your-frontend-service.up.railway.app](https://your-frontend-service.up.railway.app)
- **Backend API**: [https://resourceful-connection-production.up.railway.app](https://resourceful-connection-production.up.railway.app)
- **API Documentation**: [https://resourceful-connection-production.up.railway.app/api-docs](https://resourceful-connection-production.up.railway.app/api-docs)
- **Health Check**: [https://resourceful-connection-production.up.railway.app/health](https://resourceful-connection-production.up.railway.app/health)

### Demo Credentials (Portfolio Project)
- **Admin**: admin@example.com / admin123
  - *These credentials are intentionally set to defaults for easy portfolio access*
  - *Feel free to explore all admin features including user management, product catalog, and analytics*
- **Customer**: Register a new account to test the shopping experience

## ✨ Key Features

### 🛍️ Customer Features
- **Secure Authentication**: JWT-based user registration and login
- **Product Catalog**: Browse products with search, filtering, and pagination
- **Shopping Cart**: Add/remove items, quantity management, persistent cart
- **Order Management**: Complete checkout process with order history
- **Responsive Design**: Mobile-friendly interface

### 👨‍💼 Admin Features
- **Product Management**: CRUD operations for products and categories
- **Order Management**: View and update order statuses
- **User Management**: Customer account administration
- **Analytics Dashboard**: Sales metrics and performance monitoring
- **Performance Metrics**: Real-time system performance tracking

## 🛠️ Tech Stack

### Backend
- **Node.js & Express**: RESTful API with middleware architecture
- **PostgreSQL**: Relational database with Prisma ORM
- **JWT Authentication**: Secure token-based authentication
- **Redis**: Caching layer for performance optimization
- **Docker**: Containerized deployment

### Frontend
- **React 19**: Modern UI with TypeScript
- **React Router**: Client-side routing
- **Context API**: State management
- **Axios**: HTTP client with interceptors
- **Responsive CSS**: Mobile-first design

### DevOps & Security
- **Docker Compose**: Multi-service orchestration
- **GitHub Actions**: CI/CD pipeline
- **Security Middleware**: Rate limiting, CORS, XSS protection
- **Error Handling**: Comprehensive error management
- **Performance Monitoring**: Real-time metrics and caching

## 🏗️ Architecture

```
CommerceFlow/
├── backend/                 # Node.js/Express API
│   ├── src/
│   │   ├── controllers/     # Route handlers with caching
│   │   ├── middleware/      # Auth, validation, security
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Performance & security utilities
│   │   └── config/          # Database and app configuration
│   ├── prisma/              # Database schema and migrations
│   ├── scripts/             # Deployment and utility scripts
│   └── tests/               # Backend tests
└── frontend/                # React/TypeScript application
    ├── src/
    │   ├── components/      # React components
    │   ├── contexts/        # React contexts
    │   ├── utils/           # Error handling and API utilities
    │   └── services/        # API service functions
    └── public/              # Static assets
```

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL
- Docker & Docker Compose
- npm or yarn

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/whitelight-whiteheat/CommerceFlow.git
cd CommerceFlow
```

### 2. Quick Setup (Recommended)
```bash
# Setup development environment
npm run setup:dev

# Install all dependencies
npm run install:all

# Start development servers
npm run dev
```

### 3. Docker Setup (Alternative)
```bash
# Start all services
cd backend
docker-compose up -d

# Start frontend
cd ../frontend
npm install
npm start
```

### 4. Manual Setup

#### Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Set up environment variables
npm run setup:dev  # or setup:prod, setup:railway
# Edit .env with your configuration if needed

# Set up database
npx prisma migrate dev
npx prisma generate

# Start the development server
npm run dev
```

#### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

## 🔐 Default Credentials

### Admin Access (Portfolio Demo)
- **Email**: admin@example.com
- **Password**: admin123
- **URL**: http://localhost:3000/admin (or your configured frontend URL)
- **Note**: These credentials are intentionally set to defaults for easy portfolio access and demonstration

### Customer Access
- **URL**: http://localhost:3000 (or your configured frontend URL)
- **Registration**: Available for new customers

## ⚙️ Environment Configuration

### Quick Environment Setup
```bash
# Development environment
npm run setup:dev

# Production environment
npm run setup:prod

# Railway deployment
npm run setup:railway

# Validate environment configuration
npm run env:validate
```

### Environment Presets
The project includes pre-configured environment presets for different deployment scenarios:
- **Development**: Local development with relaxed security
- **Production**: Production-ready configuration with security considerations
- **Railway**: Optimized for Railway deployment platform

### Manual Environment Setup
```bash
# Generate environment file from preset
node env.presets.js dev .env --comments

# Available presets: dev, development, prod, production, railway
```

### URL Configuration
The application uses dynamic URL generation based on environment configuration:
- **Backend API**: Automatically configured based on PORT and HOST
- **Frontend**: Configurable via FRONTEND_URL environment variable
- **Admin Dashboard**: Frontend URL + /admin
- **API Documentation**: Backend URL + /api-docs
- **Health Check**: Backend URL + /health

To update hardcoded URLs in scripts:
```bash
npm run urls:cleanup
```

## 🧪 Testing

### Portfolio Demo Test Runner
```bash
cd backend
npm run demo
```
This comprehensive test runner demonstrates all major features:
- Health checks and API documentation
- Authentication (admin login, user registration)
- Admin features (dashboard, product management)
- Customer features (cart, orders)
- Portfolio demo configuration verification

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Security Audit
```bash
cd backend
npm audit

cd ../frontend
npm audit
```

## 📦 API Endpoints

### Authentication
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Products
- `GET /api/products` - Get all products (with caching)
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)
- `GET /api/products/metrics/performance` - Performance metrics (Admin)

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (Admin)

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart/items` - Add item to cart
- `PUT /api/cart/items/:id` - Update cart item
- `DELETE /api/cart/items/:id` - Remove item from cart
- `DELETE /api/cart` - Clear cart

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order by ID

## 🔧 Environment Variables

### Backend (.env)
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/commerceflow"

# JWT
JWT_SECRET="your-secure-jwt-secret-here"
JWT_EXPIRES_IN="24h"
JWT_ISSUER="commerceflow-api"
JWT_AUDIENCE="commerceflow-users"

# Server
NODE_ENV="development"
PORT=3001
FRONTEND_URL="http://localhost:3000"

# Security
CORS_ORIGIN="http://localhost:3000"
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Performance
CACHE_TTL=300000
ENABLE_METRICS=true
```

## 🐳 Docker

### Development
```bash
docker-compose up -d
```

### Production
```bash
# Set environment variables
export POSTGRES_PASSWORD="your_secure_password"
export JWT_SECRET="your_jwt_secret"
export FRONTEND_URL="https://your-domain.com"
export REDIS_PASSWORD="your_redis_password"

# Deploy
cd backend
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt with strength requirements
- **Input Validation**: Comprehensive validation with SQL injection protection
- **Rate Limiting**: API protection against abuse
- **CORS Protection**: Secure cross-origin request handling
- **XSS Protection**: Content Security Policy headers
- **SQL Injection Prevention**: Parameterized queries and input sanitization

## ⚡ Performance Features

- **Caching System**: In-memory caching with TTL
- **Query Optimization**: Efficient database queries with pagination
- **Response Compression**: Optimized API responses
- **Database Indexing**: Performance-focused schema design
- **Resource Management**: Docker resource limits and health checks
- **Performance Monitoring**: Real-time metrics and caching

## 🚀 Deployment

### Production Deployment
See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed production deployment instructions.

### CI/CD Pipeline
- Automated testing on pull requests
- Security scanning with Snyk
- Docker image building and pushing
- Automated deployment to production

## 📊 Monitoring

### Health Checks
- Application: `GET /health`
- Database: Automatic Docker health checks
- Redis: Automatic Docker health checks

### Performance Metrics
- API response times
- Cache hit rates
- Database query performance
- System resource usage

## 🔧 Development

### Code Quality
- **TypeScript**: Full type safety
- **ESLint**: Code quality enforcement
- **Prettier**: Code formatting
- **Husky**: Git hooks for quality checks

### Testing Strategy
- **Unit Tests**: Jest for backend, React Testing Library for frontend
- **Integration Tests**: API endpoint testing
- **Security Tests**: Vulnerability scanning
- **Performance Tests**: Load testing capabilities

## 📚 Documentation

- [📚 Documentation Index](docs/README.md) - Complete documentation overview
- [API Documentation](http://localhost:3001/api-docs) - Swagger/OpenAPI docs
- [Deployment Guide](docs/DEPLOYMENT_GUIDE.md) - Production deployment
- [Portfolio Summary](docs/PORTFOLIO_SUMMARY.md) - Project overview
- [Development Timeline](docs/DEVELOPMENT_TIMELINE.md) - Project phases

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [📚 Documentation Index](docs/README.md)
2. Review the [troubleshooting guide](docs/DEPLOYMENT_GUIDE.md#troubleshooting)
3. Open an issue on GitHub

## 🏆 Project Status

- ✅ **Phase 1**: Core Foundation (Completed)
- ✅ **Phase 2**: Core Features (Completed)
- ✅ **Phase 3**: Business Logic (Completed)
- ✅ **Phase 4**: Polish & Launch (Completed)
- ✅ **Phase 5**: Resume Enhancement (Completed)
- ✅ **Phase 6**: GitHub Repository Setup (Completed)

## 🎯 Next Steps

- [ ] Payment integration (Stripe/PayPal)
- [ ] Email notifications
- [ ] Product reviews and ratings
- [ ] Advanced analytics
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Advanced search with Elasticsearch

---

**Built with ❤️ using modern web technologies**
