FROM m.daocloud.io/docker.io/library/node:20-alpine

WORKDIR /app

# Use China npm mirror
RUN npm config set registry https://registry.npmmirror.com

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate 2>/dev/null || true

EXPOSE 3000

CMD ["npm", "run", "dev"]
