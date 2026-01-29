# SkillSync - Docker Configuration

# Stage 1: Build the React frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/client

# Copy package files
COPY client/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY client/ ./

# Build the application
RUN npm run build

# Stage 2: Setup Node.js backend (if needed)
FROM node:18-alpine AS backend-builder

WORKDIR /app/server

# Copy server package files
COPY server/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy server source
COPY server/ ./

# Stage 3: Production image
FROM node:18-alpine

WORKDIR /app

# Install serve to serve static files
RUN npm install -g serve

# Copy built frontend from builder stage
COPY --from=frontend-builder /app/client/dist ./client/dist

# Copy backend (optional, if using)
COPY --from=backend-builder /app/server ./server

# Expose ports
EXPOSE 3000 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start command - serve the built frontend
CMD ["serve", "-s", "client/dist", "-l", "3000"]
