# E-commerce Platform Backend

A robust Node.js backend for an e-commerce platform with admin dashboard, product management, and analytics.

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)

### Running with Docker (Recommended)

1. **Start the application:**
   ```bash
   docker-compose up -d
   ```

2. **Access the services:**
   - Backend API: http://localhost:3001
   - Admin Dashboard: http://localhost:3002
   - Database: localhost:5432
   - PgAdmin: http://localhost:5050

3. **Login credentials:**
   - Email: `admin@example.com`
   - Password: `admin123`

## 📁 Project Structure

```
backend/
├── src/                    # Source code
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── routes/            # API routes
│   ├── config/            # Configuration files
│   └── app.js             # Express app setup
├── prisma/                # Database schema and migrations
├── scripts/               # Utility scripts (see scripts/README.md)
├── docs/                  # Documentation (see docs/README.md)
├── docker-compose.yml     # Docker services configuration
├── Dockerfile            # Backend container definition
└── package.json          # Dependencies and scripts
```

## 🔧 Development

### Local Development Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Run database migrations:**
   ```bash
   npx prisma migrate dev
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

### Database Management

- **Generate Prisma client:** `npx prisma generate`
- **Run migrations:** `npx prisma migrate dev`
- **Reset database:** `npx prisma migrate reset`
- **View database:** `npx prisma studio`

## 📊 API Endpoints

### Authentication
- `POST /api/users/login` - User login
- `POST /api/users/register` - User registration
- `GET /api/users/profile` - Get user profile

### Admin Routes (Require ADMIN role)
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/products` - List all products
- `GET /api/admin/orders` - List all orders
- `GET /api/admin/users` - List all users
- `GET /api/admin/analytics` - Analytics data

### Products
- `GET /api/products` - List products
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Orders
- `GET /api/orders` - List user orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order details

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run build` - Build for production

## 🔒 Security Features

- JWT authentication
- Role-based access control (USER/ADMIN)
- Input validation and sanitization
- Rate limiting
- CORS protection
- Helmet security headers

## 📈 Features

- **User Management:** Registration, authentication, profile management
- **Product Management:** CRUD operations, categories, inventory tracking
- **Order Management:** Order creation, status tracking, history
- **Analytics Dashboard:** Sales metrics, product performance, user analytics
- **Admin Dashboard:** Comprehensive admin interface

## 🐳 Docker

The application is containerized with Docker:

- **Backend:** Node.js application
- **Database:** PostgreSQL with persistent storage
- **PgAdmin:** Database management interface

## 📝 Documentation

- [API Documentation](http://localhost:3001/api-docs) - Swagger UI
- [Database Schema](docs/erd.mmd) - Entity Relationship Diagram
- [Scripts Documentation](scripts/README.md) - Utility scripts guide

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License. 