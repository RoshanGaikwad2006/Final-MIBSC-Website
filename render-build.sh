#!/bin/bash

# Exit on error
set -e

# Install root dependencies
echo "Installing root dependencies..."
npm install

# Install and build client
echo "Installing and building client..."
cd client
npm install
npm run build
cd ..

# Install server dependencies
echo "Installing server dependencies..."
cd server
npm install
cd ..

# Copy client build to server
echo "Copying client build to server..."
# Remove existing public directory if it exists and create a new one
rm -rf server/public
mkdir -p server/public
# Copy build contents
cp -R client/build/* server/public/

echo "Build completed successfully!"
