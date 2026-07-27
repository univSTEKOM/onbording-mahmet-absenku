<<<<<<< HEAD
FROM node:22-alpine
=======
FROM oven/bun:latest AS base
>>>>>>> 87bd640 (feat: update Dockerfiles to oven/bun:latest + simplify README with badges)

WORKDIR /app

# better-sqlite3 needs build tools
RUN apk add --no-cache python3 make g++ sqlite

COPY package.json package-lock.json ./
RUN npm ci --only=production

COPY . .
RUN chmod +x docker-entrypoint.sh

EXPOSE 3001

ENTRYPOINT ["/app/docker-entrypoint.sh"]
