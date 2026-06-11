FROM oven/bun:latest

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install

COPY . .

EXPOSE 19001

CMD ["bunx", "expo", "start"]