#!/usr/bin/env bash

pushd .
cd ../../
set -o allexport
source .external-ports.env
set +o allexport
popd

yq eval '.spec.ports[0].nodePort=env(EXTERNAL_UPTIME_PORT)' -i deployment/service.yml

kubectl apply -f deployment/uptime-kuma.yml
kubectl apply -f deployment/service.yml
kubectl rollout restart deployment uptime-kuma