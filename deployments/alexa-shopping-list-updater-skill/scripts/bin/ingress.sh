#!/usr/bin/env bash

pushd .
cd ../../
source scripts/bin/vault.sh
popd

export DNS_USERNAME=$(vault kv get -format=json cubbyhole/alexa-shopping-list-skill | jq .data.DNS_USERNAME)
export DNS_PASSWORD=$(vault kv get -format=json cubbyhole/alexa-shopping-list-skill | jq .data.DNS_PASSWORD)
export DNS_DOMAIN=$(vault kv get -format=json cubbyhole/alexa-shopping-list-skill | jq .data.DNS_DOMAIN)
export INLETS_IP=$(vault kv get -format=json cubbyhole/alexa-shopping-list-skill | jq .data.INLETS_IP)

curl -X POST "https://$DNS_USERNAME:$DNS_PASSWORD@domains.google.com/nic/update?hostname=$DNS_DOMAIN&myip=$INLETS_IP"
envsubst <"$1" | kubectl apply -f -
