FROM node:20-slim

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Expose agent API port
EXPOSE 8402

# Run the agent backend via tsx
CMD ["npx", "tsx", "src/agent/index.ts"]
