#!/usr/bin/env bash

pushd .
cd ../../
source scripts/bin/vault.sh
popd

export ALEXA_SHOPPING_LIST_SKILL_DNS_USERNAME=$(vault kv get -format=json cubbyhole/alexa-shopping-list-skill | jq .data.dns_username)
export ALEXA_SHOPPING_LIST_SKILL_DNS_PASSWORD=$(vault kv get -format=json cubbyhole/alexa-shopping-list-skill | jq .data.dns_password)
export ALEXA_SHOPPING_LIST_SKILL_DOMAIN=$(vault kv get -format=json cubbyhole/alexa-shopping-list-skill | jq .data.dns-domain)
export INLETS_IP=$(vault kv get -format=json cubbyhole/alexa-shopping-list-skill | jq .data.inlets-ip)

curl -X POST "https://$ALEXA_SHOPPING_LIST_SKILL_DNS_USERNAME:$ALEXA_SHOPPING_LIST_SKILL_DNS_PASSWORD@domains.google.com/nic/update?hostname=$ALEXA_SHOPPING_LIST_SKILL_DOMAIN&myip=$INLETS_IP"
envsubst <"$1" | kubectl apply -f -
