#!/usr/bin/env bash

source ../../secrets.sh

mkdir -p secrets
mkdir -p .secrets

echo -n "$FACEBOX_MB_KEY" >.secrets/mb_key
kubectl create secret generic facebox-secrets --dry-run=client --namespace="home-automation" --from-file=mb_key=".secrets/mb_key" -o json >".secrets/facebox-secrets.json"
kubeseal --namespace "home-automation" <".secrets/facebox-secrets.json" >"secrets/facebox-secrets.json"
rm -rf .secrets/mb_key
rm -rf .secrets/facebox-secrets.json
