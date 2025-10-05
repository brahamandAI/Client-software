#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for better console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function execCommand(command, description, exitOnError = true) {
  try {
    log(`📦 ${description}...`, 'blue');
    execSync(command, { stdio: 'inherit' });
    log(`✅ ${description} completed.`, 'green');
    return true;
  } catch (error) {
    log(`❌ Failed to ${description.toLowerCase()}: ${error.message}`, 'red');
    if (exitOnError) {
      process.exit(1);
    }
    return false;
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const isDev = args.includes('--dev') || args.includes('-d');
const isProd = args.includes('--prod') || args.includes('-p');
const isStaging = args.includes('--staging') || args.includes('-s');
const skipBuild = args.includes('--skip-build');
const skipInstall = args.includes('--skip-install');
const help = args.includes('--help') || args.includes('-h');

if (help) {
  log('🚀 Railway Passenger Amenities Setup Script', 'cyan');
  log('\nUsage: npm run setup [options]', 'bright');
  log('\nOptions:', 'bright');
  log('  --dev, -d          Setup for development environment');
  log('  --prod, -p         Setup for production environment');
  log('  --staging, -s      Setup for staging environment');
  log('  --skip-install     Skip npm install');
  log('  --skip-build       Skip build process');
  log('  --help, -h         Show this help message');
  log('\nExamples:', 'bright');
  log('  npm run setup              # Basic setup');
  log('  npm run setup --dev        # Setup + start dev server');
  log('  npm run setup --prod       # Setup + build + start production');
  log('  npm run setup --skip-build # Setup without building');
  process.exit(0);
}

log('🚀 Setting up Railway Passenger Amenities Software...', 'cyan');
log('', 'reset');

// Check if .env exists
const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  log('📝 Creating .env file from template...', 'yellow');
  const envExample = fs.readFileSync(path.join(process.cwd(), 'env.example'), 'utf8');
  fs.writeFileSync(envPath, envExample);
  log('✅ .env file created. Please update it with your configuration.', 'green');
} else {
  log('✅ .env file already exists.', 'green');
}
log('', 'reset');

// Install dependencies
if (!skipInstall) {
  const nodeModulesPath = path.join(process.cwd(), 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    execCommand('npm install', 'Installing dependencies');
  } else {
    log('✅ Dependencies already installed.', 'green');
    // Check if we need to update dependencies
    try {
      execSync('npm outdated', { stdio: 'pipe' });
    } catch (error) {
      if (error.status === 1) {
        log('📦 Some packages have updates available. Run "npm update" to update them.', 'yellow');
      }
    }
  }
} else {
  log('⏭️  Skipping dependency installation.', 'yellow');
}
log('', 'reset');

// Create necessary directories
const uploadsPath = path.join(process.cwd(), 'public', 'uploads');
const logsPath = path.join(process.cwd(), 'logs');

if (!fs.existsSync(uploadsPath)) {
  log('📁 Creating uploads directory...', 'blue');
  fs.mkdirSync(uploadsPath, { recursive: true });
  fs.mkdirSync(path.join(uploadsPath, 'thumbs'), { recursive: true });
  log('✅ Uploads directory created.', 'green');
} else {
  log('✅ Uploads directory already exists.', 'green');
}

if (!fs.existsSync(logsPath)) {
  log('📁 Creating logs directory...', 'blue');
  fs.mkdirSync(logsPath, { recursive: true });
  log('✅ Logs directory created.', 'green');
} else {
  log('✅ Logs directory already exists.', 'green');
}
log('', 'reset');

// Check if PM2 is installed globally
function checkPM2() {
  try {
    execSync('pm2 --version', { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

// Install PM2 globally if not present
if (!checkPM2()) {
  log('📦 PM2 not found. Installing PM2 globally...', 'yellow');
  execCommand('npm install -g pm2', 'Installing PM2 globally');
} else {
  log('✅ PM2 is already installed.', 'green');
}
log('', 'reset');

// Build the application for production
if ((isProd || isStaging) && !skipBuild) {
  execCommand('npm run build', 'Building application for production');
  log('', 'reset');
}

// Start the appropriate environment
if (isDev) {
  log('🚀 Starting development server with PM2...', 'cyan');
  execCommand('npm run pm2:dev', 'Starting development environment');
} else if (isProd) {
  log('🚀 Starting production server with PM2...', 'cyan');
  execCommand('npm run pm2:prod', 'Starting production environment');
} else if (isStaging) {
  log('� Starting staging server with PM2...', 'cyan');
  execCommand('npm run pm2:staging', 'Starting staging environment');
}

log('', 'reset');
log('🎉 Setup completed!', 'green');
log('', 'reset');
log('📋 Next steps:', 'bright');
log('1. Update .env file with your MongoDB URI and other configuration');
log('2. Run: npm run seed (to populate database with sample data)');

if (!isDev && !isProd && !isStaging) {
  log('3. Choose your environment:', 'bright');
  log('   - Development: npm run pm2:dev');
  log('   - Production:  npm run pm2:prod (requires build)');
  log('   - Staging:     npm run pm2:staging (requires build)');
}

log('4. Monitor your application:', 'bright');
log('   - Status:   npm run pm2:status');
log('   - Logs:     npm run pm2:logs');
log('   - Monitor:  npm run pm2:monitor');

if (isDev || isProd || isStaging) {
  log('5. Open: http://localhost:3006', 'bright');
} else {
  log('5. Open: http://localhost:3006 (after starting)', 'bright');
}

log('', 'reset');
log('🔑 Sample login credentials:', 'bright');
log('SuperAdmin: admin@railway.com / password123');
log('StationManager: manager.cst@railway.com / password123');
log('Staff: staff.cst@railway.com / password123');
log('Public: public@example.com / password123');

log('', 'reset');
log('📚 Useful PM2 commands:', 'bright');
log('  pm2 list                    # List all processes');
log('  pm2 stop all               # Stop all processes');
log('  pm2 restart all            # Restart all processes');
log('  pm2 reload all             # Reload all processes (0 downtime)');
log('  pm2 delete all             # Delete all processes');
log('  pm2 logs                   # Show logs');
log('  pm2 monit                  # Real-time monitoring');
