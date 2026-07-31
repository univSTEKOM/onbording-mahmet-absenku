#!/usr/bin/env bash
set -euo pipefail

# AbsenKu Production Deploy Script
# Usage:
#   ./deploy.sh              — build + up
#   ./deploy.sh down         — stop all
#   ./deploy.sh logs         — tail logs
#   ./deploy.sh restart      — rebuild + restart backend only
#   ./deploy.sh db:reset     — WARNING: drop + recreate DB, re-seed

COMPOSE_FILE="docker-compose.yml"
PROJECT="absenku"

red()   { printf '\033[0;31m%s\033[0m\n' "$1"; }
green() { printf '\033[0;32m%s\033[0m\n' "$1"; }

check_env() {
  if [ ! -f .env ]; then
    red "ERROR: .env not found. Copy .env.production → .env and fill values."
    exit 1
  fi
  # Check critical vars
  source .env
  if [ "${POSTGRES_PASSWORD:-}" = "CHANGE_ME_strong_random_password_here" ] || \
     [ "${BETTER_AUTH_SECRET:-}" = "CHANGE_ME_min_32_chars_random_string_here!!" ]; then
    red "WARNING: Default production secrets detected in .env!"
    red "Change POSTGRES_PASSWORD and BETTER_AUTH_SECRET before deploying."
    exit 1
  fi
}

cmd_up() {
  check_env
  green "Building and starting services..."
  docker compose -f "$COMPOSE_FILE" --project-name "$PROJECT" up -d --build
  green "Done. Services:"
  docker compose -f "$COMPOSE_FILE" --project-name "$PROJECT" ps
}

cmd_down() {
  docker compose -f "$COMPOSE_FILE" --project-name "$PROJECT" down
  green "Stopped."
}

cmd_logs() {
  docker compose -f "$COMPOSE_FILE" --project-name "$PROJECT" logs -f --tail=100
}

cmd_restart() {
  check_env
  green "Rebuilding and restarting backend..."
  docker compose -f "$COMPOSE_FILE" --project-name "$PROJECT" up -d --build backend
  green "Done."
}

cmd_db_reset() {
  red "DANGER: This will DROP all data and re-seed!"
  read -p "Type 'yes' to confirm: " confirm
  if [ "$confirm" != "yes" ]; then
    red "Aborted."
    exit 0
  fi
  check_env
  docker compose -f "$COMPOSE_FILE" --project-name "$PROJECT" exec backend sh -c \
    "bun --env-file=.env dist/src/reset.js && bun dist/src/migrate.js && bun dist/src/seed/seed.js"
  green "Database reset and re-seeded."
}

case "${1:-up}" in
  up)      cmd_up ;;
  down)    cmd_down ;;
  logs)    cmd_logs ;;
  restart) cmd_restart ;;
  db:reset) cmd_db_reset ;;
  *)
    echo "Usage: $0 {up|down|logs|restart|db:reset}"
    exit 1
    ;;
esac
