#!/bin/bash

# Install Node.js and npm in a temporary container
docker run --rm -it \
  --network ecommerce-platform_backend \
  -v "$(pwd):/app" \
  -w /app \
  node:18 \
  bash -c "
    npm install
    npx prisma generate
    npx prisma db push
  " 