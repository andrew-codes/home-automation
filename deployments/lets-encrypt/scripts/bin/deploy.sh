#!/usr/bin/env bash

pushd .
cd ../../
source scripts/bin/az-login.sh
popd

export EMAIL=$(az keyvault secret show --vault-name "kv-home-automation" --name "lets-encrypt-EMAIL" | jq -r '.value')

envsubst <issuers.yml | kubectl apply -f -
