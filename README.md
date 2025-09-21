# Event Management Platform

A full-stack web application for managing events, users, and social interactions.

## Tech Stack

- **Database**: GraphQL with PostgreSQL
- **Backend**: Node.js with Apollo Server
- **Frontend**: React with Vite, TypeScript, and Tailwind CSS
- **Containerization**: Docker & Docker Compose

## Project Structure

```
.
├── database/           # GraphQL schema and database setup
├── backend/           # Node.js API server
├── frontend/          # React frontend application
├── docker-compose.yml # Multi-container orchestration
└── README.md
```

## Quick Start

1. Clone the repository
2. Run `docker-compose up --build`
3. Access the application at `http://localhost:3000`

### Password Reset (Development)
- Visit `/forgot-password` and submit your email.
- The backend logs a reset URL to the server console (no SMTP configured).
- Open the URL to set a new password; you will be signed in automatically.

## Features

- User authentication and profiles
- Event creation and management (public/private)
- Tag system for users
- Comment system with threading
- User reporting and blocking
- Admin panel for event management
- Password reset flow (request + reset)

## Database Schema

- **Tags**: id, name
- **Users**: id, firstName, lastName, email, tags[], password, isAdmin, hostedEventsCount
- **Events**: id, name, owner, description, location, participants[], maxParticipants, applicants[], games[], date, isPublic
- **Comments**: id, event, user, content, date, parentComment
