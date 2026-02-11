#!/bin/sh
set -e

echo "=== SAFE-8 Application Startup ==="
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "Current directory: $(pwd)"

# Determine correct path for Azure
if [ -d "/home/site/wwwroot" ]; then
    WORKDIR="/home/site/wwwroot"
    echo "✓ Using Azure path: $WORKDIR"
else
    WORKDIR="."
    echo "✓ Using current directory: $WORKDIR"
fi

cd "$WORKDIR"

# Check if frontend is already built
if [ ! -d "dist" ]; then
    echo "⚠ Frontend not built - building now..."
    npm ci --prefer-offline --no-audit
    npm run build
    echo "✓ Frontend build complete"
else
    echo "✓ Frontend already built"
fi

# Navigate to server directory
if [ -d "server" ]; then
    echo "✓ Server directory found"
    cd server
else
    echo "❌ Error: Cannot find server directory"
    exit 1
fi

# Check server dependencies
if [ ! -d "node_modules" ]; then
    echo "Installing server dependencies..."
    # Use npm ci for cleaner, faster installs
    npm ci --prefer-offline --no-audit --omit=dev
    echo "✓ Server dependencies installed"
else
    echo "✓ Server dependencies already installed"
fi

# Set environment and start server
echo "Starting Node.js server in production mode..."
export NODE_ENV=production
export PORT=${PORT:-8080}

# Use exec to replace shell process with node
exec node index.js
