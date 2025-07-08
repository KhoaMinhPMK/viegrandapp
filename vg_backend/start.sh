#!/bin/bash

# VieGrand Backend Start Script
echo "🚀 Starting VieGrand Backend..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    yarn install
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found, copying from .env.example..."
    cp .env.example .env
    echo "✅ Please configure your .env file before running the application"
fi

# Start the application
echo "🔧 Building and starting application..."
yarn build; yarn start:dev

echo "✅ VieGrand Backend is running!"
echo "📖 API Documentation: http://localhost:3000/api-docs"
echo "🔗 API Base URL: http://localhost:3000/api"
