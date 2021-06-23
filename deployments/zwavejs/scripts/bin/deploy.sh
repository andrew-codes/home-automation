#!/usr/bin/env bash

pushd .
cd ../../
set -o allexport
source .external-ports.env
set +o allexport
popd

kubectl apply -f deployment.yml

yq eval '.spec.ports[0].nodePort=env(EXTERNAL_ZWAVE_JS_PORT)' -i service.yml
yq eval '.spec.ports[1].nodePort=env(EXTERNAL_ZWAVE_JS_WS_PORT)' -i service.yml

kubectl apply -f service.yml
