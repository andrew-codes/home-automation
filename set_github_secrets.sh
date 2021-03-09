#!/usr/bin/env bash

source secrets.sh

yarn seal-github-secret andrew-codes home-automation DOCKER_REGISTRY_DOMAIN "$DOCKER_REGISTRY_DOMAIN"
yarn seal-github-secret andrew-codes home-automation JEST_REPORTER_TOKEN "$GITHUB_ACTION_JEST_REPORTER_TOKEN"
yarn seal-github-secret andrew-codes home-automation DOCKER_REGISTRY_USERNAME "$DOCKER_REGISTRY_USERNAME"
yarn seal-github-secret andrew-codes home-automation DOCKER_REGISTRY_PASSWORD "$DOCKER_REGISTRY_PASSWORD"
yarn seal-github-secret andrew-codes home-automation GAMING_ROOM_GAMING_PC_MAC "$GAMING_ROOM_GAMING_PC_MAC"
yarn seal-github-secret andrew-codes home-automation GAMING_ROOM_GAMING_PC_USERNAME "$GAMING_ROOM_GAMING_PC_USERNAME"
yarn seal-github-secret andrew-codes home-automation MACHINE_PASSWORD "$MACHINE_PASSWORD"
yarn seal-github-secret andrew-codes home-automation MQTT_HOST "$CLUSTER_IP"
yarn seal-github-secret andrew-codes home-automation MQTT_PASSWORD "$MQTT_PASSWORD"
yarn seal-github-secret andrew-codes home-automation MQTT_PORT "$EXTERNAL_MQTT_PORT"
yarn seal-github-secret andrew-codes home-automation MQTT_USERNAME "$MQTT_USERNAME"
yarn seal-github-secret andrew-codes home-automation MQTT_CONNECTION "$(
  cat <<EOL
\$MQTT_HOST = "$CLUSTER_IP"
\$MQTT_PORT = $EXTERNAL_MQTT_PORT
\$MQTT_USERNAME = "$MQTT_USERNAME"
\$MQTT_PASSWORD = "$MQTT_PASSWORD"
EOL
)"
