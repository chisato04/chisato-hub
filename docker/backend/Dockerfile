# docker/backend/Dockerfile

# --- Stage 1: Build the Node backend ---
FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Copy package.json and package-lock.json from project root/server
COPY server/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the backend code
COPY server/ ./

# Expose port (optional, if your app listens on a port)
EXPOSE 3001

# Command to run your backend
CMD ["node", "server.js"]
