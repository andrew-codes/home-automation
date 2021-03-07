#!/usr/bin/env bash

source ../../secrets.sh

mkdir -p secrets
mkdir -p .secrets

echo -n "$PS5_USER_CREDENTIALS" >.secrets/ps5-user-credentials
kubectl create secret generic ps5-wake-secrets --dry-run=client --namespace="home-automation" --from-file=ps5-user-credentials=".secrets/ps5-user-credentials" -o json >".secrets/ps5-secrets.json"
kubeseal --namespace "home-automation" <".secrets/ps5-secrets.json" >"secrets/ps5-secrets.json"
rm -rf .secrets/ps5-secrets.json
