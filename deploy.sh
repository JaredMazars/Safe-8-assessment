#!/bin/sh
set -e

echo "=== Azure Deployment Build Script ==="

# Install root dependencies (frontend)
echo "Installing frontend dependencies..."
npm install

# Build frontend
echo "Building frontend with Vite..."
npm run build

echo "Frontend build complete - dist folder created"

# Install server dependencies
echo "Installing server dependencies..."
cd server
npm install --production

echo "=== Build Complete ==="
