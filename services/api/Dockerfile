FROM node:20-alpine AS base
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@10.11.0

# Copy lockfile and root package.json for dependency resolution
COPY package.json pnpm-lock.yaml* ./

# Copy service-specific package.json
COPY services/api/package.json ./services/api/

# Copy packages needed
COPY packages ./packages

# Install all dependencies (packages and api service)
RUN pnpm install --frozen-lockfile

# Build stage
FROM base AS builder

# Copy all source code
COPY packages ./packages
COPY services/api ./services/api

# Build all required packages
RUN pnpm run build --filter=@contactship/db --filter=@contactship/types --filter=@contactship/telemetry

# Build of api service
RUN pnpm run build --filter=api

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Install pnpm for dependency management
RUN npm install -g pnpm@10.11.0

# Copy lockfile and package.json
COPY package.json pnpm-lock.yaml* ./
COPY services/api/package.json ./services/api/

# Copy packages needed at runtime
COPY packages/db ./packages/db
COPY packages/types ./packages/types
COPY packages/telemetry ./packages/telemetry

# Install only runtime dependencies
RUN pnpm install --prod --frozen-lockfile --filter=api

# Copy built artifacts from builder
COPY --from=builder --chown=nestjs:nodejs /app/services/api/dist ./services/api/dist
COPY --from=builder --chown=nestjs:nodejs /app/packages/db/dist ./packages/db/dist
COPY --from=builder --chown=nestjs:nodejs /app/packages/types/dist ./packages/types/dist
COPY --from=builder --chown=nestjs:nodejs /app/packages/telemetry/dist ./packages/telemetry/dist

# Switch to non-root user
USER nestjs

WORKDIR /app/services/api

EXPOSE 3000

CMD ["node", "dist/main.js"]
