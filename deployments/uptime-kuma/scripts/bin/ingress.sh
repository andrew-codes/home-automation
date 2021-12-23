#!/usr/bin/env bash

pushd .
cd ../../
source scripts/bin/az-login.sh
popd

export STATUS_DNS_USERNAME=$(az keyvault secret show --vault-name "kv-home-automation" --name "home-assistant-STATUS-DNS-USERNAME" | jq -r '.value')
export STATUS_DNS_PASSWORD=$(az keyvault secret show --vault-name "kv-home-automation" --name "home-assistant-STATUS-DNS-PASSWORD" | jq -r '.value')
export STATUS_DOMAIN=$(az keyvault secret show --vault-name "kv-home-automation" --name "home-assistant-STATUS-DOMAIN" | jq -r '.value')
export INLETS_IP=$(az keyvault secret show --vault-name "kv-home-automation" --name "home-assistant-INLETS-IP" | jq -r '.value')

curl -X POST "https://$STATUS_DNS_USERNAME:$STATUS_DNS_PASSWORD@domains.google.com/nic/update?hostname=$STATUS_DOMAIN&myip=$INLETS_IP"
envsubst <"$1" | kubectl apply -f -
