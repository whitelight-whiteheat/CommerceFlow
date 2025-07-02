# 🚂 Railway Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the EcommerceMVP to Railway using the new centralized configuration system.

## Prerequisites

- Railway account
- GitHub repository connected to Railway
- Railway CLI (optional but recommended)

## 🚀 Quick Deployment

### 1. **Connect Repository to Railway**

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your EcommerceMVP repository
4. Railway will automatically detect the backend and frontend

### 2. **Set Up Environment Variables**

#### **Backend Service Environment Variables**

In your Railway backend service, add these environment variables:

```bash
# REQUIRED - Database (Railway PostgreSQL service)
DATABASE_URL=postgresql://postgres:${PASSWORD}@${HOST}:${PORT}/${DATABASE}

# REQUIRED - JWT Secret (must be this exact value)
JWT_SECRET=b40c000ecd38bca4e57e6945e411207843b6945830d81fb4aa24c6f51d11251b

# JWT Configuration
JWT_EXPIRES_IN=24h
JWT_ISSUER=ecommerce-api
JWT_AUDIENCE=ecommerce-users

# Server Configuration
NODE_ENV=production
PORT=3001

# Frontend URL (your Railway frontend service URL)
FRONTEND_URL=https://your-frontend-service-name.up.railway.app
CORS_ORIGIN=https://your-frontend-service-name.up.railway.app

# Admin Configuration (CHANGE THESE!)
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=your-secure-admin-password

# Security Configuration
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Performance Configuration
CACHE_TTL=300000
ENABLE_METRICS=true
METRICS_PORT=9090

# Logging Configuration
LOG_LEVEL=info
LOG_FORMAT=combined
```

#### **Frontend Service Environment Variables**

In your Railway frontend service, add:

```bash
# API URL (your Railway backend service URL)
REACT_APP_API_URL=https://your-backend-service-name.up.railway.app/api

# Environment
NODE_ENV=production
```

### 3. **Database Setup**

1. **Add PostgreSQL Service:**
   - In Railway dashboard, click "New Service" → "Database" → "PostgreSQL"
   - Railway will automatically provide the `DATABASE_URL`

2. **Connect Backend to Database:**
   - In your backend service settings, add the `DATABASE_URL` from the PostgreSQL service
   - The backend will automatically run migrations on startup

### 4. **Deploy**

1. **Backend Deployment:**
   - Railway will automatically build and deploy when you push to GitHub
   - The backend will run `npm run setup` then `npm start`
   - Check logs for any environment validation errors

2. **Frontend Deployment:**
   - Railway will build and deploy the frontend
   - Ensure `REACT_APP_API_URL` points to your backend service

## 🔧 Railway-Specific Configuration

### **Backend Service Settings**

- **Build Command:** `npm install && npx prisma generate`
- **Start Command:** `npm run setup && npm start`
- **Health Check:** `/health`
- **Port:** `3001`

### **Frontend Service Settings**

- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- **Health Check:** `/`
- **Port:** `3000`

## 🛠️ Troubleshooting

### **Common Issues**

1. **Environment Validation Failed**
   ```
   ❌ Environment validation failed: JWT_SECRET must be set to the required value
   ```
   **Solution:** Ensure `JWT_SECRET` is set to the exact required value

2. **Database Connection Failed**
   ```
   ❌ Database connection failed: P1001
   ```
   **Solution:** Check that `DATABASE_URL` is correctly set from Railway PostgreSQL service

3. **CORS Errors**
   ```
   ❌ Not allowed by CORS
   ```
   **Solution:** Ensure `FRONTEND_URL` and `CORS_ORIGIN` match your frontend service URL

4. **Admin Login Fails**
   ```
   ❌ Invalid admin credentials
   ```
   **Solution:** Check `ADMIN_EMAIL` and `ADMIN_PASSWORD` are set correctly

### **Railway CLI Commands**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Link project
railway link

# View logs
railway logs

# Set environment variables
railway variables set JWT_SECRET=b40c000ecd38bca4e57e6945e411207843b6945830d81fb4aa24c6f51d11251b

# Deploy
railway up
```

## 🔒 Security Checklist

- ✅ **JWT_SECRET** set to required value
- ✅ **ADMIN_EMAIL** and **ADMIN_PASSWORD** changed from defaults
- ✅ **DATABASE_URL** from Railway PostgreSQL service
- ✅ **FRONTEND_URL** and **CORS_ORIGIN** match your frontend URL
- ✅ **NODE_ENV** set to `production`

## 📊 Monitoring

### **Health Checks**

- **Backend:** `https://your-backend-service.up.railway.app/health`
- **Frontend:** `https://your-frontend-service.up.railway.app/`

### **Railway Dashboard**

- Monitor service health in Railway dashboard
- View logs for debugging
- Check resource usage
- Monitor database connections

## 🚀 Production URLs

After deployment, your services will be available at:

- **Backend API:** `https://your-backend-service-name.up.railway.app`
- **Frontend:** `https://your-frontend-service-name.up.railway.app`
- **API Documentation:** `https://your-backend-service-name.up.railway.app/api-docs`

## 🔄 Updates and Maintenance

### **Updating Environment Variables**

1. Go to Railway dashboard
2. Select your service
3. Go to "Variables" tab
4. Add/update environment variables
5. Railway will automatically redeploy

### **Database Migrations**

The backend automatically runs migrations on startup. For manual migrations:

```bash
# Connect to Railway service
railway shell

# Run migrations
npx prisma migrate deploy
```

### **Scaling**

- **Vertical Scaling:** Adjust CPU/Memory in Railway dashboard
- **Horizontal Scaling:** Add more instances in Railway dashboard
- **Database Scaling:** Railway PostgreSQL automatically scales

---

**🎉 Your EcommerceMVP is now deployed on Railway with centralized configuration!** 