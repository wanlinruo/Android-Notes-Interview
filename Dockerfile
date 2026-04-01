FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate 2>/dev/null || true

EXPOSE 3000

CMD ["npm", "run", "dev"]
