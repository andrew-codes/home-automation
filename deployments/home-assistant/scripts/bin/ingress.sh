#!/usr/bin/env bash

pushd .
cd ../../
source scripts/bin/vault.sh
popd
export HOME_ASSISTANT_DNS_USERNAME=$(vault kv get -format=json cubbyhole/home-assistant | jq .data.data.home-assistant-dns-username)
export HOME_ASSISTANT_DNS_PASSWORD=$(vault kv get -format=json cubbyhole/home-assistant | jq .data.data.home-assistant-dns-password)
export HOME_ASSISTANT_DOMAIN=$(vault kv get -format=json cubbyhole/home-assistant | jq .data.data.home-assistant-domain)
export INLETS_IP=$(vault kv get -format=json cubbyhole/home-assistant | jq .data.data.inlets-ip)

curl -X POST "https://$HOME_ASSISTANT_DNS_USERNAME:$HOME_ASSISTANT_DNS_PASSWORD@domains.google.com/nic/update?hostname=$HOME_ASSISTANT_DOMAIN&myip=$INLETS_IP"
envsubst <"$1" | kubectl apply -f -
