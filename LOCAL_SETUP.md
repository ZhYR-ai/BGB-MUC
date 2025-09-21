# Local Development Setup (Without Docker)

Since Docker is not available, here's how to run the application locally:

## Prerequisites

1. **Node.js** (v18 or higher)
2. **PostgreSQL** (v13 or higher)
3. **npm** or **yarn**

## Setup Instructions

### 1. Database Setup

First, install and start PostgreSQL:

```bash
# On macOS with Homebrew
brew install postgresql
brew services start postgresql

# Create database and user
createdb event_platform
psql event_platform < database/init.sql
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```env
DATABASE_URL=postgresql://admin:password@localhost:5432/event_platform
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NODE_ENV=development
PORT=4000
```

Start the backend server:

```bash
npm run dev
```

The GraphQL playground will be available at: http://localhost:4000/graphql

### 3. Frontend Setup

Open a new terminal and navigate to the frontend directory:

```bash
cd frontend
npm install
```

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:4000/graphql
```

Start the frontend development server:

```bash
npm run dev
```

The application will be available at: http://localhost:3000

## Testing the Application

1. Open http://localhost:3000 in your browser
2. Register a new account
3. Create some events
4. Test the functionality

## Database Connection Issues

If you encounter database connection issues:

1. Make sure PostgreSQL is running: `brew services list | grep postgresql`
2. Check if the database exists: `psql -l | grep event_platform`
3. Verify connection: `psql postgresql://admin:password@localhost:5432/event_platform`

## Alternative: Using SQLite (Simpler Setup)

If PostgreSQL setup is too complex, we can modify the backend to use SQLite instead. Let me know if you'd prefer this approach.
