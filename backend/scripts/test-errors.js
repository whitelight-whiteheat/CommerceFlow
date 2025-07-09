#!/usr/bin/env node

/**
 * Error Handling Test Script
 * 
 * Tests the standardized error handling system.
 */

const { 
  ErrorCodes, 
  AppError, 
  ErrorHandler, 
  formatValidationErrors 
} = require('../src/config/errors');

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
 * Test error creation
 */
function testErrorCreation() {
  logSection('🧪 Error Creation Tests');
  
  // Test basic error creation
  const basicError = new AppError(ErrorCodes.VALIDATION_ERROR);
  log('✅ Basic error created:', 'green');
  log(`   Code: ${basicError.code}`, 'blue');
  log(`   Message: ${basicError.message}`, 'blue');
  log(`   Status: ${basicError.statusCode}`, 'blue');
  
  // Test error with custom message
  const customError = new AppError(
    ErrorCodes.USER_NOT_FOUND,
    'User with email john@example.com not found'
  );
  log('\n✅ Custom error created:', 'green');
  log(`   Code: ${customError.code}`, 'blue');
  log(`   Message: ${customError.message}`, 'blue');
  log(`   Status: ${customError.statusCode}`, 'blue');
  
  // Test error with details
  const detailedError = new AppError(
    ErrorCodes.VALIDATION_ERROR,
    'Validation failed',
    { email: ['Invalid email format'], password: ['Too short'] }
  );
  log('\n✅ Detailed error created:', 'green');
  log(`   Code: ${detailedError.code}`, 'blue');
  log(`   Details: ${JSON.stringify(detailedError.details)}`, 'blue');
  
  return { basicError, customError, detailedError };
}

/**
 * Test static error methods
 */
function testStaticMethods() {
  logSection('🔧 Static Method Tests');
  
  // Test validation error
  const validationError = AppError.validationError({
    email: ['Invalid email format'],
    password: ['Must be at least 6 characters']
  });
  log('✅ Validation error created:', 'green');
  log(`   Code: ${validationError.code}`, 'blue');
  log(`   Status: ${validationError.statusCode}`, 'blue');
  
  // Test not found error
  const notFoundError = AppError.notFound('Product');
  log('\n✅ Not found error created:', 'green');
  log(`   Message: ${notFoundError.message}`, 'blue');
  log(`   Status: ${notFoundError.statusCode}`, 'blue');
  
  // Test unauthorized error
  const unauthorizedError = AppError.unauthorized('Invalid credentials');
  log('\n✅ Unauthorized error created:', 'green');
  log(`   Message: ${unauthorizedError.message}`, 'blue');
  log(`   Status: ${unauthorizedError.statusCode}`, 'blue');
  
  // Test forbidden error
  const forbiddenError = AppError.forbidden('Admin access required');
  log('\n✅ Forbidden error created:', 'green');
  log(`   Message: ${forbiddenError.message}`, 'blue');
  log(`   Status: ${forbiddenError.statusCode}`, 'blue');
  
  return { validationError, notFoundError, unauthorizedError, forbiddenError };
}

/**
 * Test error JSON conversion
 */
function testErrorJSON() {
  logSection('📄 Error JSON Conversion Tests');
  
  const error = new AppError(
    ErrorCodes.VALIDATION_ERROR,
    'Validation failed',
    { field: 'email', value: 'invalid-email' }
  );
  
  const json = error.toJSON();
  log('✅ Error converted to JSON:', 'green');
  log(`   JSON: ${JSON.stringify(json, null, 2)}`, 'blue');
  
  // Validate JSON structure
  const isValid = json.success === false && 
                  json.error && 
                  json.error.code && 
                  json.error.message && 
                  json.error.timestamp;
  
  if (isValid) {
    log('✅ JSON structure is valid', 'green');
  } else {
    log('❌ JSON structure is invalid', 'red');
  }
  
  return json;
}

/**
 * Test Prisma error conversion
 */
function testPrismaErrorConversion() {
  logSection('🗄️ Prisma Error Conversion Tests');
  
  // Simulate Prisma unique constraint error
  const prismaUniqueError = {
    name: 'PrismaClientKnownRequestError',
    code: 'P2002',
    meta: {
      target: ['email']
    }
  };
  
  const convertedError = AppError.fromPrismaError(prismaUniqueError);
  log('✅ Prisma unique constraint error converted:', 'green');
  log(`   Code: ${convertedError.code}`, 'blue');
  log(`   Message: ${convertedError.message}`, 'blue');
  
  // Simulate Prisma not found error
  const prismaNotFoundError = {
    name: 'PrismaClientKnownRequestError',
    code: 'P2025',
    meta: {
      model: 'User'
    }
  };
  
  const convertedNotFoundError = AppError.fromPrismaError(prismaNotFoundError);
  log('\n✅ Prisma not found error converted:', 'green');
  log(`   Code: ${convertedNotFoundError.code}`, 'blue');
  log(`   Message: ${convertedNotFoundError.message}`, 'blue');
  
  return { convertedError, convertedNotFoundError };
}

/**
 * Test validation error formatting
 */
function testValidationFormatting() {
  logSection('📝 Validation Error Formatting Tests');
  
  // Test array of validation errors
  const arrayErrors = [
    { path: 'email', message: 'Invalid email format' },
    { path: 'password', message: 'Password too short' }
  ];
  
  const formattedArray = formatValidationErrors(arrayErrors);
  log('✅ Array validation errors formatted:', 'green');
  log(`   Result: ${JSON.stringify(formattedArray, null, 2)}`, 'blue');
  
  // Test object validation errors
  const objectErrors = {
    email: 'Invalid email format',
    password: 'Password too short',
    name: 'Name is required'
  };
  
  const formattedObject = formatValidationErrors(objectErrors);
  log('\n✅ Object validation errors formatted:', 'green');
  log(`   Result: ${JSON.stringify(formattedObject, null, 2)}`, 'blue');
  
  return { formattedArray, formattedObject };
}

/**
 * Test error handler
 */
function testErrorHandler() {
  logSection('🛠️ Error Handler Tests');
  
  const mockLogger = {
    error: (message, data) => log(`ERROR: ${message}`, 'red'),
    warn: (message, data) => log(`WARN: ${message}`, 'yellow'),
    info: (message, data) => log(`INFO: ${message}`, 'blue')
  };
  
  const errorHandler = new ErrorHandler(mockLogger);
  
  // Test async handler wrapper
  const asyncFunction = async () => {
    throw new AppError(ErrorCodes.VALIDATION_ERROR, 'Test error');
  };
  
  const wrappedFunction = errorHandler.asyncHandler(asyncFunction);
  log('✅ Async handler wrapper created', 'green');
  
  // Test error handling
  const mockReq = { url: '/test', method: 'GET', ip: '127.0.0.1' };
  const mockRes = {
    status: (code) => ({
      json: (data) => {
        log(`Response Status: ${code}`, 'blue');
        log(`Response Data: ${JSON.stringify(data, null, 2)}`, 'blue');
        return mockRes;
      }
    })
  };
  
  const testError = new AppError(ErrorCodes.USER_NOT_FOUND);
  errorHandler.handle(testError, mockReq, mockRes);
  
  return { errorHandler, wrappedFunction };
}

/**
 * Test all error codes
 */
function testAllErrorCodes() {
  logSection('📋 All Error Codes Test');
  
  const errorCodes = Object.values(ErrorCodes);
  const results = [];
  
  errorCodes.forEach(code => {
    try {
      const error = new AppError(code);
      results.push({
        code,
        statusCode: error.statusCode,
        message: error.message,
        valid: true
      });
    } catch (err) {
      results.push({
        code,
        statusCode: 'N/A',
        message: 'Error creating error',
        valid: false
      });
    }
  });
  
  log('✅ All error codes tested:', 'green');
  console.table(results);
  
  const validCount = results.filter(r => r.valid).length;
  const totalCount = results.length;
  
  log(`\n📊 Results: ${validCount}/${totalCount} error codes are valid`, 'green');
  
  return results;
}

/**
 * Generate error documentation
 */
function generateErrorDocs() {
  logSection('📚 Error Documentation');
  
  const docs = {
    timestamp: new Date().toISOString(),
    errorCodes: {},
    statusCodes: {},
    examples: {}
  };
  
  // Generate error code documentation
  Object.values(ErrorCodes).forEach(code => {
    const error = new AppError(code);
    docs.errorCodes[code] = {
      message: error.message,
      statusCode: error.statusCode,
      description: `Error code for ${code.toLowerCase().replace(/_/g, ' ')}`
    };
  });
  
  // Generate example responses
  const exampleError = new AppError(
    ErrorCodes.VALIDATION_ERROR,
    'Validation failed',
    { email: ['Invalid email format'] }
  );
  
  docs.examples = {
    validationError: exampleError.toJSON(),
    notFoundError: AppError.notFound('User').toJSON(),
    unauthorizedError: AppError.unauthorized().toJSON()
  };
  
  // Save documentation
  const fs = require('fs');
  const path = require('path');
  const docsPath = path.join(__dirname, '../docs/error-codes.json');
  
  fs.writeFileSync(docsPath, JSON.stringify(docs, null, 2));
  
  log('✅ Error documentation generated', 'green');
  log(`📁 Documentation saved to: ${docsPath}`, 'blue');
  
  return docs;
}

/**
 * Run all tests
 */
function runAllTests() {
  logSection('🚀 Running All Error Tests');
  
  try {
    testErrorCreation();
    testStaticMethods();
    testErrorJSON();
    testPrismaErrorConversion();
    testValidationFormatting();
    testErrorHandler();
    testAllErrorCodes();
    generateErrorDocs();
    
    logSection('✅ All Tests Completed Successfully');
    
  } catch (error) {
    logSection('❌ Test Suite Failed');
    log(`Error: ${error.message}`, 'red');
    process.exit(1);
  }
}

/**
 * Show help information
 */
function showHelp() {
  logSection('📖 Error Testing Help');
  
  console.log(`
Usage: node scripts/test-errors.js [test]

Tests:
  creation     Test error creation
  static       Test static error methods
  json         Test error JSON conversion
  prisma       Test Prisma error conversion
  validation   Test validation error formatting
  handler      Test error handler
  codes        Test all error codes
  docs         Generate error documentation
  all          Run all tests (default)

Examples:
  node scripts/test-errors.js creation
  node scripts/test-errors.js all
  node scripts/test-errors.js docs
`);
}

/**
 * Main function
 */
function main() {
  const test = process.argv[2] || 'all';
  
  switch (test) {
    case 'creation':
      testErrorCreation();
      break;
      
    case 'static':
      testStaticMethods();
      break;
      
    case 'json':
      testErrorJSON();
      break;
      
    case 'prisma':
      testPrismaErrorConversion();
      break;
      
    case 'validation':
      testValidationFormatting();
      break;
      
    case 'handler':
      testErrorHandler();
      break;
      
    case 'codes':
      testAllErrorCodes();
      break;
      
    case 'docs':
      generateErrorDocs();
      break;
      
    case 'all':
      runAllTests();
      break;
      
    case 'help':
    default:
      showHelp();
      break;
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  testErrorCreation,
  testStaticMethods,
  testErrorJSON,
  testPrismaErrorConversion,
  testValidationFormatting,
  testErrorHandler,
  testAllErrorCodes,
  generateErrorDocs,
  runAllTests
}; 