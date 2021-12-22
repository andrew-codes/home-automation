#!/usr/bin/env bash

pushd .
cd ../../
source scripts/bin/az-login.sh
popd

export USERNAME=$(az keyvault secret show --vault-name "kv-home-automation" --name "docker-registry-USERNAME" | jq -r '.value')
export PASSWORD=$(az keyvault secret show --vault-name "kv-home-automation" --name "docker-registry-PASSWORD" | jq -r '.value')
export EMAIL=$(az keyvault secret show --vault-name "kv-home-automation" --name "docker-registry-EMAIL" | jq -r '.value')

kubectl delete secret regcred || true
kubectl create secret docker-registry regcred --docker-username="$USERNAME" --docker-password="$PASSWORD" --docker-email="$EMAIL" --docker-server="docker-registry"
