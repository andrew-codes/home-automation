#!/usr/bin/env bash

echo "Stopping"

docker kill $(docker ps -aq)
telepresence leave home-assistant
telepresence quit
telepresence uninstall --all-agents
# kubectl rollout restart deployment traffic-manager -n ambassador
kubectl rollout restart deployment home-assistant
