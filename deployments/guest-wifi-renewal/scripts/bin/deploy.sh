#!/usr/bin/env bash

pushd .
cd ../../
source scripts/bin/vault.sh
popd
export MQTT_USERNAME=$(vault kv get -format=json cubbyhole/mqtt | jq .data.username | sed 's/"//g')
export MQTT_PASSWORD=$(vault kv get -format=json cubbyhole/mqtt | jq .data.password | sed 's/"//g')
export GRAPHQL_API_TOKEN=$(vault kv get -format=json cubbyhole/graphql-api | jq .data.token | sed 's/"//g')

kubectl apply -f guest-wifi-renewal.yml
