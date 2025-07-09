#!/usr/bin/env node

/**
 * Database Optimization Script
 * 
 * Performance tuning and maintenance operations for the CommerFlow database.
 */

const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

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

const prisma = new PrismaClient();

/**
 * Generate and apply database migrations
 */
async function migrate() {
  logSection('🔄 Database Migration');
  
  try {
    log('Generating migration...', 'blue');
    execSync('npx prisma migrate dev --name optimize-schema', { stdio: 'inherit' });
    
    log('Generating Prisma client...', 'blue');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    log('✅ Migration completed successfully', 'green');
  } catch (error) {
    log(`❌ Migration failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

/**
 * Analyze database performance
 */
async function analyze() {
  logSection('📊 Database Performance Analysis');
  
  try {
    // Get table statistics
    const stats = await prisma.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        attname,
        n_distinct,
        correlation
      FROM pg_stats 
      WHERE schemaname = 'public'
      ORDER BY tablename, attname;
    `;
    
    log('📋 Table Statistics:', 'green');
    console.table(stats);
    
    // Get index usage
    const indexUsage = await prisma.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        indexname,
        idx_scan,
        idx_tup_read,
        idx_tup_fetch
      FROM pg_stat_user_indexes 
      ORDER BY idx_scan DESC;
    `;
    
    log('\n📋 Index Usage Statistics:', 'green');
    console.table(indexUsage);
    
    // Get slow queries (if available)
    const slowQueries = await prisma.$queryRaw`
      SELECT 
        query,
        calls,
        total_time,
        mean_time,
        rows
      FROM pg_stat_statements 
      ORDER BY total_time DESC 
      LIMIT 10;
    `;
    
    if (slowQueries.length > 0) {
      log('\n🐌 Slow Queries:', 'yellow');
      console.table(slowQueries);
    }
    
  } catch (error) {
    log(`❌ Analysis failed: ${error.message}`, 'red');
  }
}

/**
 * Optimize database performance
 */
async function optimize() {
  logSection('⚡ Database Optimization');
  
  try {
    // Update table statistics
    log('Updating table statistics...', 'blue');
    await prisma.$executeRaw`ANALYZE;`;
    
    // Vacuum tables
    log('Running VACUUM...', 'blue');
    await prisma.$executeRaw`VACUUM ANALYZE;`;
    
    // Reindex if needed
    log('Checking for index fragmentation...', 'blue');
    const fragmentedIndexes = await prisma.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        indexname,
        idx_scan,
        idx_tup_read
      FROM pg_stat_user_indexes 
      WHERE idx_scan = 0;
    `;
    
    if (fragmentedIndexes.length > 0) {
      log('Found unused indexes:', 'yellow');
      console.table(fragmentedIndexes);
      
      log('Consider removing unused indexes for better performance', 'yellow');
    }
    
    log('✅ Database optimization completed', 'green');
    
  } catch (error) {
    log(`❌ Optimization failed: ${error.message}`, 'red');
  }
}

/**
 * Create database backup
 */
async function backup() {
  logSection('💾 Database Backup');
  
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = `backup-${timestamp}.sql`;
    
    log(`Creating backup: ${backupFile}`, 'blue');
    
    // Get database URL from environment
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error('DATABASE_URL not found in environment');
    }
    
    // Extract connection details
    const url = new URL(dbUrl);
    const host = url.hostname;
    const port = url.port || 5432;
    const database = url.pathname.slice(1);
    const username = url.username;
    const password = url.password;
    
    // Create backup command
    const backupCmd = `PGPASSWORD="${password}" pg_dump -h ${host} -p ${port} -U ${username} -d ${database} --clean --if-exists --no-owner --no-privileges > ${backupFile}`;
    
    execSync(backupCmd, { stdio: 'inherit' });
    
    log(`✅ Backup created: ${backupFile}`, 'green');
    
  } catch (error) {
    log(`❌ Backup failed: ${error.message}`, 'red');
  }
}

/**
 * Reset database (destructive)
 */
async function reset() {
  logSection('⚠️  Database Reset');
  
  log('⚠️  This will delete ALL data!', 'red');
  log('Are you sure you want to continue? (yes/no)', 'yellow');
  
  // In a real implementation, you'd want to prompt for confirmation
  // For now, we'll just show the warning
  log('Database reset aborted for safety', 'yellow');
  log('To reset the database, run: npx prisma migrate reset', 'blue');
}

/**
 * Seed database with sample data
 */
async function seed() {
  logSection('🌱 Database Seeding');
  
  try {
    log('Adding sample products...', 'blue');
    execSync('node add-sample-products.js', { stdio: 'inherit' });
    
    log('✅ Database seeding completed', 'green');
    
  } catch (error) {
    log(`❌ Seeding failed: ${error.message}`, 'red');
  }
}

/**
 * Show database schema
 */
async function schema() {
  logSection('🏗️ Database Schema');
  
  try {
    // Get table information
    const tables = await prisma.$queryRaw`
      SELECT 
        table_name,
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position;
    `;
    
    log('📋 Database Tables:', 'green');
    console.table(tables);
    
    // Get index information
    const indexes = await prisma.$queryRaw`
      SELECT 
        tablename,
        indexname,
        indexdef
      FROM pg_indexes 
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname;
    `;
    
    log('\n📋 Database Indexes:', 'green');
    console.table(indexes);
    
  } catch (error) {
    log(`❌ Schema analysis failed: ${error.message}`, 'red');
  }
}

/**
 * Show help information
 */
function showHelp() {
  logSection('📖 Database Optimization Help');
  
  console.log(`
Usage: node scripts/optimize-db.js <action>

Actions:
  migrate     Generate and apply database migrations
  analyze     Analyze database performance
  optimize    Optimize database performance
  backup      Create database backup
  reset       Reset database (⚠️ destructive)
  seed        Seed database with sample data
  schema      Show database schema

Examples:
  node scripts/optimize-db.js migrate
  node scripts/optimize-db.js analyze
  node scripts/optimize-db.js optimize
  node scripts/optimize-db.js backup
  node scripts/optimize-db.js schema
`);
}

/**
 * Main function
 */
async function main() {
  const action = process.argv[2] || 'help';
  
  try {
    switch (action) {
      case 'migrate':
        await migrate();
        break;
        
      case 'analyze':
        await analyze();
        break;
        
      case 'optimize':
        await optimize();
        break;
        
      case 'backup':
        await backup();
        break;
        
      case 'reset':
        await reset();
        break;
        
      case 'seed':
        await seed();
        break;
        
      case 'schema':
        await schema();
        break;
        
      case 'help':
      default:
        showHelp();
        break;
    }
  } catch (error) {
    log(`❌ Operation failed: ${error.message}`, 'red');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  migrate,
  analyze,
  optimize,
  backup,
  reset,
  seed,
  schema
}; 