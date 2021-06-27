#!/usr/bin/env bash

source ../../secrets.sh

echo "Will Start on Port 8080"

telepresence --swap-deployment "game-player" --docker-run --rm -t -v "$PWD/../../:/app" -e NODE_ENV=development -p "8080:80" "node-app:latest" yarn lerna run start/dev --scope "@ha/game-player-app" --stream <<<$DEV_MACHINE_PASSWORD
