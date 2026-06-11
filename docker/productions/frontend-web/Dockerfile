# Stage 1: Build static files
FROM oven/bun:1.1-alpine AS build
WORKDIR /app

# ចម្លង file configuration
# ប្រើ wildcards (*) ដើម្បីទាញយកទាំង bun.lockb ឬ bun.lock (បើមាន)
COPY package.json bun.lock* ./

RUN bun install

COPY . .
RUN bun run build

# Stage 2: Serve with Nginx
FROM nginx:stable-alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
COPY default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]