#!/usr/bin/env bash

pushd .
cd ../../
source scripts/bin/az-login.sh
popd

export HOME_ASSISTANT_DNS_USERNAME=$(az keyvault secret show --vault-name "kv-home-automation" --name "home-assistant-DNS-USERNAME" | jq -r '.value')
export HOME_ASSISTANT_DNS_PASSWORD=$(az keyvault secret show --vault-name "kv-home-automation" --name "home-assistant-DNS-PASSWORD" | jq -r '.value')
export HOME_ASSISTANT_DOMAIN=$(az keyvault secret show --vault-name "kv-home-automation" --name "home-assistant-DOMAIN" | jq -r '.value')
export INLETS_IP=$(az keyvault secret show --vault-name "kv-home-automation" --name "home-assistant-INLETS-IP" | jq -r '.value')

curl -X POST "https://$HOME_ASSISTANT_DNS_USERNAME:$HOME_ASSISTANT_DNS_PASSWORD@domains.google.com/nic/update?hostname=$HOME_ASSISTANT_DOMAIN&myip=$INLETS_IP"
envsubst <"$1" | kubectl apply -f -
