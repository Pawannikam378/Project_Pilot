FROM node:20-alpine

WORKDIR /app

# Copy dependency definitions
COPY package.json package-lock.json* ./

# Install dependencies cleanly inside the container
RUN npm install

# Copy application code
COPY . .

EXPOSE 5173

# Start the Vite dev server bound to all interfaces so Docker can expose it
CMD ["npm", "run", "dev", "--", "--host"]
