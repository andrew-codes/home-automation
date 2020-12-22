#!/usr/bin/env bash

source ../../secrets.sh

mkdir -p secrets
mkdir -p .secrets

# UNIFI
echo -n "$UNIFI_IP" >.secrets/unifi_ip
echo -n "$UNIFI_PORT" >.secrets/unifi_port
echo -n "$UNIFI_USERNAME" >.secrets/unifi_username
echo -n "$UNIFI_PASSWORD" >.secrets/unifi_password
kubectl create secret generic unifi-secrets --dry-run=client --namespace="home-automation" --from-file=unifi_ip=".secrets/unifi_ip" --from-file=unifi_port=".secrets/unifi_port" --from-file=unifi_username=".secrets/unifi_username" --from-file=unifi_password=".secrets/unifi_password" -o json >".secrets/usg-secrets.json"
kubeseal --namespace "home-automation" <".secrets/unifi-secrets.json" >"secrets/unifi-secrets.json"
rm -rf .secrets/unifi_ip
rm -rf .secrets/unifi_port
rm -rf .secrets/unifi_username
rm -rf .secrets/unifi_password
rm -rf .secrets/unifi-secrets.json

# HA
echo -n "$HA_TOKEN" >.secrets/ha_token
echo -n "https://$HOME_ASSISTANT_DOMAIN" >.secrets/ha_host
kubectl create secret generic ha-secrets --dry-run=client --namespace="home-automation" --from-file=ha_token=".secrets/ha_token" --from-file=ha_host=".secrets/ha_host" -o json >".secrets/ha-secrets.json"
kubeseal --namespace "home-automation" <".secrets/ha-secrets.json" >"secrets/ha-secrets.json"
rm -rf .secrets/ha_token
rm -rf .secrets/ha_host
rm -rf .secrets/ha-secrets.json

# GraphQL
echo -n "$GRAPHQL_API_TOKEN" >.secrets/graphql_api_token
kubectl create secret generic graphql-secrets --dry-run=client --namespace="home-automation" --from-file=token=".secrets/graphql_api_token" -o json >".secrets/graphql-secrets.json"
kubeseal --namespace "home-automation" <".secrets/graphql-secrets.json" >"secrets/graphql-secrets.json"
rm -rf .secrets/graphql_api_token
rm -rf .secrets/graphql_host
rm -rf .secrets/graphql-secrets.json
