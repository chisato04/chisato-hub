# --- Stage 1: Build the React Frontend ---
FROM node:20-alpine AS builder

# Set the working directory for the frontend build
WORKDIR /app/client


COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# --- Stage 2: Create nginx Image ---
FROM nginx:stable-alpine

# Remove the default Nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy nginx configuration
COPY docker/nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Copy the static build files from the 'builder' stage
COPY --from=builder /app/client/dist /usr/share/nginx/html

# Expose port 80 for the web server
EXPOSE 80