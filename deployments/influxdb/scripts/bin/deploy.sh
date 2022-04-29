#!/usr/bin/env bash

pushd .
cd ../../
set -o allexport
source .external-ports.env
set +o allexport
popd

yq eval '.spec.ports[0].nodePort=env(EXTERNAL_INFLUXDB_PORT)' -i service.yml

kubectl apply -f deployment.yml
kubectl apply -f service.yml
