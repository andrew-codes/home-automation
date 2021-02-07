#!/usr/bin/env bash

source ../../secrets.sh

mkdir -p secrets
mkdir -p .secrets

# Game Player GraphQL Secrets
echo -n "$CLUSER_IP:30517" >.secrets/graphql-api-url
echo -n "$CLUSTER_IP:30518" >.secrets/graphql-sub-api-url
kubectl create secret generic game-player-secrets --dry-run=client --namespace="home-automation" --from-file=graphql_url=".secrets/graphql-api-url" --from-file=graphql_sub_url=".secrets/graphql-sub-api-url" -o json >".secrets/game-player-secrets.json"
kubeseal --namespace "home-automation" <".secrets/game-player-secrets.json" >"secrets/game-player-secrets.json"
rm -rf secrets/graphql-api-url
rm -rf secrets/graphql-sub-api-url
