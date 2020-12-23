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
