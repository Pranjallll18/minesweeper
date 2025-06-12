# Use a secure, minimal base image
FROM node:14-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./

# Create non-root user and group with explicit UID/GID
RUN addgroup -g 1001 appgroup && \
    adduser -u 1001 -S -G appgroup appuser && \
    chown -R appuser:appgroup /app

# Install dependencies safely
USER appuser
ENV NPM_CONFIG_CACHE=/tmp/.npm
RUN npm install --ignore-scripts

# Copy application code with proper ownership
COPY --chown=appuser:appgroup . .

# Expose application port
EXPOSE 3000

# Run as non-root user
CMD ["npm", "start"]