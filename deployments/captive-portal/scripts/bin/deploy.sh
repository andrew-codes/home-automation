#!/usr/bin/env bash

pushd .
cd ../../
source scripts/bin/vault.sh
set -o allexport
source .external-ports.env
set +o allexport
popd

export GRAPHQL_API_TOKEN=$(vault kv get -format=json cubbyhole/graphql-api | jq .data.TOKEN | sed 's/"//g')

kubectl apply -f captive-portal.yml

yq eval '.spec.ports[0].nodePort=env(EXTERNAL_CAPTIVE_PORTAL_PORT)' -i service.yml
kubectl apply -f service.yml
