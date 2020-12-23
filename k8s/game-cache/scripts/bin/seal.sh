#!/usr/bin/env bash

source ../../secrets.sh

mkdir -p secrets
mkdir -p .secrets

# Redis
echo -n "$REDIS_PASSWORD" >.secrets/redis-password
kubectl create secret generic redis-secrets --dry-run=client --namespace="home-automation" --from-file=password=".secrets/redis-password" -o json >".secrets/redis-secrets.json"
kubeseal --namespace "home-automation" <".secrets/redis-secrets.json" >"secrets/redis-secrets.json"
rm -rf .secrets/redis-password
rm -rf .secrets/redis-secrets.json

# Gaming PC
echo -n "$GAMING_ROOM_GAMING_PC_MAC" >.secrets/gaming-pc-mac
kubectl create secret generic gaming-pc-secrets --dry-run=client --namespace="home-automation" --from-file=mac=".secrets/gaming-pc-mac" -o json >".secrets/gaming-pc-secrets.json"
kubeseal --namespace "home-automation" <".secrets/gaming-pc-secrets.json" >"secrets/gaming-pc-secrets.json"
rm -rf .secrets/gaming-pc-mac
rm -rf .secrets/gaming-pc-secrets.json
