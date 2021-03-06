#!/usr/bin/env bash

source ../../secrets.sh

mkdir -p secrets
mkdir -p .secrets

# Game Player GraphQL Secrets
echo -n "$CLUSTER_IP:$EXTERNAL_GRAPHQL_PORT" >.secrets/graphql-api-url
echo -n "$CLUSTER_IP:$EXTERNAL_GRAPHQL_SUB_PORT" >.secrets/graphql-sub-api-url
kubectl create secret generic game-player-secrets --dry-run=client --namespace="home-automation" --from-file=graphql_url=".secrets/graphql-api-url" --from-file=graphql_sub_url=".secrets/graphql-sub-api-url" -o json >".secrets/game-player-secrets.json"
kubeseal --namespace "home-automation" <".secrets/game-player-secrets.json" >"secrets/game-player-secrets.json"
rm -rf .secrets/graphql-api-url
rm -rf .secrets/graphql-sub-api-url
