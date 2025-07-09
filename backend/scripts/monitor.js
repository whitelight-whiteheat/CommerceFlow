#!/usr/bin/env node

/**
 * CommerFlow Monitoring Script
 * 
 * Collects metrics, generates reports, and manages alerts for the application.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

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
  console.log(`\n${colors.bold}${colors.blue}${'='.repeat(60)}`);
  console.log(`${title}`);
  console.log(`${'='.repeat(60)}${colors.reset}`);
}

/**
 * System Metrics Collection
 */
class SystemMetrics {
  constructor() {
    this.metrics = {
      timestamp: new Date().toISOString(),
      cpu: {},
      memory: {},
      disk: {},
      network: {}
    };
  }
  
  /**
   * Collect CPU metrics
   */
  collectCPUMetrics() {
    try {
      const cpus = os.cpus();
      const totalIdle = cpus.reduce((acc, cpu) => acc + cpu.times.idle, 0);
      const totalTick = cpus.reduce((acc, cpu) => 
        acc + cpu.times.user + cpu.times.nice + cpu.times.sys + cpu.times.idle + cpu.times.irq, 0);
      
      const idle = totalIdle / cpus.length;
      const total = totalTick / cpus.length;
      const usage = 100 - (100 * idle / total);
      
      this.metrics.cpu = {
        usage: Math.round(usage * 100) / 100,
        cores: cpus.length,
        model: cpus[0].model,
        loadAverage: os.loadavg()
      };
      
      log(`CPU Usage: ${this.metrics.cpu.usage}%`, 'blue');
      
    } catch (error) {
      log(`❌ CPU metrics collection failed: ${error.message}`, 'red');
    }
  }
  
  /**
   * Collect memory metrics
   */
  collectMemoryMetrics() {
    try {
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;
      const usage = (usedMem / totalMem) * 100;
      
      this.metrics.memory = {
        total: totalMem,
        used: usedMem,
        free: freeMem,
        usage: Math.round(usage * 100) / 100
      };
      
      log(`Memory Usage: ${this.metrics.memory.usage}%`, 'blue');
      
    } catch (error) {
      log(`❌ Memory metrics collection failed: ${error.message}`, 'red');
    }
  }
  
  /**
   * Collect disk metrics
   */
  collectDiskMetrics() {
    try {
      // This is a simplified version - in production you'd use a proper disk monitoring library
      const diskUsage = execSync('df -h / | tail -1', { encoding: 'utf8' });
      const parts = diskUsage.trim().split(/\s+/);
      
      this.metrics.disk = {
        total: parts[1],
        used: parts[2],
        available: parts[3],
        usagePercent: parseInt(parts[4].replace('%', ''))
      };
      
      log(`Disk Usage: ${this.metrics.disk.usagePercent}%`, 'blue');
      
    } catch (error) {
      log(`⚠️  Disk metrics collection failed: ${error.message}`, 'yellow');
      this.metrics.disk = { error: error.message };
    }
  }
  
  /**
   * Collect all system metrics
   */
  collectAll() {
    this.collectCPUMetrics();
    this.collectMemoryMetrics();
    this.collectDiskMetrics();
    
    return this.metrics;
  }
}

/**
 * Application Metrics Collection
 */
class ApplicationMetrics {
  constructor() {
    this.metrics = {
      timestamp: new Date().toISOString(),
      requests: {},
      errors: {},
      performance: {},
      database: {}
    };
  }
  
  /**
   * Collect request metrics
   */
  collectRequestMetrics() {
    try {
      // This would typically come from your application's metrics endpoint
      // For demo purposes, we'll simulate some metrics
      const totalRequests = Math.floor(Math.random() * 1000) + 100;
      const errorRequests = Math.floor(Math.random() * 50);
      const successRequests = totalRequests - errorRequests;
      
      this.metrics.requests = {
        total: totalRequests,
        success: successRequests,
        errors: errorRequests,
        successRate: Math.round((successRequests / totalRequests) * 10000) / 100
      };
      
      log(`Request Success Rate: ${this.metrics.requests.successRate}%`, 'blue');
      
    } catch (error) {
      log(`❌ Request metrics collection failed: ${error.message}`, 'red');
    }
  }
  
  /**
   * Collect performance metrics
   */
  collectPerformanceMetrics() {
    try {
      // Simulate performance metrics
      const responseTimes = [
        Math.random() * 100 + 50,  // 50-150ms
        Math.random() * 200 + 100, // 100-300ms
        Math.random() * 500 + 200, // 200-700ms
        Math.random() * 1000 + 500 // 500-1500ms
      ];
      
      const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const maxResponseTime = Math.max(...responseTimes);
      const minResponseTime = Math.min(...responseTimes);
      
      this.metrics.performance = {
        averageResponseTime: Math.round(avgResponseTime),
        maxResponseTime: Math.round(maxResponseTime),
        minResponseTime: Math.round(minResponseTime),
        throughput: Math.floor(Math.random() * 100) + 50 // requests per minute
      };
      
      log(`Average Response Time: ${this.metrics.performance.averageResponseTime}ms`, 'blue');
      
    } catch (error) {
      log(`❌ Performance metrics collection failed: ${error.message}`, 'red');
    }
  }
  
  /**
   * Collect database metrics
   */
  collectDatabaseMetrics() {
    try {
      // Simulate database metrics
      this.metrics.database = {
        connections: Math.floor(Math.random() * 20) + 5,
        maxConnections: 20,
        activeQueries: Math.floor(Math.random() * 10) + 1,
        slowQueries: Math.floor(Math.random() * 3),
        deadlocks: Math.floor(Math.random() * 2)
      };
      
      const connectionUsage = (this.metrics.database.connections / this.metrics.database.maxConnections) * 100;
      log(`Database Connection Usage: ${Math.round(connectionUsage)}%`, 'blue');
      
    } catch (error) {
      log(`❌ Database metrics collection failed: ${error.message}`, 'red');
    }
  }
  
  /**
   * Collect all application metrics
   */
  collectAll() {
    this.collectRequestMetrics();
    this.collectPerformanceMetrics();
    this.collectDatabaseMetrics();
    
    return this.metrics;
  }
}

/**
 * Business Metrics Collection
 */
class BusinessMetrics {
  constructor() {
    this.metrics = {
      timestamp: new Date().toISOString(),
      orders: {},
      revenue: {},
      users: {},
      products: {}
    };
  }
  
  /**
   * Collect order metrics
   */
  collectOrderMetrics() {
    try {
      // Simulate order metrics
      const totalOrders = Math.floor(Math.random() * 100) + 50;
      const completedOrders = Math.floor(totalOrders * 0.9);
      const pendingOrders = totalOrders - completedOrders;
      
      this.metrics.orders = {
        total: totalOrders,
        completed: completedOrders,
        pending: pendingOrders,
        completionRate: Math.round((completedOrders / totalOrders) * 10000) / 100
      };
      
      log(`Order Completion Rate: ${this.metrics.orders.completionRate}%`, 'blue');
      
    } catch (error) {
      log(`❌ Order metrics collection failed: ${error.message}`, 'red');
    }
  }
  
  /**
   * Collect revenue metrics
   */
  collectRevenueMetrics() {
    try {
      // Simulate revenue metrics
      const totalRevenue = Math.floor(Math.random() * 10000) + 5000;
      const averageOrderValue = Math.floor(totalRevenue / (this.metrics.orders.total || 1));
      
      this.metrics.revenue = {
        total: totalRevenue,
        averageOrderValue: averageOrderValue,
        dailyTarget: 10000,
        targetAchievement: Math.round((totalRevenue / 10000) * 10000) / 100
      };
      
      log(`Revenue Target Achievement: ${this.metrics.revenue.targetAchievement}%`, 'blue');
      
    } catch (error) {
      log(`❌ Revenue metrics collection failed: ${error.message}`, 'red');
    }
  }
  
  /**
   * Collect user metrics
   */
  collectUserMetrics() {
    try {
      // Simulate user metrics
      const totalUsers = Math.floor(Math.random() * 1000) + 500;
      const activeUsers = Math.floor(totalUsers * 0.7);
      const newUsers = Math.floor(Math.random() * 50) + 10;
      
      this.metrics.users = {
        total: totalUsers,
        active: activeUsers,
        new: newUsers,
        activeRate: Math.round((activeUsers / totalUsers) * 10000) / 100
      };
      
      log(`User Active Rate: ${this.metrics.users.activeRate}%`, 'blue');
      
    } catch (error) {
      log(`❌ User metrics collection failed: ${error.message}`, 'red');
    }
  }
  
  /**
   * Collect all business metrics
   */
  collectAll() {
    this.collectOrderMetrics();
    this.collectRevenueMetrics();
    this.collectUserMetrics();
    
    return this.metrics;
  }
}

/**
 * Alert Manager
 */
class AlertManager {
  constructor() {
    this.alerts = [];
    this.lastAlertTime = {};
  }
  
  /**
   * Check system alerts
   */
  checkSystemAlerts(systemMetrics) {
    const alerts = [];
    
    // CPU alerts
    if (systemMetrics.cpu.usage > 90) {
      alerts.push({
        level: 'critical',
        type: 'cpu',
        message: `CPU usage is critical: ${systemMetrics.cpu.usage}%`,
        value: systemMetrics.cpu.usage,
        threshold: 90
      });
    } else if (systemMetrics.cpu.usage > 80) {
      alerts.push({
        level: 'warning',
        type: 'cpu',
        message: `CPU usage is high: ${systemMetrics.cpu.usage}%`,
        value: systemMetrics.cpu.usage,
        threshold: 80
      });
    }
    
    // Memory alerts
    if (systemMetrics.memory.usage > 90) {
      alerts.push({
        level: 'critical',
        type: 'memory',
        message: `Memory usage is critical: ${systemMetrics.memory.usage}%`,
        value: systemMetrics.memory.usage,
        threshold: 90
      });
    } else if (systemMetrics.memory.usage > 80) {
      alerts.push({
        level: 'warning',
        type: 'memory',
        message: `Memory usage is high: ${systemMetrics.memory.usage}%`,
        value: systemMetrics.memory.usage,
        threshold: 80
      });
    }
    
    // Disk alerts
    if (systemMetrics.disk.usagePercent > 90) {
      alerts.push({
        level: 'critical',
        type: 'disk',
        message: `Disk usage is critical: ${systemMetrics.disk.usagePercent}%`,
        value: systemMetrics.disk.usagePercent,
        threshold: 90
      });
    } else if (systemMetrics.disk.usagePercent > 80) {
      alerts.push({
        level: 'warning',
        type: 'disk',
        message: `Disk usage is high: ${systemMetrics.disk.usagePercent}%`,
        value: systemMetrics.disk.usagePercent,
        threshold: 80
      });
    }
    
    return alerts;
  }
  
  /**
   * Check application alerts
   */
  checkApplicationAlerts(appMetrics) {
    const alerts = [];
    
    // Response time alerts
    if (appMetrics.performance.averageResponseTime > 5000) {
      alerts.push({
        level: 'critical',
        type: 'response_time',
        message: `Response time is critical: ${appMetrics.performance.averageResponseTime}ms`,
        value: appMetrics.performance.averageResponseTime,
        threshold: 5000
      });
    } else if (appMetrics.performance.averageResponseTime > 2000) {
      alerts.push({
        level: 'warning',
        type: 'response_time',
        message: `Response time is slow: ${appMetrics.performance.averageResponseTime}ms`,
        value: appMetrics.performance.averageResponseTime,
        threshold: 2000
      });
    }
    
    // Error rate alerts
    if (appMetrics.requests.successRate < 80) {
      alerts.push({
        level: 'critical',
        type: 'error_rate',
        message: `Error rate is critical: ${100 - appMetrics.requests.successRate}%`,
        value: 100 - appMetrics.requests.successRate,
        threshold: 20
      });
    } else if (appMetrics.requests.successRate < 90) {
      alerts.push({
        level: 'warning',
        type: 'error_rate',
        message: `Error rate is high: ${100 - appMetrics.requests.successRate}%`,
        value: 100 - appMetrics.requests.successRate,
        threshold: 10
      });
    }
    
    // Database alerts
    const dbUsage = (appMetrics.database.connections / appMetrics.database.maxConnections) * 100;
    if (dbUsage > 90) {
      alerts.push({
        level: 'critical',
        type: 'database',
        message: `Database connection usage is critical: ${Math.round(dbUsage)}%`,
        value: dbUsage,
        threshold: 90
      });
    } else if (dbUsage > 80) {
      alerts.push({
        level: 'warning',
        type: 'database',
        message: `Database connection usage is high: ${Math.round(dbUsage)}%`,
        value: dbUsage,
        threshold: 80
      });
    }
    
    return alerts;
  }
  
  /**
   * Check business alerts
   */
  checkBusinessAlerts(businessMetrics) {
    const alerts = [];
    
    // Revenue alerts
    if (businessMetrics.revenue.targetAchievement < 50) {
      alerts.push({
        level: 'warning',
        type: 'revenue',
        message: `Revenue target achievement is low: ${businessMetrics.revenue.targetAchievement}%`,
        value: businessMetrics.revenue.targetAchievement,
        threshold: 50
      });
    }
    
    // Order alerts
    if (businessMetrics.orders.completionRate < 80) {
      alerts.push({
        level: 'warning',
        type: 'orders',
        message: `Order completion rate is low: ${businessMetrics.orders.completionRate}%`,
        value: businessMetrics.orders.completionRate,
        threshold: 80
      });
    }
    
    return alerts;
  }
  
  /**
   * Process alerts
   */
  processAlerts(allAlerts) {
    const now = Date.now();
    
    allAlerts.forEach(alert => {
      const alertKey = `${alert.type}_${alert.level}`;
      const lastAlert = this.lastAlertTime[alertKey] || 0;
      const cooldown = alert.level === 'critical' ? 300000 : 600000; // 5 or 10 minutes
      
      if (now - lastAlert > cooldown) {
        this.alerts.push({
          ...alert,
          timestamp: new Date().toISOString()
        });
        
        this.lastAlertTime[alertKey] = now;
        
        // Log alert
        const color = alert.level === 'critical' ? 'red' : 'yellow';
        log(`🚨 ${alert.level.toUpperCase()}: ${alert.message}`, color);
      }
    });
  }
  
  /**
   * Get all alerts
   */
  getAlerts() {
    return this.alerts;
  }
  
  /**
   * Clear old alerts
   */
  clearOldAlerts() {
    const oneHourAgo = Date.now() - 3600000;
    this.alerts = this.alerts.filter(alert => 
      new Date(alert.timestamp).getTime() > oneHourAgo
    );
  }
}

/**
 * Report Generator
 */
class ReportGenerator {
  constructor() {
    this.reports = [];
  }
  
  /**
   * Generate system report
   */
  generateSystemReport(systemMetrics) {
    const report = {
      type: 'system',
      timestamp: new Date().toISOString(),
      summary: {
        cpuUsage: systemMetrics.cpu.usage,
        memoryUsage: systemMetrics.memory.usage,
        diskUsage: systemMetrics.disk.usagePercent,
        status: this.getSystemStatus(systemMetrics)
      },
      details: systemMetrics
    };
    
    this.reports.push(report);
    return report;
  }
  
  /**
   * Generate application report
   */
  generateApplicationReport(appMetrics) {
    const report = {
      type: 'application',
      timestamp: new Date().toISOString(),
      summary: {
        successRate: appMetrics.requests.successRate,
        avgResponseTime: appMetrics.performance.averageResponseTime,
        throughput: appMetrics.performance.throughput,
        status: this.getApplicationStatus(appMetrics)
      },
      details: appMetrics
    };
    
    this.reports.push(report);
    return report;
  }
  
  /**
   * Generate business report
   */
  generateBusinessReport(businessMetrics) {
    const report = {
      type: 'business',
      timestamp: new Date().toISOString(),
      summary: {
        revenue: businessMetrics.revenue.total,
        orders: businessMetrics.orders.total,
        users: businessMetrics.users.total,
        status: this.getBusinessStatus(businessMetrics)
      },
      details: businessMetrics
    };
    
    this.reports.push(report);
    return report;
  }
  
  /**
   * Get system status
   */
  getSystemStatus(metrics) {
    if (metrics.cpu.usage > 90 || metrics.memory.usage > 90 || metrics.disk.usagePercent > 90) {
      return 'critical';
    } else if (metrics.cpu.usage > 80 || metrics.memory.usage > 80 || metrics.disk.usagePercent > 80) {
      return 'warning';
    }
    return 'healthy';
  }
  
  /**
   * Get application status
   */
  getApplicationStatus(metrics) {
    if (metrics.requests.successRate < 80 || metrics.performance.averageResponseTime > 5000) {
      return 'critical';
    } else if (metrics.requests.successRate < 90 || metrics.performance.averageResponseTime > 2000) {
      return 'warning';
    }
    return 'healthy';
  }
  
  /**
   * Get business status
   */
  getBusinessStatus(metrics) {
    if (metrics.revenue.targetAchievement < 50 || metrics.orders.completionRate < 80) {
      return 'warning';
    }
    return 'healthy';
  }
  
  /**
   * Save reports to file
   */
  saveReports() {
    const reportsDir = path.join(__dirname, '../reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    const filename = `monitoring-report-${Date.now()}.json`;
    const filepath = path.join(reportsDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(this.reports, null, 2));
    log(`📋 Reports saved to: ${filepath}`, 'blue');
    
    return filepath;
  }
}

/**
 * Main monitoring function
 */
async function runMonitoring() {
  logSection('🔍 CommerFlow Monitoring System');
  
  try {
    // Initialize components
    const systemMetrics = new SystemMetrics();
    const appMetrics = new ApplicationMetrics();
    const businessMetrics = new BusinessMetrics();
    const alertManager = new AlertManager();
    const reportGenerator = new ReportGenerator();
    
    // Collect metrics
    logSection('📊 Collecting Metrics');
    
    const system = systemMetrics.collectAll();
    const application = appMetrics.collectAll();
    const business = businessMetrics.collectAll();
    
    // Check alerts
    logSection('🚨 Checking Alerts');
    
    const systemAlerts = alertManager.checkSystemAlerts(system);
    const appAlerts = alertManager.checkApplicationAlerts(application);
    const businessAlerts = alertManager.checkBusinessAlerts(business);
    
    const allAlerts = [...systemAlerts, ...appAlerts, ...businessAlerts];
    alertManager.processAlerts(allAlerts);
    
    // Generate reports
    logSection('📋 Generating Reports');
    
    const systemReport = reportGenerator.generateSystemReport(system);
    const appReport = reportGenerator.generateApplicationReport(application);
    const businessReport = reportGenerator.generateBusinessReport(business);
    
    // Save reports
    const reportPath = reportGenerator.saveReports();
    
    // Summary
    logSection('📈 Monitoring Summary');
    
    log(`System Status: ${systemReport.summary.status}`, 
        systemReport.summary.status === 'healthy' ? 'green' : 'yellow');
    log(`Application Status: ${appReport.summary.status}`, 
        appReport.summary.status === 'healthy' ? 'green' : 'yellow');
    log(`Business Status: ${businessReport.summary.status}`, 
        businessReport.summary.status === 'healthy' ? 'green' : 'yellow');
    
    const activeAlerts = alertManager.getAlerts();
    if (activeAlerts.length > 0) {
      log(`Active Alerts: ${activeAlerts.length}`, 'red');
      activeAlerts.forEach(alert => {
        log(`  - ${alert.level.toUpperCase()}: ${alert.message}`, 'red');
      });
    } else {
      log('Active Alerts: 0', 'green');
    }
    
    log('✅ Monitoring completed successfully', 'green');
    
  } catch (error) {
    log(`❌ Monitoring failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

/**
 * Show help information
 */
function showHelp() {
  logSection('📖 Monitoring Script Help');
  
  console.log(`
Usage: node scripts/monitor.js [options]

Options:
  --continuous    Run monitoring continuously
  --interval      Set monitoring interval in seconds (default: 60)
  --report-only   Generate reports only (no alerts)
  --alerts-only   Check alerts only (no reports)
  --system-only   Monitor system metrics only
  --app-only      Monitor application metrics only
  --business-only Monitor business metrics only

Examples:
  node scripts/monitor.js
  node scripts/monitor.js --continuous --interval 30
  node scripts/monitor.js --report-only
  node scripts/monitor.js --system-only
`);
}

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  return {
    continuous: args.includes('--continuous'),
    interval: parseInt(args.find(arg => arg.startsWith('--interval='))?.split('=')[1]) || 60,
    reportOnly: args.includes('--report-only'),
    alertsOnly: args.includes('--alerts-only'),
    systemOnly: args.includes('--system-only'),
    appOnly: args.includes('--app-only'),
    businessOnly: args.includes('--business-only')
  };
}

/**
 * Main function
 */
async function main() {
  const args = parseArgs();
  
  if (args.continuous) {
    log('🔄 Starting continuous monitoring...', 'blue');
    setInterval(runMonitoring, args.interval * 1000);
    runMonitoring(); // Run immediately
  } else {
    runMonitoring();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  SystemMetrics,
  ApplicationMetrics,
  BusinessMetrics,
  AlertManager,
  ReportGenerator,
  runMonitoring
}; 