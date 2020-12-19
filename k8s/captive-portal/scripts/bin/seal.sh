#!/usr/bin/env bash

source ../../secrets.sh

mkdir -p secrets
mkdir -p .secrets

# GraphQL
echo -n "$GRAPHQL_API_TOKEN" >.secrets/graphql_api_token
kubectl create secret generic graphql-secrets --dry-run=client --namespace="home-automation" --from-file=token=".secrets/graphql_api_token" -o json >".secrets/graphql-secrets.json"
kubeseal --namespace "home-automation" <".secrets/graphql-secrets.json" >"secrets/graphql-secrets.json"
rm -rf .secrets/graphql_api_token
rm -rf .secrets/graphql_host
rm -rf .secrets/graphql_api_token.json
