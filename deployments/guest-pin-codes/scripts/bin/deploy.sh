#!/usr/bin/env bash

pushd .
cd ../../
source scripts/bin/vault.sh
popd

export MQTT_USERNAME=$(vault kv get -format=json cubbyhole/home-assistant | jq .data.mqtt-username | sed 's/"//g')
export MQTT_PASSWORD=$(vault kv get -format=json cubbyhole/home-assistant | jq .data.mqtt-password | sed 's/"//g')
export GOOGLE_CALENDAR_ID=$(vault kv get -format=json cubbyhole/home-assistant | jq .data.google-calendar-id | sed 's/"//g')
export GOOGLE_PRIVATE_KEY=$(vault kv get -format=json cubbyhole/home-assistant | jq .data.google-private-key | sed 's/"//g')
export GOOGLE_SERVICE_ACCOUNT=$(vault kv get -format=json cubbyhole/home-assistant | jq .data.google-service-account | sed 's/"//g')
export DOOR_LOCKS=$(vault kv get -format=json cubbyhole/home-assistant | jq .data.guest-lock-entity-prefixes | sed 's/"//g')
export GUEST_LOCK_CODE_EXCLUSIONS=$(vault kv get -format=json cubbyhole/home-assistant | jq .data.guest-lock-code-exclusions | sed 's/"//g')

kubectl apply -f guest-pin-codes.yml
