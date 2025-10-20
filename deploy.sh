#!/bin/bash
set -e # Exit immediately if a command exits with a non-zero status.

# --- Configuration ---
PROJECT_DIR="$HOME/Documents/GitHub/chisato-hub/client"
# Check app.json or app.config.js for the web.output directory
# Default is web-build, but your command used 'dist'
EXPO_BUILD_OUTPUT_DIR_NAME="dist" # Or "web-build"
BUILD_DIR="$PROJECT_DIR/$EXPO_BUILD_OUTPUT_DIR_NAME"
NGINX_WEB_ROOT="/var/www/chisato-hub/html"
NGINX_USER="http" # Nginx user

echo "--- Starting Frontend Deployment to Nginx ---"

# 1. Navigate to project directory
echo "Changing to project directory: $PROJECT_DIR"
cd "$PROJECT_DIR" || { echo "Failed to change to project directory. Aborting."; exit 1; }

# 2. Build the Expo web application
echo "Building Expo for web..."
npm run build
if [ ! -d "$BUILD_DIR" ]; then
    echo "Expo build output directory ($BUILD_DIR) not found! Aborting."
    exit 1
fi
echo "Build complete. Output in $BUILD_DIR"

# 3. Deploy files to Nginx web root using rsync
echo "Deploying files from $BUILD_DIR to $NGINX_WEB_ROOT..."
sudo rsync -avz --delete "$BUILD_DIR/" "$NGINX_WEB_ROOT/"
# Note the trailing slash on BUILD_DIR to copy its contents.

# 4. Set correct ownership and permissions for Nginx
echo "Setting ownership to $NGINX_USER:$NGINX_USER for $NGINX_WEB_ROOT..."
sudo chown -R "$NGINX_USER:$NGINX_USER" "$NGINX_WEB_ROOT"
echo "Setting directory permissions to 755 and file permissions to 644..."
sudo find "$NGINX_WEB_ROOT" -type d -exec chmod 755 {} \;
sudo find "$NGINX_WEB_ROOT" -type f -exec chmod 644 {} \;

# 5. Test Nginx configuration and reload
echo "Testing Nginx configuration..."
sudo nginx -t || { echo "Nginx configuration test failed. Aborting reload."; exit 1; }
echo "Reloading Nginx..."
sudo systemctl reload nginx

echo "--- Frontend Deployment Complete ---"

echo "Starting Expo development server..."
npm run dev

exit 0

# ssh cachyos test3