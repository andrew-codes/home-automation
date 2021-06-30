#!/usr/bin/env bash

pushd .
cd ../../
source scripts/bin/vault.sh
popd

export EMAIL=$(vault kv get -format=json kv/lets-encrypt | jq .data.EMAIL | sed 's/"//g')

envsubst <issuers.yml | kubectl apply -f -
