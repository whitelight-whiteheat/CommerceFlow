# CommerceFlow Scripts

This directory contains utility scripts for development, testing, and deployment.

## 📁 Scripts Overview

### 🧪 Testing Scripts
- **test-backend-health.js** - Test backend health endpoint
- **test-env.js** - Test environment configuration
- **test-integration.js** - Integration testing utilities
- **test-jwt-fix.js** - JWT token testing and debugging
- **test-phase4.js** - Phase 4 specific testing

### 🔧 Development Scripts
These scripts are located in `backend/scripts/` and include:
- Database setup and migration scripts
- Admin user creation scripts
- Product seeding scripts
- Environment configuration scripts
- Deployment utilities

## 🚀 Usage

### Running Test Scripts
```bash
# From project root
node scripts/test-backend-health.js
node scripts/test-env.js
node scripts/test-integration.js
node scripts/test-jwt-fix.js
node scripts/test-phase4.js
```

### Running Backend Scripts
```bash
# From project root
cd backend
node scripts/setup-admin.js
node scripts/add-sample-products.js
node scripts/debug-dashboard.js
```

## 📋 Script Descriptions

### Test Scripts

#### test-backend-health.js
Tests the backend health endpoint to ensure the API is running correctly.

#### test-env.js
Validates environment configuration and checks for required variables.

#### test-integration.js
Performs integration tests between frontend and backend components.

#### test-jwt-fix.js
Tests JWT token generation, validation, and debugging utilities.

#### test-phase4.js
Comprehensive testing for Phase 4 features and functionality.

### Backend Scripts (in backend/scripts/)

#### setup-admin.js
Creates admin user accounts with proper permissions.

#### add-sample-products.js
Seeds the database with sample product data.

#### debug-dashboard.js
Debugging utilities for the admin dashboard.

#### create-admin.js
Alternative admin user creation script.

#### fix-env.js
Environment variable configuration and validation.

## 🔧 Development Workflow

1. **Setup**: Use `backend/scripts/setup-admin.js` to create initial admin user
2. **Seeding**: Use `backend/scripts/add-sample-products.js` to add test data
3. **Testing**: Run test scripts to validate functionality
4. **Debugging**: Use debug scripts for troubleshooting

## 📝 Adding New Scripts

When adding new scripts:

1. Place them in the appropriate directory (`scripts/` for project-wide, `backend/scripts/` for backend-specific)
2. Add a description to this README
3. Include proper error handling and logging
4. Add usage examples in comments

## 🔒 Security Notes

- Scripts may contain sensitive operations (user creation, database seeding)
- Always review scripts before running in production
- Use environment variables for sensitive data
- Test scripts in development environment first

---

*Last updated: July 2025* 