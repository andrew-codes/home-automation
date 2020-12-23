#!/usr/bin/env bash

source ../../secrets.sh

mkdir -p secrets
mkdir -p .secrets

# MongoDB
echo -n "$MONGODB_ROOT_USERNAME" >.secrets/mongodb-root-username
echo -n "$MONGODB_ROOT_PASSWORD" >.secrets/mongodb-root-password
kubectl create secret generic mongodb-secrets --dry-run=client --namespace="home-automation" --from-file=root-username=".secrets/mongodb-root-username" --from-file=root-password=".secrets/mongodb-root-password" -o json >".secrets/mongodb-secrets.json"
kubeseal --namespace "home-automation" <".secrets/mongodb-secrets.json" >"secrets/mongodb-secrets.json"
rm -rf .secrets/mongodb-root-password
rm -rf .secrets/mongodb-root-username
rm -rf .secrets/redis-secrets.json

# Gaming PC
echo -n "$GAMING_ROOM_GAMING_PC_MAC" >.secrets/gaming-pc-mac
kubectl create secret generic gaming-pc-secrets --dry-run=client --namespace="home-automation" --from-file=mac=".secrets/gaming-pc-mac" -o json >".secrets/gaming-pc-secrets.json"
kubeseal --namespace "home-automation" <".secrets/gaming-pc-secrets.json" >"secrets/gaming-pc-secrets.json"
rm -rf .secrets/gaming-pc-mac
rm -rf .secrets/gaming-pc-secrets.json
