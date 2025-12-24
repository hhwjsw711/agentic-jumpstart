# Use Node.js 22 as the base image
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Install ffmpeg for audio/video processing and ImageMagick for thumbnail optimization
RUN apk add --no-cache ffmpeg imagemagick

# Set Node options to prevent encoding issues
ENV NODE_OPTIONS="--no-warnings"

# Copy package files
COPY package*.json ./

# Install dependencies (including devDependencies needed for build)
# Remove package-lock.json to work around npm bug with optional deps across platforms
# (https://github.com/npm/cli/issues/4828) - this ensures correct platform binaries are resolved
RUN rm -f package-lock.json && \
    npm install --legacy-peer-deps && \
    npm cache clean --force

# Copy the rest of the application code
COPY . .

ARG VITE_RECAPTCHA_KEY
ARG VITE_STRIPE_PUBLISHABLE_KEY
ARG VITE_HOST_NAME

# Create vite/preload-helper.js file that TanStack Start expects
# This is a workaround for Vite 7 compatibility in Docker builds
# Vite resolves vite/* as a virtual module, so we create it in multiple possible locations
RUN mkdir -p node_modules/vite && \
    echo 'export function __vitePreload() {}' > node_modules/vite/preload-helper.js && \
    echo 'export function preloadRouteComponent() {}' >> node_modules/vite/preload-helper.js && \
    echo 'export default function() {}' >> node_modules/vite/preload-helper.js && \
    mkdir -p vite && \
    echo 'export function __vitePreload() {}' > vite/preload-helper.js && \
    echo 'export function preloadRouteComponent() {}' >> vite/preload-helper.js && \
    echo 'export default function() {}' >> vite/preload-helper.js

# Build the application
# Ensure we're building for Linux platform
RUN npm run build

# Expose the port your app runs on (adjust if needed)
EXPOSE 4000

# Start the application
CMD ["npm", "start"]
