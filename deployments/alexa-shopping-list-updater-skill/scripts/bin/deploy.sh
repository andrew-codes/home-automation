#!/usr/bin/env bash

pushd .
cd ../../
source scripts/bin/vault.sh
popd

export MQTT_USERNAME=$(vault kv get -format=json kv/mqtt | jq .data.USERNAME | sed 's/"//g')
export MQTT_PASSWORD=$(vault kv get -format=json kv/mqtt | jq .data.PASSWORD | sed 's/"//g')
export GRAPHQL_API_TOKEN=$(vault kv get -format=json kv/graphql-api | jq .data.TOKEN | sed 's/"//g')

kubectl apply -f alexa-shopping-list-updater-skill.yml
kubectl apply -f service.yml
