#!/bin/sh
set -e

echo "=== Azure Deployment Build Script ==="

# Clean npm cache
echo "Cleaning npm cache..."
npm cache clean --force || true

# Install root dependencies (frontend)
echo "Installing frontend dependencies..."
rm -rf node_modules package-lock.json || true
npm install --legacy-peer-deps

# Build frontend
echo "Building frontend with Vite..."
npm run build

echo "Frontend build complete - dist folder created"

# Install server dependencies
echo "Installing server dependencies..."
cd server
rm -rf node_modules package-lock.json || true
npm install --legacy-peer-deps --production=false

echo "=== Build Complete ==="
