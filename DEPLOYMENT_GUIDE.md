# Ecommerce MVP - Production Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the Ecommerce MVP to production.

## Prerequisites

- Docker and Docker Compose installed
- A server with at least 2GB RAM and 20GB storage
- Domain name (optional but recommended)
- SSL certificate (for HTTPS)

## Environment Setup

### 1. Set Environment Variables

Create a `.env` file in the backend directory with the following variables:

```bash
# Database
POSTGRES_PASSWORD=your_secure_password_here

# JWT
JWT_SECRET=your_very_long_random_secret_here

# Frontend URL
FRONTEND_URL=https://your-domain.com

# Redis
REDIS_PASSWORD=your_redis_password_here
```

### 2. Generate Secure Secrets

```bash
# Generate JWT secret
openssl rand -hex 64

# Generate database password
openssl rand -base64 32

# Generate Redis password
openssl rand -base64 32
```

## Deployment Steps

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/EcommerceMVP.git
cd EcommerceMVP
```

### 2. Build Frontend

```bash
cd frontend
npm install
npm run build
cd ..
```

### 3. Deploy with Docker Compose

```bash
cd backend
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

### 4. Verify Deployment

```bash
# Check container status
docker-compose -f docker-compose.prod.yml ps

# Check application health
curl http://localhost:3001/health

# Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

## SSL/HTTPS Setup

### Using Let's Encrypt

1. Install Certbot:
```bash
sudo apt update
sudo apt install certbot
```

2. Obtain SSL certificate:
```bash
sudo certbot certonly --standalone -d your-domain.com
```

3. Update nginx configuration to use SSL certificates.

## Monitoring and Maintenance

### Health Checks

The application includes built-in health checks:

- Application: `http://your-domain.com/health`
- Database: Automatic health checks in Docker
- Redis: Automatic health checks in Docker

### Logs

View logs for different services:

```bash
# Application logs
docker-compose -f docker-compose.prod.yml logs -f app

# Database logs
docker-compose -f docker-compose.prod.yml logs -f postgres

# Nginx logs
docker-compose -f docker-compose.prod.yml logs -f nginx
```

### Performance Monitoring

Access performance metrics (admin only):

```bash
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  http://your-domain.com/api/products/metrics/performance
```

### Database Backups

Set up automated backups:

```bash
# Create backup directory
mkdir -p backups

# Manual backup
docker exec ecommerce-postgres-prod pg_dump -U ecommerce_user ecommerce_prod > backups/backup_$(date +%Y%m%d_%H%M%S).sql

# Automated backup (add to crontab)
0 2 * * * docker exec ecommerce-postgres-prod pg_dump -U ecommerce_user ecommerce_prod > /path/to/backups/backup_$(date +\%Y\%m\%d).sql
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check if PostgreSQL container is running
   - Verify DATABASE_URL in environment variables
   - Check database logs

2. **Application Won't Start**
   - Check application logs
   - Verify all environment variables are set
   - Ensure ports are not in use

3. **Performance Issues**
   - Check resource usage: `docker stats`
   - Review performance metrics
   - Consider scaling resources

### Rollback Procedure

If deployment fails, rollback to previous version:

```bash
# Stop current deployment
docker-compose -f docker-compose.prod.yml down

# Restore from backup
docker exec -i ecommerce-postgres-prod psql -U ecommerce_user ecommerce_prod < backups/backup_YYYYMMDD.sql

# Restart with previous image
docker-compose -f docker-compose.prod.yml up -d
```

## Security Considerations

1. **Firewall Configuration**
   - Only expose necessary ports (80, 443)
   - Block direct database access
   - Use VPN for admin access

2. **Regular Updates**
   - Keep Docker images updated
   - Regularly update dependencies
   - Monitor security advisories

3. **Access Control**
   - Use strong passwords
   - Implement rate limiting
   - Monitor access logs

## Scaling

### Horizontal Scaling

To scale the application:

```bash
# Scale application instances
docker-compose -f docker-compose.prod.yml up -d --scale app=3

# Add load balancer configuration
```

### Vertical Scaling

Update resource limits in `docker-compose.prod.yml`:

```yaml
deploy:
  resources:
    limits:
      memory: 1G
      cpus: '1.0'
```

## Support

For issues and questions:

1. Check the logs first
2. Review this deployment guide
3. Check the main README.md
4. Open an issue on GitHub

## Performance Optimization

### Production Optimizations

1. **Database Indexing**
   - Ensure proper indexes on frequently queried columns
   - Monitor slow queries

2. **Caching**
   - Redis is configured for caching
   - Monitor cache hit rates

3. **CDN**
   - Consider using a CDN for static assets
   - Configure proper cache headers

### Monitoring Setup

Consider setting up monitoring tools:

- Prometheus for metrics
- Grafana for visualization
- AlertManager for notifications

## Backup and Recovery

### Automated Backups

Set up automated backup scripts:

```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
docker exec ecommerce-postgres-prod pg_dump -U ecommerce_user ecommerce_prod > backups/backup_$DATE.sql
# Keep only last 7 days of backups
find backups -name "backup_*.sql" -mtime +7 -delete
```

### Recovery Procedure

To restore from backup:

```bash
# Stop application
docker-compose -f docker-compose.prod.yml down

# Restore database
docker exec -i ecommerce-postgres-prod psql -U ecommerce_user ecommerce_prod < backups/backup_YYYYMMDD.sql

# Restart application
docker-compose -f docker-compose.prod.yml up -d
``` 