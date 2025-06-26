#!/bin/bash

# Exit on error
set -e

# Start server and client in parallel
(
  cd server
  echo "Starting server..."
  npm install
  npm run dev
) &

(
  cd client
  echo "Starting client..."
  npm install
  npm run dev
) &

wait
