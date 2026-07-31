FROM oven/bun:latest AS builder

WORKDIR /app

COPY package.json ./
RUN bun install

COPY . .

ARG VITE_API_URL=http://localhost:9090
ARG VITE_APP_NAME=AbsenKu
ARG VITE_APP_RELEASE_DATE=2026-07-13
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_APP_NAME=$VITE_APP_NAME
ENV VITE_APP_RELEASE_DATE=$VITE_APP_RELEASE_DATE

RUN bun run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
