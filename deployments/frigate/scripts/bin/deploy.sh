#!/usr/bin/env bash

pushd .
cd ../../
source scripts/bin/vault.sh
set -o allexport
source .external-ports.env
set +o allexport
popd

export CLUSTER_IP=$(vault kv get -format=json cubbyhole/k8s | jq .data.data.cluster-ip | sed 's/"//g')
export MQTT_USERNAME=$(vault kv get -format=json cubbyhole/mqtt | jq .data.data.username | sed 's/"//g')
export MQTT_PASSWORD=$(vault kv get -format=json cubbyhole/mqtt | jq .data.data.password | sed 's/"//g')
export FRONT_DOOR_RTSP=$(vault kv get -format=json cubbyhole/frigate | jq .data.data.front-door-rtsp | sed 's/"//g')
export CAR_PORT_DOOR_RTSP=$(vault kv get -format=json cubbyhole/frigate | jq .data.data.car-port-door-rtsp | sed 's/"//g')

kubectl apply -f frigate.yml

yq eval '.spec.ports[0].nodePort=env(EXTERNAL_FRIGATE_PORT)' -i service.yml
yq eval '.spec.ports[1].nodePort=env(EXTERNAL_FRIGATE_RMTP_PORT)' -i service.yml
kubectl apply -f service.yml
