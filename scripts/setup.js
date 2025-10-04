#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up Railway Passenger Amenities Software...\n');

// Check if .env exists
const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file from template...');
  const envExample = fs.readFileSync(path.join(process.cwd(), 'env.example'), 'utf8');
  fs.writeFileSync(envPath, envExample);
  console.log('✅ .env file created. Please update it with your configuration.\n');
} else {
  console.log('✅ .env file already exists.\n');
}

// Check if node_modules exists
const nodeModulesPath = path.join(process.cwd(), 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('📦 Installing dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed.\n');
  } catch (error) {
    console.error('❌ Failed to install dependencies:', error.message);
    process.exit(1);
  }
} else {
  console.log('✅ Dependencies already installed.\n');
}

// Create uploads directory
const uploadsPath = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadsPath)) {
  console.log('📁 Creating uploads directory...');
  fs.mkdirSync(uploadsPath, { recursive: true });
  fs.mkdirSync(path.join(uploadsPath, 'thumbs'), { recursive: true });
  console.log('✅ Uploads directory created.\n');
} else {
  console.log('✅ Uploads directory already exists.\n');
}

console.log('🎉 Setup completed!\n');
console.log('📋 Next steps:');
console.log('1. Update .env file with your MongoDB URI and other configuration');
console.log('2. Run: npm run seed (to populate database with sample data)');
console.log('3. Run: npm run dev (to start development server)');
console.log('4. Open: http://localhost:3000');
console.log('\n🔑 Sample login credentials:');
console.log('SuperAdmin: admin@railway.com / password123');
console.log('StationManager: manager.cst@railway.com / password123');
console.log('Staff: staff.cst@railway.com / password123');
console.log('Public: public@example.com / password123');
