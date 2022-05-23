#!/usr/bin/env bash

pushd .
cd ../../
set -o allexport
source .external-ports.env
set +o allexport
popd

kubectl apply -f deployment/index.yml

yq eval '.spec.ports[0].nodePort=env(EXTERNAL_FRIGATE_PORT)' -i deployment/service.yml
yq eval '.spec.ports[1].nodePort=env(EXTERNAL_FRIGATE_RMTP_PORT)' -i deployment/service.yml
kubectl apply -f deployment/service.yml
