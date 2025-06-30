#!/bin/bash

# Production Deployment Script for Ecommerce MVP
# This script automates the deployment process

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required environment variables are set
check_env_vars() {
    print_status "Checking environment variables..."
    
    required_vars=(
        "POSTGRES_PASSWORD"
        "JWT_SECRET"
        "FRONTEND_URL"
        "REDIS_PASSWORD"
    )
    
    missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        print_error "Missing required environment variables:"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
        exit 1
    fi
    
    print_status "All required environment variables are set"
}

# Backup database
backup_database() {
    print_status "Creating database backup..."
    
    if [ -d "backups" ]; then
        timestamp=$(date +"%Y%m%d_%H%M%S")
        backup_file="backups/db_backup_$timestamp.sql"
        
        docker exec ecommerce-postgres-prod pg_dump -U ecommerce_user ecommerce_prod > "$backup_file"
        print_status "Database backup created: $backup_file"
    else
        print_warning "Backups directory not found, skipping backup"
    fi
}

# Stop existing containers
stop_containers() {
    print_status "Stopping existing containers..."
    
    docker-compose -f docker-compose.prod.yml down --remove-orphans || true
    print_status "Existing containers stopped"
}

# Build and start containers
start_containers() {
    print_status "Building and starting containers..."
    
    # Build images
    docker-compose -f docker-compose.prod.yml build --no-cache
    
    # Start services
    docker-compose -f docker-compose.prod.yml up -d
    
    print_status "Containers started successfully"
}

# Wait for services to be ready
wait_for_services() {
    print_status "Waiting for services to be ready..."
    
    # Wait for database
    print_status "Waiting for database..."
    timeout=60
    while [ $timeout -gt 0 ]; do
        if docker exec ecommerce-postgres-prod pg_isready -U ecommerce_user -d ecommerce_prod > /dev/null 2>&1; then
            print_status "Database is ready"
            break
        fi
        sleep 1
        timeout=$((timeout - 1))
    done
    
    if [ $timeout -eq 0 ]; then
        print_error "Database failed to start within 60 seconds"
        exit 1
    fi
    
    # Wait for application
    print_status "Waiting for application..."
    timeout=60
    while [ $timeout -gt 0 ]; do
        if curl -f http://localhost:3001/health > /dev/null 2>&1; then
            print_status "Application is ready"
            break
        fi
        sleep 1
        timeout=$((timeout - 1))
    done
    
    if [ $timeout -eq 0 ]; then
        print_error "Application failed to start within 60 seconds"
        exit 1
    fi
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    docker exec ecommerce-app-prod npx prisma migrate deploy
    print_status "Database migrations completed"
}

# Health check
health_check() {
    print_status "Performing health checks..."
    
    # Check application health
    if curl -f http://localhost:3001/health > /dev/null 2>&1; then
        print_status "Application health check passed"
    else
        print_error "Application health check failed"
        exit 1
    fi
    
    # Check database connection
    if docker exec ecommerce-app-prod node -e "
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        prisma.\$connect().then(() => {
            console.log('Database connection successful');
            process.exit(0);
        }).catch((error) => {
            console.error('Database connection failed:', error);
            process.exit(1);
        });
    " > /dev/null 2>&1; then
        print_status "Database connection check passed"
    else
        print_error "Database connection check failed"
        exit 1
    fi
}

# Show deployment status
show_status() {
    print_status "Deployment completed successfully!"
    echo ""
    echo "Services Status:"
    docker-compose -f docker-compose.prod.yml ps
    echo ""
    echo "Application URL: http://localhost:3001"
    echo "Health Check: http://localhost:3001/health"
    echo ""
    echo "Logs can be viewed with:"
    echo "  docker-compose -f docker-compose.prod.yml logs -f"
}

# Main deployment function
main() {
    print_status "Starting production deployment..."
    
    check_env_vars
    backup_database
    stop_containers
    start_containers
    wait_for_services
    run_migrations
    health_check
    show_status
    
    print_status "Deployment completed successfully!"
}

# Run main function
main "$@" 