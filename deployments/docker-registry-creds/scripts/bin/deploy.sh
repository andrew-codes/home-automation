#!/usr/bin/env bash

pushd .
cd ../../
source scripts/bin/vault.sh
popd
export USERNAME=$(vault kv get -format=json cubbyhole/docker-registry | jq .data.data.username)
export PASSWORD=$(vault kv get -format=json cubbyhole/docker-registry | jq .data.data.password)
export EMAIL=$(vault kv get -format=json cubbyhole/docker-registry | jq .data.data.email)

kubectl create secret docker-registry regcred --docker-username="$USERNAME" --docker-password="$PASSWORD" --docker-email="$EMAIL" --docker-server="docker-registry"
