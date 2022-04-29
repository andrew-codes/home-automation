#!/usr/bin/env bash

pushd .
cd ../../
set -o allexport
source .external-ports.env
set +o allexport
popd

kubectl apply -f deployment.yml

yq eval '.spec.ports[0].nodePort=env(EXTERNAL_ZIGBEE_2_MQTT_PORT)' -i service.yml

kubectl apply -f service.yml
