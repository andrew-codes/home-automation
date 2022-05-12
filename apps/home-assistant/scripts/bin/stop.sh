#!/usr/bin/env bash

echo "Stopping"

docker kill $(docker ps -f name=home-assistant -q)
telepresence leave home-assistant || true
telepresence quit
telepresence uninstall --all-agents
kubectl rollout restart deployment traffic-manager -n ambassador
kubectl rollout restart deployment home-assistant
