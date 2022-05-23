#!/usr/bin/env bash

pushd .
cd ../../
set -o allexport
source .external-ports.env
set +o allexport
popd

yq eval '.spec.ports[0].nodePort=env(EXTERNAL_CAPTIVE_PORTAL_PORT)' -i service.yml

kubectl apply -f index.yml
kubectl apply -f service.yml

kubectl rollout restart deployment captive-portal
