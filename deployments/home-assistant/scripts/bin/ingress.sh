#!/usr/bin/env bash

pushd .
cd ../../
source scripts/bin/vault.sh
popd
export HOME_ASSISTANT_DNS_USERNAME=$(vault kv get -format=json kv/home-assistant | jq .data.HOME_ASSISTANT_DNS_USERNAME | sed -e 's/^"//' -e 's/"$//')
export HOME_ASSISTANT_DNS_PASSWORD=$(vault kv get -format=json kv/home-assistant | jq .data.HOME_ASSISTANT_DNS_PASSWORD | sed -e 's/^"//' -e 's/"$//')
export HOME_ASSISTANT_DOMAIN=$(vault kv get -format=json kv/home-assistant | jq .data.HOME_ASSISTANT_DOMAIN | sed -e 's/^"//' -e 's/"$//')
export INLETS_IP=$(vault kv get -format=json kv/home-assistant | jq .data.INLETS_IP | sed -e 's/^"//' -e 's/"$//')

curl -X POST "https://$HOME_ASSISTANT_DNS_USERNAME:$HOME_ASSISTANT_DNS_PASSWORD@domains.google.com/nic/update?hostname=$HOME_ASSISTANT_DOMAIN&myip=$INLETS_IP"
envsubst <"$1" | kubectl apply -f -
