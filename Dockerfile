# Multi-stage build untuk optimasi ukuran image
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build aplikasi
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install serve untuk serve static files
RUN npm install -g serve

# Copy built assets dari builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080 || exit 1

# Run aplikasi
CMD ["serve", "-s", "dist", "-l", "8080"]
