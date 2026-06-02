FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files
COPY package.json tsconfig.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Copy source
COPY src ./src/

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# --- Production Stage ---
FROM node:20-alpine
WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Health check dependencies
RUN apk add --no-cache curl

EXPOSE 3001

CMD ["node", "dist/app.js"]
