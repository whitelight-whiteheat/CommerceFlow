# Backend Scripts

This directory contains various utility scripts for development, testing, and setup.

## Setup Scripts

### Database & Admin Setup
- `complete-setup.js` - Complete initial setup including database, admin user, and sample data
- `final-setup.js` - Final setup script for production deployment
- `setup-admin.js` - Creates admin user in the database
- `setup-admin-container.js` - Creates admin user in containerized environment
- `create-admin.js` - Alternative admin creation script
- `create-admin-simple.js` - Simplified admin creation
- `simple-admin.js` - Basic admin setup

### Environment Configuration
- `fix-env.js` - Fixes environment variables
- `fix-env-container.js` - Fixes environment variables for containers
- `fix-env-localhost.js` - Fixes environment variables for localhost

### Container Management
- `run-backend-in-container.js` - Runs backend in Docker container
- `run-in-container.js` - Generic container runner
- `docker-prisma-setup.sh` - Shell script for Prisma setup in Docker

## Test Scripts

### Authentication Tests
- `test-auth.js` - Tests authentication middleware
- `test-login.js` - Tests login functionality
- `test-login-direct.js` - Direct database login test
- `test-admin-login.js` - Admin login test
- `test-admin-in-container.js` - Admin login test in container
- `test-api-login.js` - API login endpoint test

### Database Tests
- `test-db-connection.js` - Tests database connectivity
- `debug-prisma.js` - Prisma debugging script

### API Tests
- `test-admin-dashboard.js` - Tests admin dashboard API
- `test-order.js` - Tests order functionality
- `test-api.html` - HTML file for API testing

### Database Files
- `create-admin.sql` - SQL script for admin user creation

## Usage

Most scripts can be run directly with Node.js:

```bash
# Run a setup script
node scripts/complete-setup.js

# Run a test script
node scripts/test-login.js

# Run in container
docker exec ecommerce-app node scripts/test-admin-in-container.js
```

## Notes

- These scripts are for development and testing purposes
- Some scripts modify the database - use with caution
- Container scripts require Docker to be running
- Test scripts may require the backend to be running 