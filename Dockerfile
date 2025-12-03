FROM node:18-alpine

WORKDIR /app

# Install system dependencies for screenshot capture
RUN apk add --no-cache \
    xvfb \
    x11vnc \
    fluxbox \
    wget \
    chromium \
    chromium-chromedriver

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
