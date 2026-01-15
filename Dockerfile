# =====================
# Build stage
# =====================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency files first (better cache)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source
COPY . .

# Build Nuxt
RUN npm run build

# =====================
# Runtime stage
# =====================
FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV NITRO_PORT=3000
ENV NITRO_HOST=0.0.0.0

# Copy only built output
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
