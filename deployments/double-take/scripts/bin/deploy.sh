#!/usr/bin/env bash

pushd .
cd ../../
set -o allexport
source .external-ports.env
set +o allexport
popd

kubectl apply -f double-take.yml

yq eval '.spec.ports[0].nodePort=env(EXTERNAL_DOUBLE_TAKE_PORT)' -i service.yml
kubectl apply -f service.yml
