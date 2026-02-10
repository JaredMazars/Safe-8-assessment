#!/bin/sh
set -e

echo "=== SAFE-8 Application Startup ==="
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "Current directory: $(pwd)"
echo "Directory contents:"
ls -la

# Determine correct path
if [ -d "/home/site/wwwroot" ]; then
    WORKDIR="/home/site/wwwroot"
    echo "Using Azure path: $WORKDIR"
else
    WORKDIR="."
    echo "Using current directory: $WORKDIR"
fi

cd "$WORKDIR"

# Build frontend if not already built
if [ ! -d "dist" ]; then
    echo "Building frontend..."
    npm install
    npm run build
else
    echo "Frontend already built (dist folder exists)"
fi

# Navigate to server directory
if [ -d "server" ]; then
    SERVER_DIR="server"
else
    echo "Error: Cannot find server directory"
    exit 1
fi

echo "Navigating to $SERVER_DIR..."
cd "$SERVER_DIR"

# Install server dependencies if needed
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.package-lock.json" ]; then
    echo "Installing server dependencies..."
    npm cache clean --force || true
    rm -rf node_modules package-lock.json || true
    npm install --legacy-peer-deps --production=false
else
    echo "Server dependencies already installed"
fi

# Start the application
echo "Starting Node.js server..."
export NODE_ENV=production
exec node index.js
