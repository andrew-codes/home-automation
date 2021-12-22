#!/usr/bin/env bash

pushd .
cd ../../
source scripts/bin/az-login.sh
popd

export USERNAME=$(az keyvault secret show --vault-name "kv-home-automation" --name "docker-registry-USERNAME")
export PASSWORD=$(az keyvault secret show --vault-name "kv-home-automation" --name "docker-registry-PASSWORD")
export EMAIL=$(az keyvault secret show --vault-name "kv-home-automation" --name "docker-registry-EMAIL")

kubectl delete secret regcred || true
kubectl create secret docker-registry regcred --docker-username="$USERNAME" --docker-password="$PASSWORD" --docker-email="$EMAIL" --docker-server="docker-registry"
