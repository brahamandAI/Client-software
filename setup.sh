#!/bin/bash

# Amenities RozgarHub Setup Script
# This script installs dependencies, builds the project, and manages PM2 processes

set -e  # Exit on any error

echo "🚀 Starting Amenities RozgarHub setup..."

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

echo "📥 Pulling latest changes from repository..."
git pull origin master

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Check if PM2 is installed globally
if ! command -v pm2 &> /dev/null; then
    echo "📦 PM2 not found. Installing PM2 globally..."
    npm install -g pm2
fi

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building the project..."
npm run build

echo "🛑 Stopping existing PM2 processes..."
pm2 delete ecosystem.config.js 2>/dev/null || echo "No existing PM2 processes found or already stopped."

echo "🚀 Starting PM2 with production config only..."
pm2 start ecosystem.config.js --only amenties-rozgarhub-prod

echo "📋 Showing PM2 status..."
pm2 status

echo "✅ Setup completed successfully!"
echo "🔍 You can monitor your application with: pm2 monit"
echo "📊 Check logs with: pm2 logs"
echo "🔄 Restart with: pm2 restart ecosystem.config.js"