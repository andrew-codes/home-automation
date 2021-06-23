#!/usr/bin/env bash

pushd .
cd ../../
source scripts/bin/vault.sh
set -o allexport
source .external-ports.env
set +o allexport
popd

export MB_KEY=$(vault kv get -format=json cubbyhole/facebox | jq .data.data.mb-key | sed 's/"//g')

kubectl apply -f facebox.yml

yq eval '.spec.ports[0].nodePort=env(EXTERNAL_FACEBOX_PORT)' -i service.yml
kubectl apply -f service.yml
