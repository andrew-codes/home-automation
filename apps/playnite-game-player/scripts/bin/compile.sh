#!/usr/bin/env bash

mkdir -p dist && cp -r src/* dist
cat <<EOL >>dist/secrets.js
export const MQTT_HOST = "$CLUSTER_IP"
export const MQTT_PORT = $EXTERNAL_MQTT_PORT
export const MQTT_USERNAME = "$MQTT_USERNAME"
export const MQTT_PASSWORD = "$MQTT_PASSWORD"
EOL
