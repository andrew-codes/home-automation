#!/usr/bin/env bash

source ../../secrets.sh

mkdir -p secrets
mkdir -p .secrets

echo "$MQTT_USERNAME" >.secrets/mqtt_username
echo "$MQTT_PASSWORD" >.secrets/mqtt_password
kubectl create secret generic mqtt-secrets --dry-run=client --namespace="home-automation" --from-file=mqtt-username=".secrets/mqtt_username" --from-file=mqtt-password=".secrets/mqtt_password" -o json >".secrets/mqtt-secrets.json"
kubeseal --namespace "home-automation" <".secrets/mqtt-secrets.json" >"secrets/mqtt-secrets.json"
rm -rf .secrets/mqtt_username
rm -rf .secrets/mqtt_password
