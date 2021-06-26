#!/usr/bin/env bash

pushd .
cd ../../
source scripts/bin/vault.sh
popd
export USERNAME=$(vault kv get -format=json kv/docker-registry | jq .data.USERNAME | sed 's/"//g')
export PASSWORD=$(vault kv get -format=json kv/docker-registry | jq .data.PASSWORD | sed 's/"//g')
export EMAIL=$(vault kv get -format=json kv/docker-registry | jq .data.EMAIL | sed 's/"//g')

kubectl create secret docker-registry regcred --docker-username="$USERNAME" --docker-password="$PASSWORD" --docker-email="$EMAIL" --docker-server="docker-registry" || true
