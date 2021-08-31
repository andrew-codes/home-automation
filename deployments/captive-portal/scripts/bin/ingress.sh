#!/usr/bin/env bash

pushd .
cd ../../
source scripts/bin/vault.sh
popd
export CAPTIVE_PORTAL_DNS_USERNAME=$(vault kv get -format=json kv/captive-portal | jq .data.CAPTIVE_PORTAL_DNS_USERNAME | sed -e 's/^"//' -e 's/"$//')
export CAPTIVE_PORTAL_DNS_PASSWORD=$(vault kv get -format=json kv/captive-portal | jq .data.CAPTIVE_PORTAL_DNS_PASSWORD | sed -e 's/^"//' -e 's/"$//')
export CAPTIVE_PORTAL_DOMAIN=$(vault kv get -format=json kv/captive-portal | jq .data.DOMAIN | sed -e 's/^"//' -e 's/"$//')
export INLETS_IP=$(vault kv get -format=json kv/captive-portal | jq .data.INLETS_IP | sed -e 's/^"//' -e 's/"$//')

curl -X POST "https://$CAPTIVE_PORTAL_DNS_USERNAME:$CAPTIVE_PORTAL_DNS_PASSWORD@domains.google.com/nic/update?hostname=$CAPTIVE_PORTAL_DOMAIN&myip=$INLETS_IP"
envsubst <"$1" | kubectl apply -f -
