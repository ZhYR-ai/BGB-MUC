#!/bin/bash

echo "🚀 Setting up Event Management Platform..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Setup backend
echo "📦 Installing backend dependencies..."
cd backend
cp .env.example .env
npm install
if [ $? -ne 0 ]; then
    echo "❌ Backend dependency installation failed"
    exit 1
fi
cd ..

# Setup frontend
echo "📦 Installing frontend dependencies..."
cd frontend
cp .env.example .env
npm install
if [ $? -ne 0 ]; then
    echo "❌ Frontend dependency installation failed"
    exit 1
fi
cd ..

echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Set up PostgreSQL database (see LOCAL_SETUP.md)"
echo "2. Run backend: cd backend && npm run dev"
echo "3. Run frontend: cd frontend && npm run dev"
echo "4. Open http://localhost:3000 in your browser"
