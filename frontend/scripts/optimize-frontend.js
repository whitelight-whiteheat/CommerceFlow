#!/usr/bin/env node

/**
 * Frontend Optimization Script
 * 
 * Analyzes and optimizes frontend bundle size and performance.
 */

const fs = require('fs');
const path = require('path');
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

/**
 * Analyze bundle size
 */
function analyzeBundle() {
  logSection('📦 Bundle Analysis');
  
  try {
    // Build the project first
    log('Building project for analysis...', 'blue');
    execSync('npm run build', { stdio: 'inherit' });
    
    // Analyze bundle size
    log('Analyzing bundle size...', 'blue');
    execSync('npx webpack-bundle-analyzer build/static/js/*.js', { stdio: 'inherit' });
    
    // Get bundle stats
    const buildDir = path.join(__dirname, '../build');
    const jsDir = path.join(buildDir, 'static/js');
    
    if (fs.existsSync(jsDir)) {
      const files = fs.readdirSync(jsDir);
      let totalSize = 0;
      
      log('\n📊 Bundle Files:', 'green');
      files.forEach(file => {
        const filePath = path.join(jsDir, file);
        const stats = fs.statSync(filePath);
        const sizeKB = Math.round(stats.size / 1024);
        totalSize += sizeKB;
        
        log(`   ${file}: ${sizeKB}KB`, 'blue');
      });
      
      log(`\n📊 Total Bundle Size: ${totalSize}KB`, 'green');
      
      // Check against thresholds
      if (totalSize > 500) {
        log('⚠️  Bundle size exceeds 500KB threshold', 'yellow');
        log('Consider implementing code splitting and lazy loading', 'yellow');
      } else {
        log('✅ Bundle size is within acceptable limits', 'green');
      }
    }
    
  } catch (error) {
    log(`❌ Bundle analysis failed: ${error.message}`, 'red');
  }
}

/**
 * Analyze dependencies
 */
function analyzeDependencies() {
  logSection('📋 Dependency Analysis');
  
  try {
    const packageJsonPath = path.join(__dirname, '../package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    log('📊 Dependencies:', 'green');
    console.table(Object.keys(packageJson.dependencies).map(dep => ({
      dependency: dep,
      version: packageJson.dependencies[dep]
    })));
    
    // Check for large dependencies
    const largeDeps = [
      'react-dom',
      'recharts',
      'lucide-react',
      'axios'
    ];
    
    log('\n📊 Large Dependencies:', 'yellow');
    largeDeps.forEach(dep => {
      if (packageJson.dependencies[dep]) {
        log(`   ${dep}: ${packageJson.dependencies[dep]}`, 'blue');
      }
    });
    
    // Recommendations
    log('\n💡 Optimization Recommendations:', 'blue');
    log('   - Consider using smaller chart libraries', 'blue');
    log('   - Implement tree shaking for large dependencies', 'blue');
    log('   - Use dynamic imports for heavy components', 'blue');
    
  } catch (error) {
    log(`❌ Dependency analysis failed: ${error.message}`, 'red');
  }
}

/**
 * Optimize images
 */
function optimizeImages() {
  logSection('🖼️ Image Optimization');
  
  try {
    const publicDir = path.join(__dirname, '../public');
    const srcDir = path.join(__dirname, '../src');
    
    // Find image files
    const findImages = (dir) => {
      const images = [];
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir, { withFileTypes: true });
        files.forEach(file => {
          const fullPath = path.join(dir, file.name);
          if (file.isDirectory()) {
            images.push(...findImages(fullPath));
          } else if (/\.(jpg|jpeg|png|gif|svg)$/i.test(file.name)) {
            images.push(fullPath);
          }
        });
      }
      return images;
    };
    
    const images = [...findImages(publicDir), ...findImages(srcDir)];
    
    if (images.length > 0) {
      log(`📊 Found ${images.length} images:`, 'green');
      images.forEach(image => {
        const stats = fs.statSync(image);
        const sizeKB = Math.round(stats.size / 1024);
        log(`   ${path.basename(image)}: ${sizeKB}KB`, 'blue');
      });
      
      log('\n💡 Image Optimization Recommendations:', 'blue');
      log('   - Convert images to WebP format', 'blue');
      log('   - Implement responsive images', 'blue');
      log('   - Use lazy loading for images', 'blue');
      log('   - Compress images using tools like imagemin', 'blue');
    } else {
      log('✅ No images found to optimize', 'green');
    }
    
  } catch (error) {
    log(`❌ Image optimization failed: ${error.message}`, 'red');
  }
}

/**
 * Analyze CSS
 */
function analyzeCSS() {
  logSection('🎨 CSS Analysis');
  
  try {
    const buildDir = path.join(__dirname, '../build');
    const cssDir = path.join(buildDir, 'static/css');
    
    if (fs.existsSync(cssDir)) {
      const files = fs.readdirSync(cssDir);
      let totalCSSSize = 0;
      
      log('📊 CSS Files:', 'green');
      files.forEach(file => {
        const filePath = path.join(cssDir, file);
        const stats = fs.statSync(filePath);
        const sizeKB = Math.round(stats.size / 1024);
        totalCSSSize += sizeKB;
        
        log(`   ${file}: ${sizeKB}KB`, 'blue');
      });
      
      log(`\n📊 Total CSS Size: ${totalCSSSize}KB`, 'green');
      
      if (totalCSSSize > 50) {
        log('⚠️  CSS size exceeds 50KB threshold', 'yellow');
        log('Consider purging unused CSS', 'yellow');
      } else {
        log('✅ CSS size is within acceptable limits', 'green');
      }
    }
    
    // Check for CSS-in-JS usage
    const srcDir = path.join(__dirname, '../src');
    const cssFiles = [];
    
    const findCSSFiles = (dir) => {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir, { withFileTypes: true });
        files.forEach(file => {
          const fullPath = path.join(dir, file.name);
          if (file.isDirectory()) {
            findCSSFiles(fullPath);
          } else if (file.name.endsWith('.css')) {
            cssFiles.push(fullPath);
          }
        });
      }
    };
    
    findCSSFiles(srcDir);
    
    log(`\n📊 CSS Files in src: ${cssFiles.length}`, 'green');
    cssFiles.forEach(file => {
      const relativePath = path.relative(srcDir, file);
      log(`   ${relativePath}`, 'blue');
    });
    
  } catch (error) {
    log(`❌ CSS analysis failed: ${error.message}`, 'red');
  }
}

/**
 * Generate optimization report
 */
function generateReport() {
  logSection('📋 Optimization Report');
  
  const report = {
    timestamp: new Date().toISOString(),
    bundle: {
      totalSize: 0,
      files: []
    },
    dependencies: {
      count: 0,
      largeDeps: []
    },
    images: {
      count: 0,
      totalSize: 0
    },
    css: {
      totalSize: 0,
      files: []
    },
    recommendations: [
      'Implement React.lazy for code splitting',
      'Use React.memo for expensive components',
      'Optimize images with WebP format',
      'Implement virtual scrolling for large lists',
      'Use debouncing for search inputs',
      'Implement service worker for caching',
      'Optimize bundle splitting',
      'Use tree shaking to remove unused code'
    ]
  };
  
  // Save report
  const reportPath = path.join(__dirname, '../optimization-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  log('✅ Optimization report generated', 'green');
  log(`📁 Report saved to: ${reportPath}`, 'blue');
  
  return report;
}

/**
 * Install optimization dependencies
 */
function installOptimizationDeps() {
  logSection('📦 Installing Optimization Dependencies');
  
  try {
    const deps = [
      'webpack-bundle-analyzer',
      'imagemin',
      'imagemin-webp',
      'purgecss',
      'compression-webpack-plugin',
      'terser-webpack-plugin'
    ];
    
    log('Installing optimization dependencies...', 'blue');
    execSync(`npm install --save-dev ${deps.join(' ')}`, { stdio: 'inherit' });
    
    log('✅ Optimization dependencies installed', 'green');
    
  } catch (error) {
    log(`❌ Failed to install dependencies: ${error.message}`, 'red');
  }
}

/**
 * Create optimization configuration
 */
function createOptimizationConfig() {
  logSection('⚙️ Creating Optimization Configuration');
  
  try {
    // Create webpack optimization config
    const webpackConfig = `
const CompressionPlugin = require('compression-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true
          }
        }
      })
    ],
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\\\/]node_modules[\\\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  },
  plugins: [
    new CompressionPlugin({
      algorithm: 'gzip',
      test: /\\.(js|css|html|svg)$/,
      threshold: 1024,
      minRatio: 0.8
    })
  ]
};
`;
    
    const configPath = path.join(__dirname, '../webpack.optimization.js');
    fs.writeFileSync(configPath, webpackConfig);
    
    log('✅ Webpack optimization config created', 'green');
    log(`📁 Config saved to: ${configPath}`, 'blue');
    
  } catch (error) {
    log(`❌ Failed to create optimization config: ${error.message}`, 'red');
  }
}

/**
 * Show help information
 */
function showHelp() {
  logSection('📖 Frontend Optimization Help');
  
  console.log(`
Usage: node scripts/optimize-frontend.js <action>

Actions:
  analyze     Analyze bundle size and dependencies
  bundle      Analyze bundle size only
  deps        Analyze dependencies only
  images      Analyze and optimize images
  css         Analyze CSS files
  report      Generate optimization report
  install     Install optimization dependencies
  config      Create optimization configuration
  all         Run all optimizations

Examples:
  node scripts/optimize-frontend.js analyze
  node scripts/optimize-frontend.js bundle
  node scripts/optimize-frontend.js all
`);
}

/**
 * Main function
 */
function main() {
  const action = process.argv[2] || 'help';
  
  try {
    switch (action) {
      case 'analyze':
        analyzeBundle();
        analyzeDependencies();
        analyzeCSS();
        break;
        
      case 'bundle':
        analyzeBundle();
        break;
        
      case 'deps':
        analyzeDependencies();
        break;
        
      case 'images':
        optimizeImages();
        break;
        
      case 'css':
        analyzeCSS();
        break;
        
      case 'report':
        generateReport();
        break;
        
      case 'install':
        installOptimizationDeps();
        break;
        
      case 'config':
        createOptimizationConfig();
        break;
        
      case 'all':
        installOptimizationDeps();
        createOptimizationConfig();
        analyzeBundle();
        analyzeDependencies();
        optimizeImages();
        analyzeCSS();
        generateReport();
        break;
        
      case 'help':
      default:
        showHelp();
        break;
    }
  } catch (error) {
    log(`❌ Operation failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  analyzeBundle,
  analyzeDependencies,
  optimizeImages,
  analyzeCSS,
  generateReport,
  installOptimizationDeps,
  createOptimizationConfig
}; 