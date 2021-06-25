#!/usr/bin/env bash

mkdir -p dist && cp -r src/* dist
cat <<EOL >dist/secrets.js
module.exports = {
    MQTT_HOST : "$MQTT_HOST",
    MQTT_PORT : $MQTT_PORT,
    MQTT_USERNAME : "$MQTT_USERNAME",
    MQTT_PASSWORD : "$MQTT_PASSWORD",
}
EOL
