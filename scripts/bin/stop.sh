#!/usr/bin/env bash

echo "Stopping Telepresence"

telepresence leave || true
telepresence quit
telepresence uninstall --all-agents
kubectl rollout restart deployment traffic-manager -n ambassador
