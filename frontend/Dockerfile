# Frontend Dockerfile (Nuxt 3)
FROM node:20-alpine AS builder

# Accept build arguments
ARG API_URL
ARG BACKEND_URL

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Set environment variables for build
ENV API_URL=${API_URL}
ENV BACKEND_URL=${BACKEND_URL}

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

ENV NODE_ENV=production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy built application from builder
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/.nuxt ./.nuxt
COPY --from=builder /app/nuxt.config.ts ./nuxt.config.ts

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", ".output/server/index.mjs"]
