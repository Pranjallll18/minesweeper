# Use official Node.js LTS base image
FROM node:14-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Expose app port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
