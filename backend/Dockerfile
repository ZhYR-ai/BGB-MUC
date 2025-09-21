FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (include dev deps for nodemon)
# Using npm install to tolerate local lockfile drift during dev
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4000/health || exit 1

# Start the application in dev mode with nodemon for hot reload
CMD ["npm", "run", "dev"]
