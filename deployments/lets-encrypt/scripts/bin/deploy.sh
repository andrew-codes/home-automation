#!/usr/bin/env bash

pushd .
cd ../../
source scripts/bin/vault.sh
popd

export EMAIL=$(vault kv get -format=json cubbyhole/lets-encrypt | jq .data.email | sed 's/"//g')

envsubst <issuers.yml | kubectl apply -f -