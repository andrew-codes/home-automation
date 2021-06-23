#!/usr/bin/env bash

pushd .
cd ../../
source scripts/bin/vault.sh
popd
export USERNAME=$(vault kv get -format=json cubbyhole/docker-registry | jq .data.username | sed 's/"//g')
export PASSWORD=$(vault kv get -format=json cubbyhole/docker-registry | jq .data.password | sed 's/"//g')
export EMAIL=$(vault kv get -format=json cubbyhole/docker-registry | jq .data.email | sed 's/"//g')

kubectl create secret docker-registry regcred --docker-username="$USERNAME" --docker-password="$PASSWORD" --docker-email="$EMAIL" --docker-server="docker-registry"
