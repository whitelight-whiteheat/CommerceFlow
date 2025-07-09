#!/usr/bin/env node

/**
 * API Documentation Generator
 * 
 * Generates comprehensive API documentation including examples and guides.
 */

const fs = require('fs');
const path = require('path');
const { swaggerSpec } = require('../src/config/swagger');

const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log(`\n${colors.bold}${colors.blue}${'='.repeat(50)}`);
  console.log(`${title}`);
  console.log(`${'='.repeat(50)}${colors.reset}`);
}

/**
 * Generate API documentation in different formats
 */
function generateDocs() {
  logSection('📚 API Documentation Generator');
  
  try {
    // Create docs directory
    const docsDir = path.join(__dirname, '../docs/api');
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }
    
    // Generate OpenAPI JSON
    const openApiPath = path.join(docsDir, 'openapi.json');
    fs.writeFileSync(openApiPath, JSON.stringify(swaggerSpec, null, 2));
    log('✅ Generated OpenAPI JSON specification', 'green');
    
    // Generate API reference markdown
    generateApiReference(docsDir);
    
    // Generate examples
    generateExamples(docsDir);
    
    // Generate Postman collection
    generatePostmanCollection(docsDir);
    
    logSection('✅ Documentation Generation Complete');
    log('📁 Generated files:', 'green');
    log(`   ${openApiPath}`, 'blue');
    log(`   ${path.join(docsDir, 'api-reference.md')}`, 'blue');
    log(`   ${path.join(docsDir, 'examples.md')}`, 'blue');
    log(`   ${path.join(docsDir, 'postman-collection.json')}`, 'blue');
    
  } catch (error) {
    log(`❌ Documentation generation failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

/**
 * Generate API reference markdown
 */
function generateApiReference(docsDir) {
  const referencePath = path.join(docsDir, 'api-reference.md');
  
  let content = `# CommerFlow API Reference

## Overview

The CommerFlow API provides a comprehensive set of endpoints for managing an e-commerce platform. This API follows RESTful principles and uses JSON for data exchange.

## Base URL

- **Development**: http://localhost:3001
- **Production**: https://your-domain.com

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

\`\`\`
Authorization: Bearer <your-jwt-token>
\`\`\`

## Response Format

All API responses follow a consistent format:

\`\`\`json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
\`\`\`

## Error Handling

Errors are returned with appropriate HTTP status codes and error details:

\`\`\`json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": { ... }
  }
}
\`\`\`

## Rate Limiting

API requests are rate-limited to prevent abuse:
- **Window**: 15 minutes
- **Limit**: 1000 requests per IP address

## Endpoints

`;

  // Group endpoints by tags
  const endpointsByTag = {};
  
  Object.entries(swaggerSpec.paths).forEach(([path, methods]) => {
    Object.entries(methods).forEach(([method, operation]) => {
      const tag = operation.tags?.[0] || 'Other';
      if (!endpointsByTag[tag]) {
        endpointsByTag[tag] = [];
      }
      endpointsByTag[tag].push({
        path,
        method: method.toUpperCase(),
        operation
      });
    });
  });
  
  // Generate documentation for each tag
  Object.entries(endpointsByTag).forEach(([tag, endpoints]) => {
    content += `### ${tag}\n\n`;
    
    endpoints.forEach(({ path, method, operation }) => {
      content += `#### ${method} ${path}\n\n`;
      content += `${operation.summary}\n\n`;
      
      if (operation.description) {
        content += `${operation.description}\n\n`;
      }
      
      // Parameters
      if (operation.parameters && operation.parameters.length > 0) {
        content += '**Parameters:**\n\n';
        content += '| Name | Type | Required | Description |\n';
        content += '|------|------|----------|-------------|\n';
        
        operation.parameters.forEach(param => {
          const required = param.required ? 'Yes' : 'No';
          content += `| ${param.name} | ${param.schema?.type || 'string'} | ${required} | ${param.description || ''} |\n`;
        });
        content += '\n';
      }
      
      // Request body
      if (operation.requestBody) {
        content += '**Request Body:**\n\n';
        content += '\`\`\`json\n';
        if (operation.requestBody.content['application/json']?.schema) {
          content += JSON.stringify(operation.requestBody.content['application/json'].schema, null, 2);
        }
        content += '\n\`\`\`\n\n';
      }
      
      // Responses
      content += '**Responses:**\n\n';
      Object.entries(operation.responses).forEach(([code, response]) => {
        content += `**${code}** - ${response.description}\n\n`;
      });
      
      content += '---\n\n';
    });
  });
  
  fs.writeFileSync(referencePath, content);
  log('✅ Generated API reference markdown', 'green');
}

/**
 * Generate examples markdown
 */
function generateExamples(docsDir) {
  const examplesPath = path.join(docsDir, 'examples.md');
  
  const content = `# API Examples

This document provides practical examples for using the CommerFlow API.

## Authentication Examples

### Register a new user

\`\`\`bash
curl -X POST http://localhost:3001/api/users/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "USER"
    },
    "token": "jwt-token-here"
  }
}
\`\`\`

### Login

\`\`\`bash
curl -X POST http://localhost:3001/api/users/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
\`\`\`

## Product Examples

### Get all products

\`\`\`bash
curl -X GET "http://localhost:3001/api/products?page=1&limit=10" \\
  -H "Authorization: Bearer <your-token>"
\`\`\`

### Get product by ID

\`\`\`bash
curl -X GET http://localhost:3001/api/products/<product-id> \\
  -H "Authorization: Bearer <your-token>"
\`\`\`

### Create product (Admin only)

\`\`\`bash
curl -X POST http://localhost:3001/api/products \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <admin-token>" \\
  -d '{
    "name": "Sample Product",
    "description": "A sample product description",
    "price": 29.99,
    "stock": 100,
    "categoryId": "category-uuid",
    "images": ["https://example.com/image1.jpg"]
  }'
\`\`\`

## Cart Examples

### Add item to cart

\`\`\`bash
curl -X POST http://localhost:3001/api/cart/items \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <your-token>" \\
  -d '{
    "productId": "product-uuid",
    "quantity": 2
  }'
\`\`\`

### Get cart

\`\`\`bash
curl -X GET http://localhost:3001/api/cart \\
  -H "Authorization: Bearer <your-token>"
\`\`\`

### Update cart item

\`\`\`bash
curl -X PUT http://localhost:3001/api/cart/items/<item-id> \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <your-token>" \\
  -d '{
    "quantity": 3
  }'
\`\`\`

## Order Examples

### Create order from cart

\`\`\`bash
curl -X POST http://localhost:3001/api/orders \\
  -H "Authorization: Bearer <your-token>"
\`\`\`

### Get user orders

\`\`\`bash
curl -X GET "http://localhost:3001/api/orders?page=1&limit=10" \\
  -H "Authorization: Bearer <your-token>"
\`\`\`

## JavaScript Examples

### Using fetch API

\`\`\`javascript
// Login
const loginResponse = await fetch('http://localhost:3001/api/users/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'password123'
  })
});

const { token } = await loginResponse.json();

// Get products
const productsResponse = await fetch('http://localhost:3001/api/products', {
  headers: {
    'Authorization': \`Bearer \${token}\`
  }
});

const products = await productsResponse.json();
\`\`\`

### Using axios

\`\`\`javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Authorization': \`Bearer \${token}\`
  }
});

// Get products
const products = await api.get('/products');

// Add to cart
await api.post('/cart/items', {
  productId: 'product-uuid',
  quantity: 2
});
\`\`\`

## Error Handling Examples

### Validation Error

\`\`\`json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "email": ["Invalid email format"],
      "password": ["Password must be at least 6 characters"]
    }
  }
}
\`\`\`

### Authentication Error

\`\`\`json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
\`\`\`

### Not Found Error

\`\`\`json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Product not found"
  }
}
\`\`\`
`;

  fs.writeFileSync(examplesPath, content);
  log('✅ Generated examples markdown', 'green');
}

/**
 * Generate Postman collection
 */
function generatePostmanCollection(docsDir) {
  const collectionPath = path.join(docsDir, 'postman-collection.json');
  
  const collection = {
    info: {
      name: 'CommerFlow API',
      description: 'API collection for CommerFlow e-commerce platform',
      version: '1.0.0'
    },
    variable: [
      {
        key: 'baseUrl',
        value: 'http://localhost:3001',
        type: 'string'
      },
      {
        key: 'token',
        value: '',
        type: 'string'
      }
    ],
    item: []
  };
  
  // Group endpoints by tags
  const endpointsByTag = {};
  
  Object.entries(swaggerSpec.paths).forEach(([path, methods]) => {
    Object.entries(methods).forEach(([method, operation]) => {
      const tag = operation.tags?.[0] || 'Other';
      if (!endpointsByTag[tag]) {
        endpointsByTag[tag] = [];
      }
      endpointsByTag[tag].push({
        path,
        method: method.toUpperCase(),
        operation
      });
    });
  });
  
  // Create Postman items
  Object.entries(endpointsByTag).forEach(([tag, endpoints]) => {
    const folder = {
      name: tag,
      item: []
    };
    
    endpoints.forEach(({ path, method, operation }) => {
      const item = {
        name: operation.summary,
        request: {
          method: method,
          header: [
            {
              key: 'Content-Type',
              value: 'application/json'
            }
          ],
          url: {
            raw: `{{baseUrl}}${path}`,
            host: ['{{baseUrl}}'],
            path: path.split('/').filter(p => p)
          }
        }
      };
      
      // Add authorization if required
      if (operation.security) {
        item.request.header.push({
          key: 'Authorization',
          value: 'Bearer {{token}}'
        });
      }
      
      // Add request body if present
      if (operation.requestBody) {
        item.request.body = {
          mode: 'raw',
          raw: JSON.stringify(operation.requestBody.content['application/json']?.schema || {}, null, 2)
        };
      }
      
      folder.item.push(item);
    });
    
    collection.item.push(folder);
  });
  
  fs.writeFileSync(collectionPath, JSON.stringify(collection, null, 2));
  log('✅ Generated Postman collection', 'green');
}

/**
 * Show help information
 */
function showHelp() {
  logSection('📖 API Documentation Generator Help');
  
  console.log(`
Usage: node scripts/generate-api-docs.js

This script generates comprehensive API documentation including:

- OpenAPI JSON specification
- API reference markdown
- Examples and usage guides
- Postman collection

Generated files will be saved to docs/api/ directory.

Examples:
  node scripts/generate-api-docs.js
`);
}

/**
 * Main function
 */
function main() {
  const action = process.argv[2] || 'generate';
  
  switch (action) {
    case 'generate':
      generateDocs();
      break;
      
    case 'help':
    default:
      showHelp();
      break;
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  generateDocs,
  generateApiReference,
  generateExamples,
  generatePostmanCollection
}; 