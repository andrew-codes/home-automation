#!/usr/bin/env bash

source ../../secrets.sh

mkdir -p secrets
mkdir -p .secrets

# GraphQL
source ../../external-port-vars.sh
echo -n "$GRAPHQL_API_TOKEN" >.secrets/graphql_api_token
echo -n "$CLUSTER_IP:$EXTERNAL_GRAPHQL_PORT" >.secrets/graphql_host
kubectl create secret generic graphql-secrets --dry-run=client --namespace="home-automation" --from-file=token=".secrets/graphql_api_token" --from-file=host=".secrets/graphql_host" -o json >".secrets/graphql-secrets.json"
kubeseal --namespace "home-automation" <".secrets/graphql-secrets.json" >"secrets/graphql-secrets.json"
rm -rf .secrets/graphql_api_token
rm -rf .secrets/graphql_host
rm -rf .secrets/graphql-secrets.json
