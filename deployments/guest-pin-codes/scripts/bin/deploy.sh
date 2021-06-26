#!/usr/bin/env bash

pushd .
cd ../../
source scripts/bin/vault.sh
popd

export MQTT_USERNAME=$(vault kv get -format=json kv/mqtt | jq .data.USERNAME | sed 's/"//g')
export MQTT_PASSWORD=$(vault kv get -format=json kv/mqtt | jq .data.PASSWORD | sed 's/"//g')
export GOOGLE_CALENDAR_ID=$(vault kv get -format=json kv/home-assistant | jq .data.GOOGLE_CALENDAR_ID | sed 's/"//g')
export GOOGLE_PRIVATE_KEY=$(vault kv get -format=json kv/home-assistant | jq .data.GOOGLE_PRIVATE_KEY | sed 's/"//g')
export GOOGLE_SERVICE_ACCOUNT=$(vault kv get -format=json kv/home-assistant | jq .data.GOOGLE_SERVICE_ACCOUNT | sed 's/"//g')
export DOOR_LOCKS=$(vault kv get -format=json kv/home-assistant | jq .data.DOOR_LOCKS | sed 's/"//g')
export GUEST_LOCK_CODE_EXCLUSIONS=$(vault kv get -format=json kv/home-assistant | jq .data.GUEST_LOCK_CODE_EXCLUSIONS | sed 's/"//g')

kubectl apply -f guest-pin-codes.yml
