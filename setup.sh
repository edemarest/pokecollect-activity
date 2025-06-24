#!/bin/bash
# setup.sh - Setup and start the fullstack Pokecollect Activity app
set -e

# 1. Install root dependencies (if any)
echo "Installing root dependencies (if any)..."
if [ -f package.json ]; then
  npm install || true
fi

# 2. Install server dependencies
echo "Installing server dependencies..."
cd server
npm install
cd ..

# 3. Install client dependencies
echo "Installing client dependencies..."
cd client
npm install
cd ..

# 4. Start the server (in the background)
echo "Starting server..."
cd server
npm run dev &
SERVER_PID=$!
cd ..

# 5. Start the client (in the background)
echo "Starting client..."
cd client
npm run dev &
CLIENT_PID=$!
cd ..

# 6. Optionally start Cloudflare Tunnel if cloudflared is installed
echo "Checking for cloudflared..."
if command -v cloudflared >/dev/null 2>&1; then
  echo "Starting Cloudflare Tunnel for http://localhost:3000..."
  cloudflared tunnel --url http://localhost:3000 &
  CF_PID=$!
  echo "Cloudflare Tunnel started."
else
  echo "cloudflared not found. To expose your server, install it: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/"
fi