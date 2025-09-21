# Complete Installation Guide

This guide will help you set up the development environment from scratch on macOS.

## Step 1: Install Prerequisites

### Install Homebrew (Package Manager for macOS)
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### Install Node.js and npm
```bash
# Install Node.js (includes npm)
brew install node

# Verify installation
node --version  # Should show v18 or higher
npm --version   # Should show npm version
```

### Install PostgreSQL
```bash
# Install PostgreSQL
brew install postgresql

# Start PostgreSQL service
brew services start postgresql

# Create a database user (optional, for security)
createuser -s admin
```

## Step 2: Database Setup

### Create Database and Tables
```bash
# Create the database
createdb event_platform

# Run the initialization script
psql event_platform < database/init.sql
```

### Verify Database Setup
```bash
# Connect to database
psql event_platform

# List tables (should show users, events, tags, etc.)
\dt

# Exit
\q
```

## Step 3: Application Setup

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Copy environment file
cp .env.example .env

# Install dependencies
npm install

# Start the backend server
npm run dev
```

The backend will be available at: http://localhost:4000/graphql

### Frontend Setup (Open a new terminal)
```bash
# Navigate to frontend directory
cd frontend

# Copy environment file
cp .env.example .env

# Install dependencies
npm install

# Start the frontend server
npm run dev
```

The frontend will be available at: http://localhost:3000

## Step 4: Test the Application

1. Open http://localhost:3000 in your browser
2. Click "Sign up" to create a new account
3. Fill in your details and register
4. Create a new event
5. Browse events and test the functionality

## Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Kill process on port 4000 (backend)
lsof -ti:4000 | xargs kill -9

# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9
```

**Database connection errors:**
```bash
# Check if PostgreSQL is running
brew services list | grep postgresql

# Restart PostgreSQL if needed
brew services restart postgresql
```

**Permission errors:**
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
```

## Alternative: Quick Setup Script

Run the automated setup script:
```bash
./setup.sh
```

## Development Workflow

1. **Backend development:** Make changes in `backend/src/`
2. **Frontend development:** Make changes in `frontend/src/`
3. **Database changes:** Update `database/init.sql` and recreate database
4. **GraphQL changes:** Update schema in `backend/src/schema.js` and resolvers in `backend/src/resolvers.js`

## Production Deployment

For production deployment, you'll need:
1. A PostgreSQL database (AWS RDS, Heroku Postgres, etc.)
2. A Node.js hosting service (Heroku, Vercel, Railway, etc.)
3. A static hosting service for the frontend (Netlify, Vercel, etc.)

Update the environment variables accordingly for production.
