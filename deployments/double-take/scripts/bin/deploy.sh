#!/usr/bin/env bash

pushd .
cd ../../
source scripts/bin/vault.sh
set -o allexport
source .external-ports.env
set +o allexport
popd

export MQTT_USERNAME=$(vault kv get -format=json cubbyhole/mqtt | jq .data.USERNAME | sed 's/"//g')
export MQTT_PASSWORD=$(vault kv get -format=json cubbyhole/mqtt | jq .data.PASSWORD | sed 's/"//g')

kubectl apply -f double-take.yml

source ../../external-port-vars.sh
yq eval '.spec.ports[0].nodePort=env(EXTERNAL_DOUBLE_TAKE_PORT)' -i service.yml
kubectl apply -f service.yml
