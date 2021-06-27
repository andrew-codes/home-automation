#!/usr/bin/env bash

pushd .
set -o allexport
source .external-ports.env
set +o allexport
popd

kubectl apply -f frigate.yml

yq eval '.spec.ports[0].nodePort=env(EXTERNAL_FRIGATE_PORT)' -i service.yml
yq eval '.spec.ports[1].nodePort=env(EXTERNAL_FRIGATE_RMTP_PORT)' -i service.yml
kubectl apply -f service.yml
