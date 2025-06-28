
# Use a specific, minimal base image for reproducibility and security
FROM node:20.17.0-alpine3.20

# Set working directory inside the container
WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./

# Create non-root user and group with explicit UID/GID, combine with chown to reduce layers
RUN addgroup -g 1001 appgroup && \
    adduser -u 1001 -S -G appgroup appuser && \
    chown -R appuser:appgroup /app && \
    chmod -R 755 /app

# Switch to non-root user for security
USER appuser

# Set npm cache to a user-writable directory and install dependencies securely
ENV NPM_CONFIG_CACHE=/tmp/.npm
RUN npm ci --only=production --ignore-scripts && \
    rm -rf /tmp/.npm

# Copy application code with proper ownership
COPY --chown=appuser:appgroup . .

# Expose application port
EXPOSE 3000

# Add healthcheck for monitoring
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

# Run as non-root user with secure command
CMD ["npm", "start"]
