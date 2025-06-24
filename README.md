# Ecommerce Platform

A full-stack ecommerce platform built with Node.js, Express, React, and TypeScript.

## 🚀 Features

- **User Management**: Registration, authentication, and profile management
- **Product Management**: CRUD operations for products with categories
- **Shopping Cart**: Add, remove, and manage cart items
- **Order Management**: Complete order lifecycle from creation to fulfillment
- **Admin Dashboard**: Comprehensive admin interface for managing the platform
- **Security**: JWT authentication, input validation, and security middleware
- **Testing**: Comprehensive test suite with Jest
- **Database**: PostgreSQL with Prisma ORM

## 🏗️ Architecture

```
ecommerce-platform/
├── backend/                 # Node.js/Express API
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Authentication, validation, etc.
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   └── config/          # Database and app configuration
│   ├── prisma/              # Database schema and migrations
│   └── tests/               # Backend tests
└── frontend/                # React/TypeScript application
    ├── src/
    │   ├── components/      # React components
    │   ├── contexts/        # React contexts
    │   └── services/        # API service functions
    └── public/              # Static assets
```

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **Prisma** - ORM
- **JWT** - Authentication
- **Jest** - Testing framework
- **Docker** - Containerization

### Frontend
- **React** - UI library
- **TypeScript** - Type safety
- **React Router** - Client-side routing
- **Axios** - HTTP client

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL
- npm or yarn

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/whitelight-whiteheat/EcommerceMVP.git
cd EcommerceMVP
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Set up database
npx prisma migrate dev
npx prisma generate

# Start the development server
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

## 🧪 Testing

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

## 📦 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (Admin)

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update` - Update cart item
- `DELETE /api/cart/remove/:id` - Remove item from cart

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order by ID

## 🔧 Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://username:password@localhost:5432/ecommerce"
JWT_SECRET="your-jwt-secret"
PORT=5000
NODE_ENV=development
```

## 🐳 Docker

### Using Docker Compose
```bash
docker-compose up -d
```

This will start:
- PostgreSQL database
- Backend API server
- Frontend development server

## 📊 Database Schema

The application uses PostgreSQL with the following main entities:
- Users
- Products
- Categories
- Cart Items
- Orders
- Order Items

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS configuration
- Rate limiting
- Security headers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions, please open an issue on GitHub.

## 🗺️ Roadmap

- [ ] Payment integration (Stripe/PayPal)
- [ ] Email notifications
- [ ] Product reviews and ratings
- [ ] Advanced search and filtering
- [ ] Mobile app
- [ ] Multi-language support
- [ ] Analytics dashboard
- [ ] Inventory management
- [ ] Shipping integration
- [ ] Customer support system
