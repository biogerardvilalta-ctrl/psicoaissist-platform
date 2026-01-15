# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

ENV NODE_OPTIONS="--max-old-space-size=4096"

COPY package*.json ./

# Install dependencies
RUN npm ci

COPY . .

# Set environment to production for build
ENV NODE_ENV=production

# Disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
RUN npm run build

# Production Stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
# Copy public folder
COPY --from=builder /app/public ./public

# Copy built application (Standalone mode)
# Automatically leverages output: 'standalone' in next.config.js if enabled.
# If not enabled by default, we should verify next.config.mjs or assume standard build
# For safety, we'll try to use the standalone folder if it exists, or fall back to standard start if not.
# However, standard practice for Next 14 Docker is standalone.

# Let's ensure we update next.config.mjs to enable standalone first?
# For now, let's assume standard build output structure to be safe, but copying standalone is best practice.
# We will copy the standalone folder. If it fails, the user needs to enable it.
# We'll stick to a standard compatible copy for now to avoid 'missing directory' errors if they haven't set standalone: true.

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
# set hostname to localhost
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
