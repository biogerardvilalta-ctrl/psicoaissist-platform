# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

ENV NODE_OPTIONS="--max-old-space-size=4096"

COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies including devDependencies for build
RUN npm ci --legacy-peer-deps

COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production Stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
COPY prisma ./prisma/

# Install only production dependencies
RUN npm ci --only=production --legacy-peer-deps

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3000

# Start command
CMD ["npm", "run", "start:prod"]
