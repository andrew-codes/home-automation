#!/usr/bin/env bash

pushd .
cd ../../
source scripts/bin/vault.sh
popd
export USERNAME=$(vault kv get -format=json kv/docker-registry | jq .data.USERNAME | sed -e 's/^"//' -e 's/"$//')
export PASSWORD=$(vault kv get -format=json kv/docker-registry | jq .data.PASSWORD | sed -e 's/^"//' -e 's/"$//')
export EMAIL=$(vault kv get -format=json kv/docker-registry | jq .data.EMAIL | sed -e 's/^"//' -e 's/"$//')

kubectl delete secret regcred || true
kubectl create secret docker-registry regcred --docker-username="$USERNAME" --docker-password="$PASSWORD" --docker-email="$EMAIL" --docker-server="docker-registry"
