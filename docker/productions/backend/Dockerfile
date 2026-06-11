# Stage 1: Base
FROM oven/bun:1.1-alpine AS base
WORKDIR /app

# Stage 2: Install
FROM base AS install
COPY package.json bun.lockb* ./

RUN apk add --no-cache python3 make g++ gcc
RUN bun install

# Stage 3: Production
FROM base AS production

COPY --from=install /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production
EXPOSE 3000

CMD ["bun", "run", "src/main.ts"]