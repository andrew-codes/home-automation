#!/usr/bin/env bash

source ../../secrets.sh

mkdir -p secrets
mkdir -p .secrets

# UNIFI
echo -n "$USG_IP" >.secrets/usg_ip
echo -n "$USG_PORT" >.secrets/usg_port
echo -n "$USG_USERNAME" >.secrets/usg_username
echo -n "$USG_PASSWORD" >.secrets/usg_password
kubectl create secret generic usg-secrets --dry-run=client --namespace="home-automation" --from-file=usg_ip=".secrets/usg_ip" --from-file=usg_port=".secrets/usg_port" --from-file=usg_username=".secrets/usg_username" --from-file=usg_password=".secrets/usg_password" -o json >".secrets/usg-secrets.json"
kubeseal --namespace "home-automation" <".secrets/usg-secrets.json" >"secrets/usg-secrets.json"
rm -rf .secrets/usg_ip
rm -rf .secrets/usg_port
rm -rf .secrets/usg_username
rm -rf .secrets/usg_password
rm -rf .secrets/usg_secrets.json

# HA
echo -n "$HA_TOKEN" >.secrets/ha_token
echo -n "https://$HOME_ASSISTANT_DOMAIN" >.secrets/ha_host
kubectl create secret generic ha-secrets --dry-run=client --namespace="home-automation" --from-file=ha_token=".secrets/ha_token" --from-file=ha_host=".secrets/ha_host" -o json >".secrets/ha-secrets.json"
kubeseal --namespace "home-automation" <".secrets/ha-secrets.json" >"secrets/ha-secrets.json"
rm -rf .secrets/ha_token
rm -rf .secrets/ha-secrets.json
