#!/usr/bin/env bash

pushd .
cd ../../
set -o allexport
source .external-ports.env
set +o allexport
popd

yq eval '.spec.ports[0].nodePort=env(EXTERNAL_CAPTIVE_PORTAL_PORT)' -i service.yml

kubectl apply -f captive-portal.yml
kubectl apply -f service.yml
