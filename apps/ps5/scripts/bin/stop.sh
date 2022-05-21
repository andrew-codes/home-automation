#!/usr/bin/env bash

echo "Stopping"

telepresence leave ps5 || true
telepresence quit
telepresence uninstall --all-agents
kubectl rollout restart deployment traffic-manager -n ambassador
kubectl rollout restart deployment ps5
