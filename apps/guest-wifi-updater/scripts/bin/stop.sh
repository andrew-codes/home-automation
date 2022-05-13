#!/usr/bin/env bash

echo "Stopping"

telepresence leave guest-wifi-updater || true
telepresence quit
telepresence uninstall --all-agents
kubectl rollout restart deployment traffic-manager -n ambassador
kubectl rollout restart deployment guest-wifi-updater
