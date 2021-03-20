#!/usr/bin/env bash

source ../../secrets.sh
source ../../external-port-vars.sh

mkdir -p secrets
mkdir -p .secrets

echo -n "$VALHEIM_SERVER_PASSWORD" >.secrets/server-password
kubectl create secret generic valheim-secrets --dry-run=client --namespace="gaming" --from-file=server-password=".secrets/server-password" -o json >".secrets/valheim-secrets.json"
kubeseal --namespace "gaming" <".secrets/valheim-secrets.json" >"secrets/valheim-secrets.json"
rm -rf .secrets/valhiem-secrets.json
rm -rf .secrets/server-password
