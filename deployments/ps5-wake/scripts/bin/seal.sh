#!/usr/bin/env bash

source ../../secrets.sh
source ../../external-port-vars.sh

mkdir -p secrets
mkdir -p .secrets

echo -n "$PS5_USER_CREDENTIALS" >.secrets/ps5-user-credentials
echo -n "$CLUSTER_IP" >.secrets/mqtt-host
echo -n "$EXTERNAL_MQTT_PORT" >.secrets/mqtt-port
kubectl create secret generic ps5-wake-secrets --dry-run=client --namespace="home-automation" --from-file=ps5-user-credentials=".secrets/ps5-user-credentials" --from-file=mqtt-host=".secrets/mqtt-host" --from-file=mqtt-port=".secrets/mqtt-port" -o json >".secrets/ps5-secrets.json"
kubeseal --namespace "home-automation" <".secrets/ps5-secrets.json" >"secrets/ps5-secrets.json"
rm -rf .secrets/ps5-secrets.json
rm -rf .secrets/ps5-user-credentials
rm -rf .secrets/mqtt-host
rm -rf .secrets/mqtt-port
