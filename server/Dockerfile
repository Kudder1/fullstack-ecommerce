FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Create static directory if it doesn't exist
RUN mkdir -p static

# Expose port
EXPOSE 5000

# Run migrations and start server
CMD ["sh", "-c", "npm run migrate && node index.js"]
