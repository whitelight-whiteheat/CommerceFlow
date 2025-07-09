# CommerFlow API Reference

## Overview

The CommerFlow API is a RESTful API that provides comprehensive e-commerce functionality including user management, product catalog, order processing, and analytics.

**Base URL:** `https://api.commerflow.com/v1`  
**Authentication:** Bearer Token (JWT)  
**Content-Type:** `application/json`

## Authentication

### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "customer",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

### Register
```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": 2,
    "email": "newuser@example.com",
    "role": "customer",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

### Refresh Token
```http
POST /auth/refresh
```

**Headers:**
```
Authorization: Bearer <refresh_token>
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Users

### Get Current User
```http
GET /users/me
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "customer",
    "firstName": "John",
    "lastName": "Doe",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Update User Profile
```http
PUT /users/me
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Smith",
    "phone": "+1234567890"
  }
}
```

### Get All Users (Admin Only)
```http
GET /users
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `search` (string): Search by name or email
- `role` (string): Filter by role

**Response:**
```json
{
  "success": true,
  "users": [
    {
      "id": 1,
      "email": "user@example.com",
      "role": "customer",
      "firstName": "John",
      "lastName": "Doe"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

## Products

### Get All Products
```http
GET /products
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `search` (string): Search by name or description
- `category` (string): Filter by category
- `minPrice` (number): Minimum price filter
- `maxPrice` (number): Maximum price filter
- `sortBy` (string): Sort field (name, price, createdAt)
- `sortOrder` (string): Sort order (asc, desc)

**Response:**
```json
{
  "success": true,
  "products": [
    {
      "id": 1,
      "name": "Wireless Headphones",
      "description": "High-quality wireless headphones",
      "price": 99.99,
      "category": "Electronics",
      "stock": 50,
      "imageUrl": "https://example.com/headphones.jpg",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

### Get Product by ID
```http
GET /products/:id
```

**Response:**
```json
{
  "success": true,
  "product": {
    "id": 1,
    "name": "Wireless Headphones",
    "description": "High-quality wireless headphones",
    "price": 99.99,
    "category": "Electronics",
    "stock": 50,
    "imageUrl": "https://example.com/headphones.jpg",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Create Product (Admin/Manager Only)
```http
POST /products
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "name": "New Product",
  "description": "Product description",
  "price": 29.99,
  "category": "Electronics",
  "stock": 100,
  "imageUrl": "https://example.com/image.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Product created successfully",
  "product": {
    "id": 2,
    "name": "New Product",
    "description": "Product description",
    "price": 29.99,
    "category": "Electronics",
    "stock": 100,
    "imageUrl": "https://example.com/image.jpg",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Update Product (Admin/Manager Only)
```http
PUT /products/:id
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "name": "Updated Product Name",
  "price": 39.99,
  "stock": 75
}
```

**Response:**
```json
{
  "success": true,
  "message": "Product updated successfully",
  "product": {
    "id": 1,
    "name": "Updated Product Name",
    "price": 39.99,
    "stock": 75
  }
}
```

### Delete Product (Admin Only)
```http
DELETE /products/:id
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

## Categories

### Get All Categories
```http
GET /categories
```

**Response:**
```json
{
  "success": true,
  "categories": [
    {
      "id": 1,
      "name": "Electronics",
      "description": "Electronic devices and accessories",
      "productCount": 25
    }
  ]
}
```

### Create Category (Admin Only)
```http
POST /categories
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "name": "New Category",
  "description": "Category description"
}
```

## Orders

### Get User Orders
```http
GET /orders
```

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `status` (string): Filter by status (pending, processing, shipped, delivered, cancelled)

**Response:**
```json
{
  "success": true,
  "orders": [
    {
      "id": 1,
      "userId": 1,
      "items": [
        {
          "id": 1,
          "productId": 1,
          "productName": "Wireless Headphones",
          "quantity": 2,
          "price": 99.99
        }
      ],
      "total": 199.98,
      "status": "pending",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

### Get Order by ID
```http
GET /orders/:id
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "order": {
    "id": 1,
    "userId": 1,
    "items": [
      {
        "id": 1,
        "productId": 1,
        "productName": "Wireless Headphones",
        "quantity": 2,
        "price": 99.99
      }
    ],
    "total": 199.98,
    "status": "pending",
    "shippingAddress": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA"
    },
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Create Order
```http
POST /orders
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "items": [
    {
      "productId": 1,
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "order": {
    "id": 1,
    "total": 199.98,
    "status": "pending"
  }
}
```

### Update Order Status (Admin/Manager Only)
```http
PUT /orders/:id/status
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "status": "shipped",
  "trackingNumber": "TRK123456789"
}
```

### Get All Orders (Admin/Manager Only)
```http
GET /admin/orders
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `status` (string): Filter by status
- `userId` (number): Filter by user ID
- `startDate` (string): Filter by start date (YYYY-MM-DD)
- `endDate` (string): Filter by end date (YYYY-MM-DD)

## Cart

### Get Cart
```http
GET /cart
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "cart": {
    "items": [
      {
        "id": 1,
        "productId": 1,
        "productName": "Wireless Headphones",
        "price": 99.99,
        "quantity": 2,
        "subtotal": 199.98
      }
    ],
    "total": 199.98,
    "itemCount": 2
  }
}
```

### Add Item to Cart
```http
POST /cart/items
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "productId": 1,
  "quantity": 2
}
```

### Update Cart Item
```http
PUT /cart/items/:id
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "quantity": 3
}
```

### Remove Item from Cart
```http
DELETE /cart/items/:id
```

**Headers:**
```
Authorization: Bearer <token>
```

### Clear Cart
```http
DELETE /cart
```

**Headers:**
```
Authorization: Bearer <token>
```

## Analytics (Admin Only)

### Get Dashboard Analytics
```http
GET /admin/analytics/dashboard
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `period` (string): Time period (today, week, month, year)

**Response:**
```json
{
  "success": true,
  "analytics": {
    "totalRevenue": 15000.00,
    "totalOrders": 150,
    "totalUsers": 500,
    "totalProducts": 100,
    "revenueGrowth": 15.5,
    "orderGrowth": 8.2,
    "userGrowth": 12.1,
    "topProducts": [
      {
        "id": 1,
        "name": "Wireless Headphones",
        "sales": 25,
        "revenue": 2499.75
      }
    ],
    "recentOrders": [
      {
        "id": 1,
        "userId": 1,
        "total": 199.98,
        "status": "pending",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### Get Sales Analytics
```http
GET /admin/analytics/sales
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `startDate` (string): Start date (YYYY-MM-DD)
- `endDate` (string): End date (YYYY-MM-DD)
- `groupBy` (string): Group by (day, week, month)

**Response:**
```json
{
  "success": true,
  "sales": {
    "totalRevenue": 15000.00,
    "totalOrders": 150,
    "averageOrderValue": 100.00,
    "data": [
      {
        "date": "2024-01-01",
        "revenue": 500.00,
        "orders": 5
      }
    ]
  }
}
```

## Health Check

### Get API Health
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "uptime": 3600,
  "database": {
    "status": "connected",
    "responseTime": 5
  }
}
```

### Get Database Health
```http
GET /health/database
```

**Response:**
```json
{
  "status": "healthy",
  "database": {
    "status": "connected",
    "responseTime": 5,
    "connections": 10,
    "maxConnections": 20
  }
}
```

## Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "error": "Validation Error",
  "message": "Invalid input data",
  "details": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### Unauthorized (401)
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Invalid or missing authentication token"
}
```

### Forbidden (403)
```json
{
  "success": false,
  "error": "Forbidden",
  "message": "Insufficient permissions to access this resource"
}
```

### Not Found (404)
```json
{
  "success": false,
  "error": "Not Found",
  "message": "Resource not found"
}
```

### Internal Server Error (500)
```json
{
  "success": false,
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Authenticated users:** 100 requests per 15 minutes
- **Guest users:** 50 requests per 15 minutes
- **Admin users:** 200 requests per 15 minutes

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Pagination

List endpoints support pagination with the following query parameters:

- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)

Pagination metadata is included in responses:
```json
{
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Filtering and Sorting

Many endpoints support filtering and sorting:

### Filtering
- `search` (string): Search across text fields
- `category` (string): Filter by category
- `status` (string): Filter by status
- `minPrice`/`maxPrice` (number): Price range filter
- `startDate`/`endDate` (string): Date range filter

### Sorting
- `sortBy` (string): Field to sort by
- `sortOrder` (string): Sort order (asc, desc)

Example:
```
GET /products?search=headphones&category=Electronics&minPrice=50&sortBy=price&sortOrder=desc
```

## Webhooks

The API supports webhooks for real-time notifications:

### Available Events
- `order.created`
- `order.updated`
- `order.cancelled`
- `user.registered`
- `product.updated`

### Webhook Configuration
```http
POST /webhooks
```

**Request Body:**
```json
{
  "url": "https://your-app.com/webhook",
  "events": ["order.created", "order.updated"],
  "secret": "your-webhook-secret"
}
```

### Webhook Payload Example
```json
{
  "event": "order.created",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "data": {
    "orderId": 1,
    "userId": 1,
    "total": 199.98,
    "status": "pending"
  }
}
```

## SDKs and Libraries

### JavaScript/Node.js
```bash
npm install @commerflow/sdk
```

```javascript
import { CommerFlowAPI } from '@commerflow/sdk';

const api = new CommerFlowAPI({
  baseURL: 'https://api.commerflow.com/v1',
  token: 'your-jwt-token'
});

// Get products
const products = await api.products.getAll();

// Create order
const order = await api.orders.create({
  items: [{ productId: 1, quantity: 2 }]
});
```

### Python
```bash
pip install commercflow-sdk
```

```python
from commercflow import CommerFlowAPI

api = CommerFlowAPI(
    base_url='https://api.commerflow.com/v1',
    token='your-jwt-token'
)

# Get products
products = api.products.get_all()

# Create order
order = api.orders.create({
    'items': [{'productId': 1, 'quantity': 2}]
})
```

## Support

For API support and questions:

- **Documentation:** https://docs.commerflow.com
- **Email:** api-support@commerflow.com
- **Discord:** https://discord.gg/commerflow
- **GitHub:** https://github.com/commerflow/api

## Changelog

### v1.0.0 (2024-01-01)
- Initial API release
- User authentication and management
- Product catalog
- Order processing
- Basic analytics

### v1.1.0 (2024-02-01)
- Added webhook support
- Enhanced filtering and sorting
- Improved error handling
- Added rate limiting

### v1.2.0 (2024-03-01)
- Added cart management
- Enhanced analytics
- Added bulk operations
- Improved performance 