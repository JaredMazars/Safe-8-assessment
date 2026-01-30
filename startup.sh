#!/bin/bash

# Navigate to server directory
cd server

# Install dependencies
echo "Installing dependencies..."
npm install --production

# Start the application
echo "Starting application..."
node index.js
