# CommerceFlow - Production Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the CommerceFlow platform to production.

## Prerequisites

- Docker and Docker Compose installed
- PostgreSQL database (local or cloud)
- Railway account (for deployment)
- GitHub repository set up

## Quick Deployment

### 1. Clone Repository
```bash
git clone https://github.com/your-username/CommerceFlow.git
cd CommerceFlow
```

### 2. Environment Setup
```bash
# Backend environment
cd backend
cp env.production.example .env
# Edit .env with your production values

# Frontend environment
cd ../frontend
cp .env.example .env
# Edit .env with your API URL
```

### 3. Database Setup
```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

### 4. Docker Deployment
```bash
# Production build
docker-compose -f docker-compose.prod.yml up -d

# Development build
docker-compose up -d
```

## Railway Deployment

### 1. Backend Deployment
- Connect your CommerceFlow repository to Railway
- Set environment variables:
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `NODE_ENV=production`
- Deploy backend service

### 2. Frontend Deployment
- Create new Railway service for frontend
- Set build command: `npm run build`
- Set environment variables:
  - `REACT_APP_API_URL`
- Deploy frontend service

### 3. Database Setup
- Create PostgreSQL service in Railway
- Run migrations:
  ```bash
  npx prisma migrate deploy
  npx prisma generate
  ```

## Configuration

### Environment Variables

#### Backend (.env)
```env
DATABASE_URL="postgresql://username:password@host:port/database"
JWT_SECRET="your-secure-jwt-secret"
PORT=5000
NODE_ENV=production
REDIS_URL="redis://localhost:6379"
```

#### Frontend (.env)
```env
REACT_APP_API_URL=https://your-backend-url.railway.app
REACT_APP_ENV=production
```

### Docker Configuration

#### docker-compose.prod.yml
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
    depends_on:
      - postgres
      - redis

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:5000

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: commerceflow
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

## 🔒 Security Configuration

### SSL/HTTPS
- Railway automatically provides SSL certificates
- Configure custom domain if needed
- Update CORS settings for production

### Environment Security
- Use strong JWT secrets
- Secure database credentials
- Enable rate limiting
- Configure proper CORS origins

## 📊 Monitoring

### Health Checks
- Backend: `/health` endpoint
- Frontend: Built-in React health checks
- Database: Connection monitoring

### Performance Monitoring
- API response times
- Database query performance
- Cache hit rates
- Error rates

## 🔄 CI/CD Pipeline

### GitHub Actions
```yaml
name: Deploy to Railway
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        uses: railway/deploy@v1
        with:
          service: commerceflow-backend
```

## 🚨 Troubleshooting

### Common Issues
1. **Database Connection**: Check DATABASE_URL format
2. **CORS Errors**: Verify frontend API URL
3. **Build Failures**: Check Node.js version compatibility
4. **Environment Variables**: Ensure all required vars are set

### Debug Commands
```bash
# Check backend logs
docker-compose logs backend

# Check database connection
npx prisma db push

# Test API endpoints
curl https://your-api-url.railway.app/health
```

## 📈 Performance Optimization

### Caching Strategy
- Redis for session storage
- In-memory caching for frequently accessed data
- Database query optimization

### Database Optimization
- Proper indexing
- Query optimization
- Connection pooling

### Frontend Optimization
- Code splitting
- Bundle optimization
- Image compression

## 🔄 Updates and Maintenance

### Regular Updates
- Security patches
- Dependency updates
- Performance monitoring
- Backup verification

### Backup Strategy
- Database backups
- Configuration backups
- Code repository backups

## 📞 Support

For deployment issues:
- Check Railway documentation
- Review application logs
- Verify environment configuration
- Test locally before deploying

---

**CommerceFlow** - Seamless commerce experiences, powered by modern technology. 