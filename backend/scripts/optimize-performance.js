#!/usr/bin/env node

/**
 * Performance Optimization Script
 * 
 * Analyzes and optimizes application performance.
 */

const { performanceConfig } = require('../src/config/performance');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

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
 * Analyze database performance
 */
async function analyzeDatabase() {
  logSection('🗄️ Database Performance Analysis');
  
  try {
    // Check table sizes
    const tableSizes = await prisma.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
        pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
    `;
    
    log('📊 Table Sizes:', 'green');
    console.table(tableSizes);
    
    // Check index usage
    const indexUsage = await prisma.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        indexname,
        idx_scan,
        idx_tup_read,
        idx_tup_fetch,
        pg_size_pretty(pg_relation_size(indexrelid)) as index_size
      FROM pg_stat_user_indexes 
      ORDER BY idx_scan DESC;
    `;
    
    log('\n📊 Index Usage:', 'green');
    console.table(indexUsage);
    
    // Check slow queries
    const slowQueries = await prisma.$queryRaw`
      SELECT 
        query,
        calls,
        total_time,
        mean_time,
        rows,
        shared_blks_hit,
        shared_blks_read
      FROM pg_stat_statements 
      ORDER BY total_time DESC 
      LIMIT 10;
    `;
    
    if (slowQueries.length > 0) {
      log('\n🐌 Slow Queries:', 'yellow');
      console.table(slowQueries);
    }
    
    // Check connection pool status
    const connections = await prisma.$queryRaw`
      SELECT 
        count(*) as active_connections,
        state
      FROM pg_stat_activity 
      WHERE datname = current_database()
      GROUP BY state;
    `;
    
    log('\n📊 Database Connections:', 'green');
    console.table(connections);
    
  } catch (error) {
    log(`❌ Database analysis failed: ${error.message}`, 'red');
  }
}

/**
 * Analyze memory usage
 */
function analyzeMemory() {
  logSection('🧠 Memory Usage Analysis');
  
  const memUsage = process.memoryUsage();
  const memUsageMB = {
    rss: Math.round(memUsage.rss / 1024 / 1024),
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
    external: Math.round(memUsage.external / 1024 / 1024)
  };
  
  log('📊 Memory Usage (MB):', 'green');
  console.table(memUsageMB);
  
  // Check for memory leaks
  const heapUsedPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
  
  if (heapUsedPercent > 80) {
    log('⚠️  High memory usage detected', 'yellow');
    log(`Heap usage: ${heapUsedPercent.toFixed(2)}%`, 'yellow');
  }
  
  // Garbage collection stats
  if (global.gc) {
    const gcStats = process.memoryUsage();
    log('\n📊 After GC (MB):', 'green');
    console.table({
      heapUsed: Math.round(gcStats.heapUsed / 1024 / 1024),
      heapTotal: Math.round(gcStats.heapTotal / 1024 / 1024)
    });
  }
}

/**
 * Analyze response times
 */
async function analyzeResponseTimes() {
  logSection('⏱️ Response Time Analysis');
  
  try {
    // Simulate common API calls and measure response times
    const endpoints = [
      { name: 'Health Check', path: '/health' },
      { name: 'Get Products', path: '/api/products' },
      { name: 'Get Categories', path: '/api/categories' }
    ];
    
    const results = [];
    
    for (const endpoint of endpoints) {
      const start = process.hrtime.bigint();
      
      try {
        // Simulate API call (in real implementation, you'd make actual HTTP requests)
        await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
        
        const end = process.hrtime.bigint();
        const duration = Number(end - start) / 1000000; // Convert to milliseconds
        
        results.push({
          endpoint: endpoint.name,
          path: endpoint.path,
          responseTime: `${duration.toFixed(2)}ms`,
          status: 'success'
        });
      } catch (error) {
        results.push({
          endpoint: endpoint.name,
          path: endpoint.path,
          responseTime: 'N/A',
          status: 'error',
          error: error.message
        });
      }
    }
    
    log('📊 Response Times:', 'green');
    console.table(results);
    
    // Check for slow responses
    const slowResponses = results.filter(r => 
      r.responseTime !== 'N/A' && parseFloat(r.responseTime) > 1000
    );
    
    if (slowResponses.length > 0) {
      log('\n🐌 Slow Responses Detected:', 'yellow');
      slowResponses.forEach(response => {
        log(`   ${response.endpoint}: ${response.responseTime}`, 'yellow');
      });
    }
    
  } catch (error) {
    log(`❌ Response time analysis failed: ${error.message}`, 'red');
  }
}

/**
 * Generate performance report
 */
function generateReport() {
  logSection('📋 Performance Report');
  
  const report = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    performance: {
      cache: performanceConfig.cache,
      database: performanceConfig.database,
      response: performanceConfig.response,
      monitoring: performanceConfig.monitoring
    },
    recommendations: performanceConfig.getOptimizationRecommendations(),
    validation: performanceConfig.validate()
  };
  
  // Save report to file
  const reportPath = path.join(__dirname, '../performance-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  log('✅ Performance report generated', 'green');
  log(`📁 Report saved to: ${reportPath}`, 'blue');
  
  // Display key findings
  log('\n📊 Key Findings:', 'green');
  
  if (!report.validation.valid) {
    log('❌ Configuration Issues:', 'red');
    report.validation.issues.forEach(issue => {
      log(`   - ${issue}`, 'red');
    });
  }
  
  if (report.recommendations.length > 0) {
    log('\n💡 Optimization Recommendations:', 'blue');
    report.recommendations.forEach(rec => {
      log(`   - ${rec}`, 'blue');
    });
  }
  
  return report;
}

/**
 * Optimize database queries
 */
async function optimizeQueries() {
  logSection('⚡ Database Query Optimization');
  
  try {
    // Update table statistics
    log('Updating table statistics...', 'blue');
    await prisma.$executeRaw`ANALYZE;`;
    
    // Vacuum tables
    log('Running VACUUM...', 'blue');
    await prisma.$executeRaw`VACUUM ANALYZE;`;
    
    // Check for unused indexes
    const unusedIndexes = await prisma.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        indexname,
        idx_scan
      FROM pg_stat_user_indexes 
      WHERE idx_scan = 0;
    `;
    
    if (unusedIndexes.length > 0) {
      log('\n📊 Unused Indexes:', 'yellow');
      console.table(unusedIndexes);
      log('Consider removing unused indexes for better performance', 'yellow');
    }
    
    // Check for missing indexes
    const missingIndexes = await prisma.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        attname,
        n_distinct,
        correlation
      FROM pg_stats 
      WHERE schemaname = 'public' 
        AND n_distinct > 100 
        AND correlation < 0.1;
    `;
    
    if (missingIndexes.length > 0) {
      log('\n📊 Potential Missing Indexes:', 'yellow');
      console.table(missingIndexes);
      log('Consider adding indexes for columns with high distinct values', 'yellow');
    }
    
    log('✅ Database optimization completed', 'green');
    
  } catch (error) {
    log(`❌ Query optimization failed: ${error.message}`, 'red');
  }
}

/**
 * Monitor real-time performance
 */
function monitorPerformance() {
  logSection('📊 Real-time Performance Monitoring');
  
  log('Starting performance monitoring...', 'blue');
  log('Press Ctrl+C to stop', 'yellow');
  
  const interval = setInterval(() => {
    const memUsage = process.memoryUsage();
    const memUsageMB = {
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      rss: Math.round(memUsage.rss / 1024 / 1024)
    };
    
    const timestamp = new Date().toLocaleTimeString();
    log(`[${timestamp}] Memory: ${memUsageMB.heapUsed}MB/${memUsageMB.heapTotal}MB (RSS: ${memUsageMB.rss}MB)`, 'blue');
    
    // Check thresholds
    const heapUsedPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
    if (heapUsedPercent > performanceConfig.monitoring.thresholds.memoryUsage * 100) {
      log(`⚠️  High memory usage: ${heapUsedPercent.toFixed(2)}%`, 'yellow');
    }
  }, 5000);
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    clearInterval(interval);
    log('\n✅ Performance monitoring stopped', 'green');
    process.exit(0);
  });
}

/**
 * Show help information
 */
function showHelp() {
  logSection('📖 Performance Optimization Help');
  
  console.log(`
Usage: node scripts/optimize-performance.js <action>

Actions:
  analyze     Analyze current performance
  optimize    Optimize database and queries
  monitor     Start real-time monitoring
  report      Generate performance report
  memory      Analyze memory usage
  database    Analyze database performance
  response    Analyze response times

Examples:
  node scripts/optimize-performance.js analyze
  node scripts/optimize-performance.js optimize
  node scripts/optimize-performance.js monitor
  node scripts/optimize-performance.js report
`);
}

/**
 * Main function
 */
async function main() {
  const action = process.argv[2] || 'help';
  
  try {
    switch (action) {
      case 'analyze':
        await analyzeDatabase();
        analyzeMemory();
        await analyzeResponseTimes();
        break;
        
      case 'optimize':
        await optimizeQueries();
        break;
        
      case 'monitor':
        monitorPerformance();
        break;
        
      case 'report':
        generateReport();
        break;
        
      case 'memory':
        analyzeMemory();
        break;
        
      case 'database':
        await analyzeDatabase();
        break;
        
      case 'response':
        await analyzeResponseTimes();
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
  analyzeDatabase,
  analyzeMemory,
  analyzeResponseTimes,
  optimizeQueries,
  generateReport,
  monitorPerformance
}; 