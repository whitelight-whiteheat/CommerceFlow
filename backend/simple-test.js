// Simple diagnostic test
console.log('🔍 Simple Backend Diagnostic Test\n');

// Test 1: Node.js basics
console.log('1. Node.js Environment:');
console.log('   Node version:', process.version);
console.log('   Current directory:', process.cwd());
console.log('   NODE_ENV:', process.env.NODE_ENV || 'not set');

// Test 2: Check if .env file exists
console.log('\n2. Environment File Check:');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('   ✅ .env file exists');
} else {
  console.log('   ❌ .env file not found');
}

// Test 3: Basic JWT Secret check
console.log('\n3. JWT Secret Check:');
console.log('   JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
console.log('   DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');

// Test 4: Check if required modules can be loaded
console.log('\n4. Module Loading Test:');
try {
  require('dotenv').config();
  console.log('   ✅ dotenv loaded');
} catch (e) {
  console.log('   ❌ dotenv failed:', e.message);
}

try {
  const bcrypt = require('bcryptjs');
  console.log('   ✅ bcryptjs loaded');
} catch (e) {
  console.log('   ❌ bcryptjs failed:', e.message);
}

try {
  const jwt = require('jsonwebtoken');
  console.log('   ✅ jsonwebtoken loaded');
} catch (e) {
  console.log('   ❌ jsonwebtoken failed:', e.message);
}

try {
  const express = require('express');
  console.log('   ✅ express loaded');
} catch (e) {
  console.log('   ❌ express failed:', e.message);
}

try {
  const { PrismaClient } = require('@prisma/client');
  console.log('   ✅ @prisma/client loaded');
} catch (e) {
  console.log('   ❌ @prisma/client failed:', e.message);
}

console.log('\n🔧 Diagnostic Complete'); 