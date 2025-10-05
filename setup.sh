#!/bin/bash

# Railway Amenities Application Setup Script
# This script handles complete application setup including dependencies, build, and PM2 deployment

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check Node.js version
check_node_version() {
    if command_exists node; then
        NODE_VERSION=$(node --version | cut -d'v' -f2)
        MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1)
        if [ "$MAJOR_VERSION" -ge 18 ]; then
            print_success "Node.js version $NODE_VERSION is compatible"
        else
            print_warning "Node.js version $NODE_VERSION detected. Recommended version is 18+ for Next.js 14"
        fi
    else
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
}

# Function to install PM2 globally if not present
install_pm2() {
    if ! command_exists pm2; then
        print_status "Installing PM2 globally..."
        npm install -g pm2
        print_success "PM2 installed successfully"
    else
        print_success "PM2 is already installed"
        pm2 --version
    fi
}

# Function to setup environment file
setup_env() {
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            print_status "Creating .env file from .env.example..."
            cp .env.example .env
            print_warning "Please update .env file with your actual configuration values"
        else
            print_warning ".env.example not found. Please create .env file manually"
        fi
    else
        print_success ".env file already exists"
    fi
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing npm dependencies..."
    npm install
    print_success "Dependencies installed successfully"
}

# Function to build the application
build_application() {
    print_status "Building the Next.js application..."
    npm run build
    print_success "Application built successfully"
}

# Function to create logs directory
setup_logs() {
    if [ ! -d "logs" ]; then
        print_status "Creating logs directory..."
        mkdir -p logs
        print_success "Logs directory created"
    else
        print_success "Logs directory already exists"
    fi
}

# Function to start PM2 based on environment
start_pm2() {
    local environment=${1:-production}
    
    print_status "Starting PM2 in $environment mode..."
    
    # Stop any existing processes first
    pm2 delete ecosystem.config.js 2>/dev/null || true
    
    case $environment in
        "development"|"dev")
            npm run pm2:dev
            ;;
        "staging")
            npm run pm2:staging
            ;;
        "production"|"prod"|*)
            npm run pm2:prod
            ;;
    esac
    
    print_success "PM2 started in $environment mode"
    
    # Save PM2 process list
    pm2 save
    print_success "PM2 process list saved"
    
    # Show status
    pm2 status
}

# Function to setup PM2 startup script
setup_pm2_startup() {
    if command_exists systemctl; then
        print_status "Setting up PM2 startup script..."
        STARTUP_SCRIPT=$(pm2 startup | tail -n 1)
        if [[ $STARTUP_SCRIPT == sudo* ]]; then
            print_warning "Please run the following command manually:"
            echo "$STARTUP_SCRIPT"
        else
            eval "$STARTUP_SCRIPT"
            print_success "PM2 startup script configured"
        fi
    else
        print_warning "systemctl not available. PM2 startup script not configured."
    fi
}

# Function to run database setup/seeding
setup_database() {
    if [ -f "scripts/seed.ts" ]; then
        print_status "Running database setup..."
        npm run seed
        print_success "Database setup completed"
    else
        print_warning "No seed script found. Skipping database setup."
    fi
}

# Function to run health check
health_check() {
    if [ -f "scripts/health-test.ts" ]; then
        print_status "Running health check..."
        npm run health-check
        print_success "Health check completed"
    else
        print_warning "No health check script found. Skipping health check."
    fi
}

# Function to display usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -e, --env ENV          Set environment (development, staging, production) [default: production]"
    echo "  -s, --skip-build       Skip the build process"
    echo "  -d, --skip-deps        Skip dependency installation"
    echo "  -p, --skip-pm2         Skip PM2 startup"
    echo "  --skip-db              Skip database setup"
    echo "  --skip-health          Skip health check"
    echo "  --pm2-startup          Setup PM2 startup script"
    echo "  -h, --help             Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                     # Full setup in production mode"
    echo "  $0 -e development      # Setup in development mode"
    echo "  $0 --skip-build        # Setup without building"
    echo "  $0 --pm2-startup       # Setup with PM2 startup script"
}

# Main setup function
main() {
    local environment="production"
    local skip_build=false
    local skip_deps=false
    local skip_pm2=false
    local skip_db=false
    local skip_health=false
    local setup_startup=false
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -e|--env)
                environment="$2"
                shift 2
                ;;
            -s|--skip-build)
                skip_build=true
                shift
                ;;
            -d|--skip-deps)
                skip_deps=true
                shift
                ;;
            -p|--skip-pm2)
                skip_pm2=true
                shift
                ;;
            --skip-db)
                skip_db=true
                shift
                ;;
            --skip-health)
                skip_health=true
                shift
                ;;
            --pm2-startup)
                setup_startup=true
                shift
                ;;
            -h|--help)
                show_usage
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
    
    print_status "Starting Railway Amenities Application Setup..."
    print_status "Environment: $environment"
    
    # Check prerequisites
    check_node_version
    install_pm2
    
    # Setup environment
    setup_env
    setup_logs
    
    # Install dependencies
    if [ "$skip_deps" = false ]; then
        install_dependencies
    else
        print_warning "Skipping dependency installation"
    fi
    
    # Build application
    if [ "$skip_build" = false ]; then
        build_application
    else
        print_warning "Skipping build process"
    fi
    
    # Database setup
    if [ "$skip_db" = false ]; then
        setup_database
    else
        print_warning "Skipping database setup"
    fi
    
    # Start PM2
    if [ "$skip_pm2" = false ]; then
        start_pm2 "$environment"
    else
        print_warning "Skipping PM2 startup"
    fi
    
    # Setup PM2 startup script
    if [ "$setup_startup" = true ]; then
        setup_pm2_startup
    fi
    
    # Health check
    if [ "$skip_health" = false ]; then
        sleep 3  # Wait a bit for the application to start
        health_check
    else
        print_warning "Skipping health check"
    fi
    
    print_success "Setup completed successfully!"
    print_status "Application should be running on port 3006"
    print_status "Use 'npm run pm2:logs' to view logs"
    print_status "Use 'npm run pm2:status' to check status"
    print_status "Use 'npm run pm2:monitor' for real-time monitoring"
}

# Check if script is run directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi