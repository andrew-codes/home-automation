#!/usr/bin/env bash

echo "Will Start on Port 8123"

docker pull docker-registry:5000/home-assistant:latest
telepresence --swap-deployment "home-assistant" --docker-run --rm -t -v "$PWD/src:/home-assistant-src" -p "8123:8123" "docker-registry:5000/home-assistant:latest"
