#!/bin/sh
if [ ! -f .env ]; then
  cp .env.example .env
  echo "✅ .env dibuat dari .env.example"
fi
docker compose "$@"
