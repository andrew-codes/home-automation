#!/usr/bin/env bash

pushd .
cd ../../
set -o allexport
source .external-ports.env
set +o allexport
popd

jsonnet -J vendor src/dashboards.jsonnet

yq eval '.spec.ports[0].nodePort=env(EXTERNAL_GRAFANA_PORT)' -i service.yml

kubectl apply -f service.yml
