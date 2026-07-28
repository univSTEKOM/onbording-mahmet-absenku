FROM oven/bun:latest AS base

WORKDIR /app

COPY package.json ./
RUN bun install --production

COPY . .
RUN chmod +x docker-entrypoint.sh

EXPOSE 3001

ENTRYPOINT ["/app/docker-entrypoint.sh"]
